import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, main, css] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/estilos.css', import.meta.url), 'utf8'),
]);

assert.match(html, /id="contenedor-notificaciones"/, 'Debe existir el contenedor de notificaciones.');
assert.match(html, /id="dialogo-confirmacion"/, 'Debe existir el diálogo personalizado de confirmación.');
assert.doesNotMatch(html, /id="estado-operacion"/, 'No debe quedar el banner fijo de operaciones.');
assert.doesNotMatch(main, /window\.(confirm|alert)\s*\(/, 'No deben quedar alertas o confirmaciones nativas del navegador.');
assert.match(main, /function solicitarConfirmacion\(/, 'Debe existir una función centralizada de confirmación.');
assert.match(main, /function mostrarEstadoOperacion\(/, 'Debe existir un sistema centralizado de notificaciones.');
assert.match(main, /mostrarEstadoOperacion\(''\)/, 'La preparación inicial debe limpiar el aviso de carga sin mostrar un mensaje permanente.');
assert.match(css, /\.dialogo-confirmacion::backdrop[^\{]*\{[^}]*backdrop-filter:\s*blur\(/s, 'El diálogo debe desenfocar el fondo.');
assert.match(css, /\.contenedor-notificaciones\s*\{/, 'Deben existir estilos para los avisos emergentes.');
assert.ok(css.indexOf('VISTA WEB / ESCRITORIO') < css.indexOf('VISTA CELULAR'), 'La sección web debe preceder a la sección celular.');
assert.match(css, /@media\s*\(max-width:\s*700px\)/, 'Deben existir adaptaciones móviles.');

console.log('Etapa 4.1: pruebas de notificaciones, confirmaciones y organización visual superadas.');
