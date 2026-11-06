import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { validarMontoEntero, validarPeriodo, prepararNombre } from './validaciones.js';
import { asegurarMesExiste } from './meses.js';

function asegurarBaseDeDatos() {
  if (!db) throw new Error('Firebase no está configurado. Revisá el archivo .env.');
}

function referenciaIngresos(periodo) {
  validarPeriodo(periodo);
  return collection(db, 'meses', periodo, 'ingresosAdicionales');
}

function validarIngreso(datos) {
  const monto = validarMontoEntero(datos.monto, 'El monto del ingreso');
  const { nombre: procedencia } = prepararNombre(datos.procedencia, 'La procedencia');
  if (procedencia.length > 300) throw new Error('La procedencia no puede superar los 300 caracteres.');
  return { monto, procedencia };
}

export async function crearIngresoAdicional(periodo, datos) {
  asegurarBaseDeDatos();
  const ingreso = validarIngreso(datos);
  await asegurarMesExiste(periodo);
  const referencia = await addDoc(referenciaIngresos(periodo), {
    ...ingreso,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return referencia.id;
}

export async function editarIngresoAdicional(periodo, id, datos) {
  asegurarBaseDeDatos();
  validarPeriodo(periodo);
  if (typeof id !== 'string' || !id.trim()) throw new Error('Falta el identificador del ingreso.');
  const ingreso = validarIngreso(datos);

  await updateDoc(doc(db, 'meses', periodo, 'ingresosAdicionales', id), {
    ...ingreso,
    actualizadoEn: serverTimestamp(),
  });
}

export async function eliminarIngresoAdicional(periodo, id) {
  asegurarBaseDeDatos();
  validarPeriodo(periodo);
  if (typeof id !== 'string' || !id.trim()) throw new Error('Falta el identificador del ingreso.');
  await deleteDoc(doc(db, 'meses', periodo, 'ingresosAdicionales', id));
}

export async function obtenerIngresosAdicionales(periodo) {
  asegurarBaseDeDatos();
  const resultado = await getDocs(query(referenciaIngresos(periodo), orderBy('creadoEn', 'desc')));
  return resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
}

export function observarIngresosAdicionales(periodo, callback, alError) {
  asegurarBaseDeDatos();
  const consulta = query(referenciaIngresos(periodo), orderBy('creadoEn', 'desc'));
  return onSnapshot(consulta, (resultado) => {
    callback(resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() })));
  }, alError);
}
