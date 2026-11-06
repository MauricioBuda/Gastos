import { calcularResumenMensual, validarPeriodo, validarFechaISO } from './validaciones.js';

/** Devuelve una copia de los gastos que cumple todos los filtros activos. */
export function filtrarGastos(gastos = [], filtros = {}) {
  const minimo = filtros.montoMinimo === '' || filtros.montoMinimo == null ? null : Number(filtros.montoMinimo);
  const maximo = filtros.montoMaximo === '' || filtros.montoMaximo == null ? null : Number(filtros.montoMaximo);
  const desde = filtros.fechaDesde || '';
  const hasta = filtros.fechaHasta || '';

  if (minimo !== null && (!Number.isSafeInteger(minimo) || minimo < 0)) throw new Error('El importe mínimo debe ser un número entero igual o mayor que cero.');
  if (maximo !== null && (!Number.isSafeInteger(maximo) || maximo < 0)) throw new Error('El importe máximo debe ser un número entero igual o mayor que cero.');
  if (minimo !== null && maximo !== null && minimo > maximo) throw new Error('El importe mínimo no puede superar al máximo.');
  if (desde) validarFechaISO(desde);
  if (hasta) validarFechaISO(hasta);
  if (desde && hasta && desde > hasta) throw new Error('La fecha inicial no puede ser posterior a la fecha final.');

  const resultado = gastos.filter((gasto) => {
    if (filtros.categoriaId && gasto.categoriaId !== filtros.categoriaId) return false;
    if (filtros.responsable && gasto.responsable !== filtros.responsable) return false;
    if (filtros.medioPagoId && gasto.medioPagoId !== filtros.medioPagoId) return false;
    if (minimo !== null && Number(gasto.monto) < minimo) return false;
    if (maximo !== null && Number(gasto.monto) > maximo) return false;
    if (desde && gasto.fecha < desde) return false;
    if (hasta && gasto.fecha > hasta) return false;
    return true;
  });

  const orden = filtros.orden || 'fecha-desc';
  const nombresCategorias = filtros.nombresCategorias || {};
  const nombresMediosPago = filtros.nombresMediosPago || {};
  const compararTexto = (valorA, valorB) => String(valorA || '').localeCompare(String(valorB || ''), 'es-AR', { sensitivity: 'base' });

  resultado.sort((a, b) => {
    if (orden === 'fecha-asc') return a.fecha.localeCompare(b.fecha);
    if (orden === 'monto-desc') return Number(b.monto) - Number(a.monto);
    if (orden === 'monto-asc') return Number(a.monto) - Number(b.monto);
    if (orden === 'categoria-asc') return compararTexto(nombresCategorias[a.categoriaId] || a.categoriaId, nombresCategorias[b.categoriaId] || b.categoriaId);
    if (orden === 'categoria-desc') return compararTexto(nombresCategorias[b.categoriaId] || b.categoriaId, nombresCategorias[a.categoriaId] || a.categoriaId);
    if (orden === 'persona-asc') return compararTexto(a.responsable, b.responsable);
    if (orden === 'persona-desc') return compararTexto(b.responsable, a.responsable);
    if (orden === 'medio-asc') return compararTexto(nombresMediosPago[a.medioPagoId] || a.medioPagoId, nombresMediosPago[b.medioPagoId] || b.medioPagoId);
    if (orden === 'medio-desc') return compararTexto(nombresMediosPago[b.medioPagoId] || b.medioPagoId, nombresMediosPago[a.medioPagoId] || a.medioPagoId);
    return b.fecha.localeCompare(a.fecha);
  });
  return resultado;
}

export function agruparImportesPor(gastos = [], obtenerClave) {
  const acumulados = new Map();
  for (const gasto of gastos) {
    const clave = obtenerClave(gasto);
    acumulados.set(clave, (acumulados.get(clave) || 0) + Number(gasto.monto || 0));
  }
  return [...acumulados.entries()]
    .map(([clave, monto]) => ({ clave, monto }))
    .sort((a, b) => b.monto - a.monto);
}

