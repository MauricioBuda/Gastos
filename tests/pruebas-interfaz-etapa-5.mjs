import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/estilos.css', import.meta.url), 'utf8');

for (const id of [
  'boton-subvista-movimientos', 'boton-subvista-dashboard', 'boton-subvista-graficos',
  'subvista-movimientos', 'subvista-dashboard', 'subvista-graficos', 'selector-mes',
  'filtro-categoria', 'filtro-persona', 'filtro-medio-pago', 'filtro-monto-minimo',
  'filtro-monto-maximo', 'filtro-fecha-desde', 'filtro-fecha-hasta', 'filtro-orden',
  'grupo-botones-graficos', 'panel-grafico', 'selector-cantidad-meses',
]) {
  assert.ok(html.includes(`id="${id}"`), `Falta el elemento #${id} en HTML.`);
  assert.ok(main.includes(`#${id}`) || main.includes(`'${id}'`) || main.includes(`"${id}"`), `El elemento #${id} no está vinculado al JavaScript.`);
}

assert.match(html, /<link rel="icon" type="image\/png" href="\/favicon\.png"\s*\/>/, 'Debe quedar preparada la línea del favicon.');
assert.match(html, /Últimos 3 meses[\s\S]*Últimos 6 meses[\s\S]*Últimos 12 meses/, 'Debe ofrecer períodos de 3, 6 y 12 meses.');
assert.match(html, /value="categoria-asc"[\s\S]*value="persona-asc"[\s\S]*value="medio-asc"/, 'Debe permitir ordenar por categoría, persona y medio de pago.');
assert.match(html, /data-tipo-grafico="categorias"[\s\S]*data-tipo-grafico="personas"[\s\S]*data-tipo-grafico="medios"[\s\S]*data-tipo-grafico="semanal"[\s\S]*data-tipo-grafico="mensual"[\s\S]*data-tipo-grafico="ingresos-gastos"/, 'Deben estar presentes los seis tipos de gráficos.');
assert.match(main, /function filtrarGastos|filtrarGastos\(gastosMes/, 'La lista debe aplicar filtros combinables.');
assert.match(main, /detenerObservadoresGraficoMensual\(\)/, 'Los observadores históricos deben poder detenerse al salir de gráficos.');
assert.match(main, /let canceladorObservadorGastosGrafico = null;/, 'El cancelador de la consulta mensual debe estar declarado.');
assert.doesNotMatch(main, /\bcancelarObservadorGastosGrafico\b/, 'No debe existir una referencia con el nombre incorrecto del cancelador mensual.');
assert.match(main, /actualizarEstadoBotonesGraficos\(\);[\s\S]{0,180}aria-expanded/, 'Al reabrir Gráficos debe limpiarse la selección anterior.');
assert.match(main, /crearResumenesEvolucionMensual/, 'La evolución mensual debe calcular ingresos, gastos y saldo.');
assert.match(main, /agruparGastosPorSemana/, 'Debe agrupar por semanas.');

const posicionWeb = css.indexOf('CONSULTA, FILTROS Y VISUALIZACIONES - VISTA WEB');
const posicionMobile = css.indexOf('VISTA CELULAR');
assert.ok(posicionWeb > 0 && posicionMobile > posicionWeb, 'Los estilos web deben aparecer antes de los estilos para celular.');
assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, 'Las llaves CSS deben estar balanceadas.');

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((coincidencia) => coincidencia[1]);
assert.equal(ids.length, new Set(ids).size, 'No debe haber IDs HTML duplicados.');

console.log('ETAPA 5: pruebas de estructura de consulta, filtros, gráficos, favicon y CSS superadas.');
