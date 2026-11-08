import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { obtenerRangoDeMes, validarFechaISO, validarMontoEntero, obtenerPeriodoDeFecha } from './validaciones.js';

const COLECCION_GASTOS = 'gastos';

function asegurarBaseDeDatos() {
  if (!db) throw new Error('Firebase no está configurado. Revisá el archivo .env.');
}

function validarResponsable(responsable) {
  if (!['mauri', 'ro'].includes(responsable)) {
    throw new Error('Seleccioná quién realizó el gasto: Mauri o Ro.');
  }
}

function validarDatosGasto(datos) {
  const monto = validarMontoEntero(datos.monto, 'El monto');
  const fecha = validarFechaISO(datos.fecha);
  validarResponsable(datos.responsable);

  if (typeof datos.categoriaId !== 'string' || !datos.categoriaId.trim()) {
    throw new Error('Seleccioná una categoría.');
  }
  return {
    monto,
    fecha,
    categoriaId: datos.categoriaId,
    responsable: datos.responsable,
  };
}

async function comprobarCategoriaDeGasto(datos, gastoAnterior = null) {
  const categoriaSinCambios = gastoAnterior?.categoriaId === datos.categoriaId;
  const referencia = doc(db, 'categorias', datos.categoriaId);
  const resultado = await getDoc(referencia);

  if (!resultado.exists()) throw new Error('La categoría seleccionada ya no existe. Actualizá la pantalla.');
  if (!resultado.data().activo && !categoriaSinCambios) {
    throw new Error('La categoría seleccionada ya no está disponible para nuevas cargas.');
  }
}

export async function crearGasto(datos) {
  asegurarBaseDeDatos();
  const gasto = validarDatosGasto(datos);
  await comprobarCategoriaDeGasto(gasto);

  const referencia = await addDoc(collection(db, COLECCION_GASTOS), {
    ...gasto,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  return referencia.id;
}

export async function editarGasto(id, datos) {
  asegurarBaseDeDatos();
  if (typeof id !== 'string' || !id.trim()) throw new Error('Falta el identificador del gasto.');

  const referencia = doc(db, COLECCION_GASTOS, id);
  const existente = await getDoc(referencia);
  if (!existente.exists()) throw new Error('El gasto que intentás editar ya no existe.');

  const gasto = validarDatosGasto(datos);
  await comprobarCategoriaDeGasto(gasto, existente.data());

  await updateDoc(referencia, {
    ...gasto,
    actualizadoEn: serverTimestamp(),
  });

  return {
    id,
    periodoAnterior: obtenerPeriodoDeFecha(existente.data().fecha),
    periodoNuevo: obtenerPeriodoDeFecha(gasto.fecha),
  };
}

export async function eliminarGasto(id) {
  asegurarBaseDeDatos();
  if (typeof id !== 'string' || !id.trim()) throw new Error('Falta el identificador del gasto.');
  await deleteDoc(doc(db, COLECCION_GASTOS, id));
}

function crearConsultaDelMes(periodo) {
  const rango = obtenerRangoDeMes(periodo);
  return query(
    collection(db, COLECCION_GASTOS),
    where('fecha', '>=', rango.desde),
    where('fecha', '<', rango.hastaSinIncluir),
    orderBy('fecha', 'desc'),
  );
}

export async function obtenerGastosDelMes(periodo) {
  asegurarBaseDeDatos();
  const resultado = await getDocs(crearConsultaDelMes(periodo));
  return resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
}

export function observarGastosDelMes(periodo, callback, alError) {
  asegurarBaseDeDatos();
  return onSnapshot(crearConsultaDelMes(periodo), (resultado) => {
    callback(resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() })));
  }, alError);
}

export async function obtenerTodosLosGastos() {
  asegurarBaseDeDatos();
  const resultado = await getDocs(query(collection(db, COLECCION_GASTOS), orderBy('fecha', 'desc')));
  return resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
}

/** Observa los gastos comprendidos entre dos fechas ISO, con límite final exclusivo. */
export function observarGastosEnRango(desde, hastaSinIncluir, callback, alError) {
  asegurarBaseDeDatos();
  const fechaDesde = validarFechaISO(desde);
  const fechaHasta = validarFechaISO(hastaSinIncluir);
  if (fechaDesde >= fechaHasta) throw new Error('El rango de fechas del gráfico no es válido.');
  const consulta = query(
    collection(db, COLECCION_GASTOS),
    where('fecha', '>=', fechaDesde),
    where('fecha', '<', fechaHasta),
    orderBy('fecha', 'desc'),
  );
  return onSnapshot(consulta, (resultado) => {
    callback(resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() })));
  }, alError);
}
