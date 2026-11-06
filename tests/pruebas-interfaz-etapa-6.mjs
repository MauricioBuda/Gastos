import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/estilos.css', import.meta.url), 'utf8');
const catalogos = await readFile(new URL('../src/servicios/catalogos.js', import.meta.url), 'utf8');

const ids = [
  'boton-administrar-catalogos', 'dialogo-administracion-catalogos', 'boton-cerrar-administracion',
  'boton-admin-categorias', 'boton-admin-medios', 'panel-admin-categorias', 'panel-admin-medios',
  'formulario-nueva-categoria', 'nombre-nueva-categoria', 'lista-categorias-activas',
  'lista-categorias-inactivas', 'formulario-nuevo-medio', 'nombre-nuevo-medio',
  'lista-medios-activos', 'lista-medios-inactivos', 'cantidad-categorias-inactivas',
  'cantidad-medios-inactivos',
];
for (const id of ids) {
  assert.ok(html.includes(`id="${id}"`), `Falta #${id} en HTML.`);
  assert.ok(main.includes(`#${id}`), `Falta vincular #${id} en JavaScript.`);
}

for (const metodo of ['editarCategoria', 'eliminarCategoria', 'editarMedioPago', 'eliminarMedioPago']) {
  assert.ok(main.includes(`${metodo},`), `Falta importar ${metodo}.`);
  assert.ok(main.includes(`${metodo}(`), `Falta utilizar ${metodo}.`);
}
assert.match(main, /solicitarConfirmacion\([\s\S]*?titulo: `Editar \$\{etiqueta\}`/, 'La edición del catálogo debe pedir confirmación.');
assert.match(main, /solicitarConfirmacion\([\s\S]*?titulo: `Eliminar \$\{etiqueta\}`/, 'La eliminación del catálogo debe pedir confirmación.');
assert.match(main, /crearOReactivarCategoria\(item\.nombre\)[\s\S]*crearOReactivarMedioPago\(item\.nombre\)/, 'Debe permitir recuperar elementos eliminados.');
assert.match(catalogos, /if \(datosActuales\.protegida\) throw new Error\('Esta opción es fija y no se puede editar\.'\)/, 'El servicio debe impedir editar elementos protegidos.');
assert.match(catalogos, /if \(datos\.protegida\) throw new Error\('Esta opción es fija y no se puede eliminar\.'\)/, 'El servicio debe impedir eliminar elementos protegidos.');
assert.match(catalogos, /nombreNormalizado/, 'El catálogo debe persistir el nombre normalizado.');
assert.match(catalogos, /id: 'otros', nombre: 'Otros', orden: 90, protegida: true/, 'La categoría Otros debe permanecer protegida.');
assert.match(catalogos, /id: 'efectivo', nombre: 'Efectivo', orden: 10, protegida: true/, 'Efectivo debe permanecer protegido.');
assert.match(catalogos, /id: 'debito', nombre: 'Débito', orden: 20, protegida: true/, 'Débito debe permanecer protegido.');
assert.match(catalogos, /id: 'otros', nombre: 'Otros', orden: 30, protegida: true/, 'Otros como medio de pago debe permanecer protegido.');
assert.match(catalogos, /activo: false[\s\S]*actualizadoEn: serverTimestamp\(\)/, 'La eliminación debe conservar el documento y aplicar baja lógica.');
assert.match(catalogos, /transaccion\.update\(referenciaExistente, \{[\s\S]*activo: true/, 'La opción inactiva debe poder reactivarse.');
assert.doesNotMatch(main, /\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/, 'No deben utilizarse diálogos nativos del navegador.');
assert.match(css, /dialogo-administracion-catalogos::backdrop[\s\S]*backdrop-filter: blur/, 'El diálogo de administración debe desenfocar el fondo.');
assert.match(html, /href="\/favicon\.png"/, 'Debe conservarse la referencia al favicon.');

const posicionWeb = css.indexOf('ADMINISTRACIÓN DE CATEGORÍAS Y MEDIOS - VISTA WEB');
const posicionMobile = css.indexOf('VISTA CELULAR');
assert.ok(posicionWeb > 0 && posicionMobile > posicionWeb, 'Los estilos web deben estar antes que los móviles.');
assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, 'Las llaves CSS deben estar balanceadas.');
const todosIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(todosIds.length, new Set(todosIds).size, 'No debe haber IDs duplicados.');

console.log('ETAPA 6: pruebas de administración de categorías y medios de pago superadas.');
