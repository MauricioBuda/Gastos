import { doc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { normalizarNombre } from './validaciones.js';

/**
 * Genera un identificador corto y determinista para el índice de unicidad.
 * La cadena normalizada completa también se guarda en el documento índice,
 * por lo que el servicio puede detectar cualquier colisión improbable.
 */
export async function crearIdIndiceNombre(nombre) {
  const normalizado = normalizarNombre(nombre);
  const datos = new TextEncoder().encode(normalizado);
  const resumen = await globalThis.crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(resumen))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function obtenerReferenciaIndice(coleccionIndice, nombre) {
  const id = await crearIdIndiceNombre(nombre);
  return doc(db, coleccionIndice, id);
}
