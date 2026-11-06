import assert from 'node:assert/strict';
import {
  calcularResumenMensual,
  normalizarNombre,
  obtenerPeriodoDeFecha,
  obtenerRangoDeMes,
  obtenerPersonaPorCorreo,
  validarFechaISO,
  validarMontoEntero,
  validarPeriodo,
} from '../src/servicios/validaciones.js';

assert.equal(normalizarNombre('  VERDULERÍA  '), 'verduleria');
assert.equal(normalizarNombre(' Veterinaria '), 'veterinaria');
assert.equal(normalizarNombre('VETERINARIA'), 'veterinaria');
assert.equal(normalizarNombre('Verduleria'), normalizarNombre('Verdulería'));
assert.notEqual(normalizarNombre('Verde  claro'), normalizarNombre('Verde claro')); 

assert.equal(validarFechaISO('2026-11-06'), '2026-11-06');
assert.throws(() => validarFechaISO('2026-02-30'));
assert.throws(() => validarFechaISO('06/11/2026'));
assert.equal(obtenerPeriodoDeFecha('2026-11-06'), '2026-11');

assert.deepEqual(obtenerRangoDeMes('2026-11'), {
  desde: '2026-11-01',
  hastaSinIncluir: '2026-12-01',
});
assert.deepEqual(obtenerRangoDeMes('2026-12'), {
  desde: '2026-12-01',
  hastaSinIncluir: '2027-01-01',
});
assert.throws(() => validarPeriodo('2026-13'));

assert.equal(validarMontoEntero('12500'), 12500);
assert.throws(() => validarMontoEntero('12500.50'));
assert.throws(() => validarMontoEntero(-100));
assert.equal(validarMontoEntero(0, 'El sueldo', true), 0);
assert.throws(() => validarMontoEntero(-1, 'El sueldo', true));

assert.equal(obtenerPersonaPorCorreo('MAURICIO.ARIEL.BUDA@GMAIL.COM'), 'mauri');
assert.equal(obtenerPersonaPorCorreo('wakeuprodiaz@gmail.com'), 'ro');
assert.equal(obtenerPersonaPorCorreo('otra@gmail.com'), null);

const resumen = calcularResumenMensual({
  mes: { sueldoMauri: 1200000, sueldoRo: 1000000 },
  ingresosAdicionales: [
    { monto: 80000, procedencia: 'Instalación de cámaras' },
    { monto: 70000, procedencia: 'Sobrante anterior' },
  ],
  gastos: [
    { monto: 500000 },
    { monto: 350000 },
    { monto: 500000 },
  ],
});

assert.deepEqual(resumen, {
  sueldoMauri: 1200000,
  sueldoRo: 1000000,
  totalSueldos: 2200000,
  totalIngresosAdicionales: 150000,
  totalIngresos: 2350000,
  totalGastos: 1350000,
  saldoDisponible: 1000000,
});

const resumenNegativo = calcularResumenMensual({
  mes: { sueldoMauri: 500000, sueldoRo: 500000 },
  gastos: [{ monto: 1100000 }],
});
assert.equal(resumenNegativo.saldoDisponible, -100000);

console.log('Pruebas de lógica superadas: normalización, fechas, períodos, importes, responsables y balances.');
