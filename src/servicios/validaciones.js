/**
 * Funciones puras compartidas por los servicios de datos.
 * No importan Firebase: se pueden probar sin conectarse a la base real.
 */

export function normalizarNombre(valor) {
  if (typeof valor !== 'string') return '';

  return valor
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function prepararNombre(valor, etiqueta = 'El nombre') {
  if (typeof valor !== 'string') {
    throw new Error(`${etiqueta} debe ser un texto.`);
  }

  const nombre = valor.trim();
  if (!nombre) {
    throw new Error(`${etiqueta} no puede quedar vacío.`);
  }

  return {
    nombre,
    nombreNormalizado: normalizarNombre(nombre),
  };
}

export function validarMontoEntero(monto, etiqueta = 'El monto', permitirCero = false) {
  const numero = typeof monto === 'string' && monto.trim() !== ''
    ? Number(monto)
    : monto;

  if (!Number.isSafeInteger(numero)) {
    throw new Error(`${etiqueta} debe ser un número entero, sin centavos.`);
  }

  if (permitirCero ? numero < 0 : numero <= 0) {
    throw new Error(permitirCero
      ? `${etiqueta} no puede ser negativo.`
      : `${etiqueta} debe ser mayor que cero.`);
  }

  return numero;
}

export function validarFechaISO(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error('La fecha debe tener el formato AAAA-MM-DD.');
  }

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));

  const fechaExiste = fechaUTC.getUTCFullYear() === anio
    && fechaUTC.getUTCMonth() === mes - 1
    && fechaUTC.getUTCDate() === dia;

  if (!fechaExiste) {
    throw new Error('La fecha ingresada no existe en el calendario.');
  }

  return fecha;
}

export function validarPeriodo(periodo) {
  if (typeof periodo !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)) {
    throw new Error('El período debe tener el formato AAAA-MM.');
  }

  return periodo;
}

export function obtenerRangoDeMes(periodo) {
  validarPeriodo(periodo);
  const [anio, mes] = periodo.split('-').map(Number);
  const siguienteAnio = mes === 12 ? anio + 1 : anio;
  const siguienteMes = mes === 12 ? 1 : mes + 1;
  const mesSiguienteTexto = String(siguienteMes).padStart(2, '0');

  return {
    desde: `${periodo}-01`,
    hastaSinIncluir: `${siguienteAnio}-${mesSiguienteTexto}-01`,
  };
}

export function obtenerPeriodoDeFecha(fecha) {
  validarFechaISO(fecha);
  return fecha.slice(0, 7);
}

export function obtenerFechaLocalActual() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function calcularResumenMensual({ mes = null, gastos = [], ingresosAdicionales = [] } = {}) {
  const sueldoMauri = mes?.sueldoMauri ?? 0;
  const sueldoRo = mes?.sueldoRo ?? 0;

  const totalSueldos = sueldoMauri + sueldoRo;
  const totalIngresosAdicionales = ingresosAdicionales.reduce(
    (acumulado, ingreso) => acumulado + ingreso.monto,
    0,
  );
  const totalGastos = gastos.reduce(
    (acumulado, gasto) => acumulado + gasto.monto,
    0,
  );

  const totalIngresos = totalSueldos + totalIngresosAdicionales;
  const saldoDisponible = totalIngresos - totalGastos;

  return {
    sueldoMauri,
    sueldoRo,
    totalSueldos,
    totalIngresosAdicionales,
    totalIngresos,
    totalGastos,
    saldoDisponible,
  };
}

export function obtenerPersonaPorCorreo(correo) {
  const correoNormalizado = typeof correo === 'string'
    ? correo.trim().toLowerCase()
    : '';

  if (correoNormalizado === 'mauricio.ariel.buda@gmail.com') return 'mauri';
  if (correoNormalizado === 'wakeuprodiaz@gmail.com') return 'ro';
  return null;
}
