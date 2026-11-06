import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

const ids = [
  'lista-categorias-activas', 'lista-categorias-inactivas',
  'lista-medios-activos', 'lista-medios-inactivos',
  'cantidad-categorias-activas', 'cantidad-categorias-inactivas',
  'cantidad-medios-activos', 'cantidad-medios-inactivos',
];
for (const id of ids) {
  assert.ok(html.includes(`id="${id}"`), `Falta #${id} en index.html.`);
}

const inicio = main.indexOf('function renderizarListaAdministracionCatalogo(');
const fin = main.indexOf('\nfunction crearFilaAdministracionCatalogo(', inicio);
assert.ok(inicio >= 0 && fin > inicio, 'No se encontró renderizarListaAdministracionCatalogo.');
const funcion = main.slice(inicio, fin);
assert.match(funcion, /document\.getElementById\(idContadorActivos\)/, 'El contador activo debe buscarse directamente en el DOM.');
assert.match(funcion, /document\.getElementById\(idContadorInactivos\)/, 'El contador inactivo debe buscarse directamente en el DOM.');
assert.match(funcion, /if \(contadorActivos\) contadorActivos\.textContent/, 'El contador activo debe tener protección antes de escribir textContent.');
assert.match(funcion, /if \(contadorInactivos\) contadorInactivos\.textContent/, 'El contador inactivo debe tener protección antes de escribir textContent.');
assert.doesNotMatch(funcion, /elementos\.cantidad(?:Categorias|Medios)(?:Activas|Inactivas|Activos|Inactivos)/, 'La función no debe depender de referencias cacheadas para los contadores.');
assert.match(funcion, /if \(!contenedorActivos \|\| !contenedorInactivos\)/, 'Debe informar claramente si falta la estructura HTML de las listas.');

console.log('ETAPA 6.1: prueba de regresión de la administración superada.');
