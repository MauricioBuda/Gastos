import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { validarMontoEntero, validarPeriodo } from './validaciones.js';

const COLECCION_MESES = 'meses';

function asegurarBaseDeDatos() {
  if (!db) throw new Error('Firebase no está configurado. Revisá el archivo .env.');
}

function referenciaMes(periodo) {
  validarPeriodo(periodo);
  return doc(db, COLECCION_MESES, periodo);
}

/** Crea el documento mensual mínimo si todavía no existe. */
export async function asegurarMesExiste(periodo) {
  asegurarBaseDeDatos();
  const referencia = referenciaMes(periodo);

  await runTransaction(db, async (transaccion) => {
    const mes = await transaccion.get(referencia);
    if (mes.exists()) return;

    transaccion.set(referencia, {
      periodo,
      observacionSaldo: '',
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  });
}

export async function obtenerMes(periodo) {
  asegurarBaseDeDatos();
  const referencia = referenciaMes(periodo);
  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    return {
      id: periodo,
      periodo,
      sueldoMauri: null,
      sueldoRo: null,
      observacionSaldo: '',
      existeEnBase: false,
    };
  }

  return {
    id: resultado.id,
    ...resultado.data(),
    sueldoMauri: resultado.data().sueldoMauri ?? null,
    sueldoRo: resultado.data().sueldoRo ?? null,
    observacionSaldo: resultado.data().observacionSaldo ?? '',
    existeEnBase: true,
  };
}

export function observarMes(periodo, callback, alError) {
  asegurarBaseDeDatos();
  const referencia = referenciaMes(periodo);

  return onSnapshot(referencia, (resultado) => {
    if (!resultado.exists()) {
      callback({
        id: periodo,
        periodo,
        sueldoMauri: null,
        sueldoRo: null,
        observacionSaldo: '',
        existeEnBase: false,
      });
      return;
    }

    const datos = resultado.data();
    callback({
      id: resultado.id,
      ...datos,
      sueldoMauri: datos.sueldoMauri ?? null,
      sueldoRo: datos.sueldoRo ?? null,
      observacionSaldo: datos.observacionSaldo ?? '',
      existeEnBase: true,
    });
  }, alError);
}

export async function guardarSueldo(periodo, persona, montoIngresado) {
  asegurarBaseDeDatos();
  const monto = validarMontoEntero(montoIngresado, 'El sueldo', true);

  const camposPorPersona = {
    mauri: 'sueldoMauri',
    ro: 'sueldoRo',
  };
  const campo = camposPorPersona[persona];
  if (!campo) throw new Error('La persona debe ser Mauri o Ro.');

  const referencia = referenciaMes(periodo);
  await runTransaction(db, async (transaccion) => {
    const mes = await transaccion.get(referencia);
    const momento = serverTimestamp();

    if (mes.exists()) {
      transaccion.update(referencia, {
        [campo]: monto,
        actualizadoEn: momento,
      });
      return;
    }

    transaccion.set(referencia, {
      periodo,
      observacionSaldo: '',
      [campo]: monto,
      creadoEn: momento,
      actualizadoEn: serverTimestamp(),
    });
  });
}

export async function guardarObservacionSaldo(periodo, observacion) {
  asegurarBaseDeDatos();
  validarPeriodo(periodo);
  if (typeof observacion !== 'string') throw new Error('La observación debe ser un texto.');
  if (observacion.length > 10000) throw new Error('La observación no puede superar los 10.000 caracteres.');

  const referencia = referenciaMes(periodo);
  await runTransaction(db, async (transaccion) => {
    const mes = await transaccion.get(referencia);

    if (mes.exists()) {
      transaccion.update(referencia, {
        observacionSaldo: observacion,
        actualizadoEn: serverTimestamp(),
      });
      return;
    }

    transaccion.set(referencia, {
      periodo,
      observacionSaldo: observacion,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  });
}
