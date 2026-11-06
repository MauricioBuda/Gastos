import assert from 'node:assert/strict';
import { calcularResumenMensual } from '../src/servicios/validaciones.js';

const resumenCompleto = calcularResumenMensual({
  mes: { sueldoMauri: 1250000, sueldoRo: 980000 },
  ingresosAdicionales: [
    { monto: 85000, procedencia: 'Instalación de cámaras' },
    { monto: 25000, procedencia: 'Sobrante anterior' },
  ],
  gastos: [
    { monto: 450000 },
    { monto: 320000 },
    { monto: 175000 },
  ],
});

assert.deepEqual(resumenCompleto, {
  sueldoMauri: 1250000,
  sueldoRo: 980000,
  totalSueldos: 2230000,
  totalIngresosAdicionales: 110000,
  totalIngresos: 2340000,
  totalGastos: 945000,
  saldoDisponible: 1395000,
});

const resumenConSueldoPendiente = calcularResumenMensual({
  mes: { sueldoMauri: 1300000, sueldoRo: null },
  ingresosAdicionales: [{ monto: 50000, procedencia: 'Trabajo extra' }],
  gastos: [{ monto: 400000 }],
});

assert.equal(resumenConSueldoPendiente.totalSueldos, 1300000);
assert.equal(resumenConSueldoPendiente.totalIngresosAdicionales, 50000);
assert.equal(resumenConSueldoPendiente.totalGastos, 400000);
assert.equal(resumenConSueldoPendiente.saldoDisponible, 950000);
assert.equal(resumenConSueldoPendiente.sueldoRo, 0);

const resumenNegativo = calcularResumenMensual({
  mes: { sueldoMauri: 500000, sueldoRo: 500000 },
  ingresosAdicionales: [],
  gastos: [{ monto: 1100000 }],
});
assert.equal(resumenNegativo.totalIngresos, 1000000);
assert.equal(resumenNegativo.saldoDisponible, -100000);

const resumenSinDatos = calcularResumenMensual({});
assert.equal(resumenSinDatos.totalSueldos, 0);
assert.equal(resumenSinDatos.totalIngresosAdicionales, 0);
assert.equal(resumenSinDatos.totalGastos, 0);
assert.equal(resumenSinDatos.saldoDisponible, 0);

const resumenConSueldoCero = calcularResumenMensual({
  mes: { sueldoMauri: 0, sueldoRo: 0 },
  gastos: [{ monto: 1 }],
});
assert.equal(resumenConSueldoCero.totalSueldos, 0);
assert.equal(resumenConSueldoCero.saldoDisponible, -1);

console.log('Etapa 4: pruebas de balances mensuales superadas.');
