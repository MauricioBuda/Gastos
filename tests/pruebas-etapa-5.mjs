import assert from 'node:assert/strict';
import {
  filtrarGastos,
  agruparImportesPor,
  obtenerPeriodosRecientes,
  crearResumenesEvolucionMensual,
  agruparGastosPorSemana,
  contarFiltrosActivos,
} from '../src/servicios/analisis.js';

const gastos = [
  { id: 'a', fecha: '2026-11-02', monto: 12000, categoriaId: 'super', medioPagoId: 'debito', responsable: 'mauri' },
  { id: 'b', fecha: '2026-11-08', monto: 8500, categoriaId: 'nafta', medioPagoId: 'efectivo', responsable: 'ro' },
  { id: 'c', fecha: '2026-11-14', monto: 25000, categoriaId: 'super', medioPagoId: 'debito', responsable: 'ro' },
  { id: 'd', fecha: '2026-10-20', monto: 7000, categoriaId: 'nafta', medioPagoId: 'debito', responsable: 'mauri' },
];

const filtrados = filtrarGastos(gastos, {
  categoriaId: 'super', responsable: 'ro', medioPagoId: 'debito',
  montoMinimo: '20000', montoMaximo: '30000',
  fechaDesde: '2026-11-01', fechaHasta: '2026-11-30', orden: 'fecha-desc',
});
assert.deepEqual(filtrados.map((gasto) => gasto.id), ['c']);
assert.equal(contarFiltrosActivos({ categoriaId: 'super', responsable: 'ro', fechaDesde: '2026-11-01' }), 3);
assert.deepEqual(filtrarGastos(gastos, { orden: 'monto-desc' }).map((gasto) => gasto.id), ['c', 'a', 'b', 'd']);

const catalogosParaOrden = {
  nombresCategorias: { super: 'Supermercado', nafta: 'Nafta' },
  nombresMediosPago: { debito: 'Débito', efectivo: 'Efectivo' },
};
assert.deepEqual(filtrarGastos(gastos, { ...catalogosParaOrden, orden: 'categoria-asc' }).map((gasto) => gasto.id), ['b', 'd', 'a', 'c']);
assert.deepEqual(filtrarGastos(gastos, { ...catalogosParaOrden, orden: 'persona-asc' }).map((gasto) => gasto.id), ['a', 'd', 'b', 'c']);
assert.deepEqual(filtrarGastos(gastos, { ...catalogosParaOrden, orden: 'medio-asc' }).map((gasto) => gasto.id), ['a', 'c', 'd', 'b']);
assert.throws(() => filtrarGastos(gastos, { montoMinimo: '500', montoMaximo: '100' }), /mínimo no puede superar/);
assert.throws(() => filtrarGastos(gastos, { fechaDesde: '2026-11-20', fechaHasta: '2026-11-10' }), /fecha inicial/);

assert.deepEqual(obtenerPeriodosRecientes('2026-11', 3), ['2026-09', '2026-10', '2026-11']);
assert.deepEqual(obtenerPeriodosRecientes('2026-01', 3), ['2025-11', '2025-12', '2026-01']);
assert.equal(obtenerPeriodosRecientes('2026-11', 12).length, 12);
assert.throws(() => obtenerPeriodosRecientes('2026-11', 4), /3, 6 o 12/);

const resumenes = crearResumenesEvolucionMensual(
  ['2026-10', '2026-11'],
  gastos,
  {
    '2026-10': { sueldoMauri: 100000, sueldoRo: 80000 },
    '2026-11': { sueldoMauri: 120000, sueldoRo: 90000 },
  },
  {
    '2026-10': [{ monto: 10000 }, { monto: 5000 }],
    '2026-11': [{ monto: 20000 }],
  },
);
assert.deepEqual(resumenes.map(({ periodo, totalIngresos, totalGastos, saldoDisponible }) => ({ periodo, totalIngresos, totalGastos, saldoDisponible })), [
  { periodo: '2026-10', totalIngresos: 195000, totalGastos: 7000, saldoDisponible: 188000 },
  { periodo: '2026-11', totalIngresos: 230000, totalGastos: 45500, saldoDisponible: 184500 },
]);

const semanas = agruparGastosPorSemana(gastos, '2026-11');
assert.ok(semanas.length >= 4 && semanas.length <= 6);
assert.equal(semanas.reduce((suma, semana) => suma + semana.monto, 0), 45500);
assert.ok(semanas.every((semana) => semana.etiqueta.includes(' al ')));

const porCategoria = agruparImportesPor(gastos.filter((gasto) => gasto.fecha.startsWith('2026-11')), (gasto) => gasto.categoriaId);
assert.deepEqual(porCategoria, [
  { clave: 'super', monto: 37000 },
  { clave: 'nafta', monto: 8500 },
]);

console.log('ETAPA 5: todas las pruebas de filtros y análisis fueron superadas.');
