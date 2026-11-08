import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, main, css] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/estilos.css', import.meta.url), 'utf8'),
]);

assert.match(html, /<dialog class="contenedor-notificaciones" id="contenedor-notificaciones"/, 'Las notificaciones deben utilizar un diálogo modal.');
assert.match(html, /id="dialogo-confirmacion"/, 'Debe existir el diálogo personalizado de confirmación.');
assert.doesNotMatch(html, /id="estado-operacion"/, 'No debe quedar el banner fijo de operaciones.');
assert.doesNotMatch(main, /window\.(confirm|alert)\s*\(/, 'No deben quedar alertas o confirmaciones nativas del navegador.');
assert.match(main, /function solicitarConfirmacion\(/, 'Debe existir una función centralizada de confirmación.');
assert.match(main, /function mostrarEstadoOperacion\(/, 'Debe existir un sistema centralizado de notificaciones.');
assert.match(main, /contenedor\.showModal\(\)/, 'Las notificaciones deben presentarse sobre el contenido.');
assert.match(css, /\.dialogo-confirmacion::backdrop[^\{]*\{[^}]*backdrop-filter:\s*blur\(/s, 'El diálogo de confirmación debe desenfocar el fondo.');
assert.match(css, /\.contenedor-notificaciones\s*\{[^}]*inset:\s*0/s, 'El diálogo de notificaciones debe ocupar el área de centrado.');
assert.match(css, /\.contenedor-notificaciones::backdrop[^\{]*\{[^}]*backdrop-filter:\s*blur\(/s, 'Las notificaciones deben desenfocar el fondo.');
assert.ok(css.indexOf('VISTA WEB / ESCRITORIO') < css.indexOf('VISTA CELULAR'), 'La sección web debe preceder a la sección celular.');
assert.match(css, /@media\s*\(max-width:\s*700px\)/, 'Deben existir adaptaciones móviles.');

console.log('Etapa 4.1: notificaciones, diálogos y experiencia visual superadas.');
