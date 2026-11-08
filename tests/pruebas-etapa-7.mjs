import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filtrarGastos, crearResumenesEvolucionMensual } from '../src/servicios/analisis.js';
import { normalizarNombre } from '../src/servicios/validaciones.js';

const [html, main, catalogos, gastosServicio, reglas, css] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/servicios/catalogos.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/servicios/gastos.js', import.meta.url), 'utf8'),
  readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
  readFile(new URL('../src/estilos.css', import.meta.url), 'utf8'),
]);

// 1. Los campos históricos de medio de pago no modifican filtros ni totales.
const gastos = [
  { id: 'viejo-1', fecha: '2026-11-02', monto: 12000, categoriaId: 'alquiler', responsable: 'mauri', medioPagoId: 'debito' },
  { id: 'viejo-2', fecha: '2026-11-03', monto: 8000, categoriaId: 'nafta', responsable: 'ro', medioPagoId: 'efectivo' },
  { id: 'nuevo', fecha: '2026-11-04', monto: 5000, categoriaId: 'nafta', responsable: 'mauri' },
];
assert.deepEqual(
  filtrarGastos(gastos, { responsable: 'mauri' }).map((item) => item.id),
  ['nuevo', 'viejo-1'],
  'Los gastos antiguos se consultan sin filtrar por su medio de pago histórico.',
);
const sinMedio = gastos.map(({ medioPagoId, ...item }) => item);
assert.deepEqual(
  filtrarGastos(gastos, { orden: 'monto-desc' }).map(({ id }) => id),
  filtrarGastos(sinMedio, { orden: 'monto-desc' }).map(({ id }) => id),
  'Los campos históricos no deben alterar el ordenamiento.',
);
const resumenes = crearResumenesEvolucionMensual(['2026-11'], gastos, {
  '2026-11': { sueldoMauri: 100000, sueldoRo: 90000 },
});
assert.equal(resumenes[0].totalGastos, 25000, 'El cálculo de gastos debe ignorar campos históricos de pago.');
assert.equal(resumenes[0].saldoDisponible, 165000, 'El saldo mensual no debe depender del medio de pago.');

// 2. Normalización de nombres y reglas de categorías nuevas.
assert.equal(normalizarNombre('  VETERINARÍA  '), 'veterinaria');
assert.equal(normalizarNombre('Verduleria'), normalizarNombre('Verdulería'));
assert.match(catalogos, /visibleEnFormulario: false/, 'Una categoría ingresada mediante el formulario debe nacer oculta.');
assert.match(catalogos, /if \(id === 'otros'\) throw new Error/, 'La opción para agregar otra categoría debe permanecer visible.');
assert.match(main, /opcionesVisibles\.sort\([\s\S]*if \(a\.id === 'otros'\) return 1/, 'La opción Agregar otra categoría debe ordenarse al final del selector.');
assert.match(main, /item\.id === 'otros' \? 'Agregar otra categoría'/, 'La interfaz debe reemplazar el texto antiguo de la opción especial.');
assert.match(main, /crearIconoOjo\(/, 'La administración debe mostrar el control de visibilidad.');
assert.match(main, /actualizarVisibilidadCategoria\(/, 'El ojo debe guardar su estado en Firestore.');

// 3. El catálogo de medios de pago no debe utilizarse desde el cliente.
assert.doesNotMatch(html, /medio.?pago|mediosPago/i, 'No debe quedar interfaz de medios de pago.');
assert.doesNotMatch(main, /medio.?pago|mediosPago|indicesMediosPago/i, 'La aplicación no debe consultar ni mostrar medios de pago.');
assert.doesNotMatch(catalogos, /collection\(db,\s*['"]mediosPago|indicesMediosPago/, 'El servicio de catálogos no debe leer ni escribir medios de pago.');
assert.doesNotMatch(gastosServicio, /medioPagoId/, 'Las nuevas operaciones de gastos no deben usar el medio histórico.');
assert.match(reglas, /medioPagoId se admite únicamente para conservar el dato histórico/i, 'Las reglas deben documentar la compatibilidad histórica.');
assert.match(reglas, /allow create:[\s\S]*?!\('medioPagoId' in request\.resource\.data\.keys\(\)\)/, 'Las reglas deben rechazar medios de pago en gastos nuevos.');
assert.match(reglas, /request\.resource\.data\.get\('medioPagoId', null\) == resource\.data\.get\('medioPagoId', null\)/, 'La edición de gastos antiguos debe conservar intacto el campo histórico.');
assert.doesNotMatch(reglas, /match \/mediosPago|match \/indicesMediosPago/, 'Las colecciones históricas no deben seguir expuestas por reglas del cliente.');

// 4. Ingresos adicionales: no mostrar la tarjeta ni un cero cuando no hay registros.
assert.match(html, /id="tarjeta-ingresos-adicionales" hidden/, 'La tarjeta resumen debe iniciar oculta.');
assert.match(main, /tarjetaIngresosAdicionales\.hidden = ingresosAdicionales\.length === 0/, 'La tarjeta solo debe mostrarse cuando existen ingresos.');
assert.match(main, /cantidadIngresosAdicionales\.hidden = ingresosAdicionales\.length === 0/, 'No debe verse el contador cero.');
assert.match(main, /listaIngresosAdicionales\.hidden = true/, 'La lista vacía no debe ocupar espacio.');

// 5. Avisos centrales, con fondo desenfocado, y compatibilidad responsiva.
assert.match(html, /<dialog class="contenedor-notificaciones"/, 'Los avisos deben ser diálogos centrales.');
assert.match(css, /\.contenedor-notificaciones\s*\{[^}]*inset:\s*0[\s\S]*place-items:\s*center/s, 'Los avisos deben quedar centrados vertical y horizontalmente.');
assert.match(css, /\.contenedor-notificaciones::backdrop[^\{]*\{[^}]*backdrop-filter:\s*blur\(/s, 'El fondo debe quedar desenfocado mientras aparece el aviso.');
assert.match(main, /setTimeout\(retirarNotificacion, 3000\)/, 'Los avisos de resultado deben durar tres segundos.');

// 6. Estructura y CSS: escritorio primero, móvil después, IDs únicos.
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, 'No debe haber IDs duplicados.');
assert.ok(css.indexOf('VISTA WEB / ESCRITORIO') < css.indexOf('VISTA CELULAR'), 'CSS web debe preceder a CSS móvil.');
assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, 'Las llaves CSS deben estar balanceadas.');

console.log('ETAPA 7: medios de pago retirados, categorías con visibilidad, ingresos condicionales y avisos centrados superados.');