export function obtenerPeriodosRecientes(periodoFinal, cantidad) {
  validarPeriodo(periodoFinal);
  if (![3, 6, 12].includes(Number(cantidad))) throw new Error('La comparación mensual debe ser de 3, 6 o 12 meses.');
  const [anioFinal, mesFinal] = periodoFinal.split('-').map(Number);
  const fechaFinal = new Date(anioFinal, mesFinal - 1, 1);
  const periodos = [];
  for (let desplazamiento = Number(cantidad) - 1; desplazamiento >= 0; desplazamiento -= 1) {
    const fecha = new Date(fechaFinal.getFullYear(), fechaFinal.getMonth() - desplazamiento, 1);
    periodos.push(`${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`);
  }
  return periodos;
}

export function crearResumenesEvolucionMensual(periodos, gastos = [], datosMeses = {}, ingresosPorMes = {}) {
  return periodos.map((periodo) => {
    const gastosMes = gastos.filter((gasto) => gasto.fecha?.slice(0, 7) === periodo);
    const resumen = calcularResumenMensual({
      mes: datosMeses[periodo] || null,
      gastos: gastosMes,
      ingresosAdicionales: ingresosPorMes[periodo] || [],
    });
    return { periodo, ...resumen };
  });
}

export function agruparGastosPorSemana(gastos = [], periodo) {
  validarPeriodo(periodo);
  const [anio, mes] = periodo.split('-').map(Number);
  const primerDia = new Date(anio, mes - 1, 1);
  const ultimoDia = new Date(anio, mes, 0);
  const desplazamientoInicial = (primerDia.getDay() + 6) % 7;
  const primerLunes = new Date(anio, mes - 1, 1 - desplazamientoInicial);
  const grupos = new Map();

  for (let lunes = new Date(primerLunes); lunes <= ultimoDia; lunes.setDate(lunes.getDate() + 7)) {
    const clave = `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}-${String(lunes.getDate()).padStart(2, '0')}`;
    grupos.set(clave, { clave, monto: 0, cantidad: 0 });
  }

  for (const gasto of gastos) {
    if (gasto.fecha?.slice(0, 7) !== periodo) continue;
    const [anioGasto, mesGasto, diaGasto] = gasto.fecha.split('-').map(Number);
    const fecha = new Date(anioGasto, mesGasto - 1, diaGasto);
    const desplazamientoLunes = (fecha.getDay() + 6) % 7;
    const lunes = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - desplazamientoLunes);
    const clave = `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}-${String(lunes.getDate()).padStart(2, '0')}`;
    const grupo = grupos.get(clave) || { clave, monto: 0, cantidad: 0 };
    grupo.monto += Number(gasto.monto || 0);
    grupo.cantidad += 1;
    grupos.set(clave, grupo);
  }

  return [...grupos.values()].sort((a, b) => a.clave.localeCompare(b.clave)).map((grupo) => {
    const [anioLunes, mesLunes, diaLunes] = grupo.clave.split('-').map(Number);
    const lunes = new Date(anioLunes, mesLunes - 1, diaLunes);
    const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);
    const desde = new Date(Math.max(lunes.getTime(), primerDia.getTime()));
    const hasta = new Date(Math.min(domingo.getTime(), ultimoDia.getTime()));
    const formato = (fecha) => `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    return { ...grupo, etiqueta: `${formato(desde)} al ${formato(hasta)}` };
  });
}

export function contarFiltrosActivos(filtros = {}) {
  return ['categoriaId', 'responsable', 'medioPagoId', 'montoMinimo', 'montoMaximo', 'fechaDesde', 'fechaHasta']
    .filter((campo) => filtros[campo] !== '' && filtros[campo] !== null && filtros[campo] !== undefined).length;
}
