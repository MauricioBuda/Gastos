import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

const ids = [
  'lista-categorias-activas', 'lista-categorias-inactivas',
  'cantidad-categorias-activas', 'cantidad-categorias-inactivas',
];
for (const id of ids) assert.ok(html.includes(`id="${id}"`), `Falta #${id} en index.html.`);

const inicio = main.indexOf('function renderizarListaAdministracionCatalogo(');
const fin = main.indexOf('\nfunction crearIconoOjo(', inicio);
assert.ok(inicio >= 0 && fin > inicio, 'No se encontró renderizarListaAdministracionCatalogo.');
const funcion = main.slice(inicio, fin);
assert.match(funcion, /document\.getElementById\('cantidad-categorias-activas'\)/, 'Debe obtener el contador activo desde el DOM.');
assert.match(funcion, /document\.getElementById\('cantidad-categorias-inactivas'\)/, 'Debe obtener el contador inactivo desde el DOM.');
assert.match(funcion, /if \(contadorActivos\) contadorActivos\.textContent/, 'El contador activo debe comprobarse antes de asignar textContent.');
assert.match(funcion, /if \(contadorInactivos\) contadorInactivos\.textContent/, 'El contador inactivo debe comprobarse antes de asignar textContent.');
assert.match(funcion, /if \(!contenedorActivos \|\| !contenedorInactivos\)/, 'Debe detectar si faltan las listas del catálogo.');
assert.match(main, /function cambiarVisibilidadCategoria\(/, 'Debe existir la acción para mostrar u ocultar categorías.');

console.log('ETAPA 6.1: prueba de regresión de administración superada.');
