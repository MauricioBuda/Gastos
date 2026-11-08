import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/estilos.css', import.meta.url), 'utf8');
const catalogos = await readFile(new URL('../src/servicios/catalogos.js', import.meta.url), 'utf8');

for (const id of [
  'boton-administrar-catalogos', 'dialogo-administracion-catalogos', 'boton-cerrar-administracion',
  'panel-admin-categorias', 'formulario-nueva-categoria', 'nombre-nueva-categoria',
  'lista-categorias-activas', 'lista-categorias-inactivas',
  'cantidad-categorias-activas', 'cantidad-categorias-inactivas',
]) {
  assert.ok(html.includes(`id="${id}"`), `Falta #${id} en HTML.`);
}

for (const metodo of ['editarCategoria', 'eliminarCategoria', 'actualizarVisibilidadCategoria']) {
  assert.ok(main.includes(`${metodo},`), `Falta importar ${metodo}.`);
  assert.ok(main.includes(`${metodo}(`), `Falta utilizar ${metodo}.`);
}
assert.match(main, /crearIconoOjo\(/, 'Cada categoría administrable debe tener un control de visibilidad.');
assert.match(main, /aria-pressed/, 'El ojo debe exponer su estado de visibilidad.');
assert.match(main, /item\.id === 'otros' \? 'Agregar otra categoría'/, 'La opción especial debe mostrarse como Agregar otra categoría.');
assert.match(main, /visibleEnFormulario !== false/, 'Las categorías nuevas ocultas deben excluirse del selector.');
assert.match(catalogos, /visibleEnFormulario: false/, 'Las categorías nuevas deben crearse ocultas por defecto.');
assert.match(catalogos, /if \(id === 'otros'\) throw new Error/, 'La opción especial no debe poder ocultarse.');
assert.match(catalogos, /if \(datosActuales\.protegida\) throw new Error/, 'El servicio debe impedir editar categorías protegidas.');
assert.match(catalogos, /if \(datos\.protegida\) throw new Error/, 'El servicio debe impedir eliminar categorías protegidas.');
assert.match(catalogos, /activo: false[\s\S]*actualizadoEn: serverTimestamp\(\)/, 'La eliminación debe conservar el documento mediante baja lógica.');
assert.match(catalogos, /transaccion\.update\(referenciaExistente, \{[\s\S]*activo: true/, 'Una categoría inactiva debe poder recuperarse.');
assert.doesNotMatch(main, /(?:editar|eliminar|crearOReactivar)MedioPago|observarMediosPago/, 'La aplicación ya no debe administrar medios de pago.');
assert.doesNotMatch(html, /mediosPago|medio.?pago/i, 'La interfaz no debe ofrecer medios de pago.');
assert.match(css, /dialogo-administracion-catalogos::backdrop[\s\S]*backdrop-filter: blur/, 'La administración debe desenfocar el fondo.');
assert.match(html, /href="\/favicon\.png"/, 'Debe conservarse la referencia al favicon.');

const todosIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((coincidencia) => coincidencia[1]);
assert.equal(todosIds.length, new Set(todosIds).size, 'No debe haber IDs duplicados.');

console.log('ETAPA 6: pruebas de administración exclusiva de categorías superadas.');
