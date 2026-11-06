import {
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, firebaseConfigurado } from '../firebase.js';

export const correosAutorizados = [
  'mauricio.ariel.buda@gmail.com',
  'wakeuprodiaz@gmail.com',
];

const proveedorGoogle = new GoogleAuthProvider();
proveedorGoogle.setCustomParameters({ prompt: 'select_account' });

export function esCorreoAutorizado(correo) {
  return (
    typeof correo === 'string' &&
    correosAutorizados.includes(correo.trim().toLowerCase())
  );
}

export function observarEstadoDeSesion(callback) {
  if (!firebaseConfigurado || !auth) {
    callback({ estado: 'sin-configuracion', usuario: null });
    return () => {};
  }

  return onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      callback({ estado: 'sin-sesion', usuario: null });
      return;
    }

    if (!esCorreoAutorizado(usuario.email)) {
      try {
        await signOut(auth);
      } finally {
        callback({ estado: 'no-autorizado', usuario: null });
      }
      return;
    }

    callback({ estado: 'autenticado', usuario });
  });
}

export async function iniciarSesionConGoogle() {
  if (!firebaseConfigurado || !auth) {
    throw new Error('Falta configurar Firebase. Revisá el archivo .env.');
  }

  await setPersistence(auth, browserLocalPersistence);
  const resultado = await signInWithPopup(auth, proveedorGoogle);
  const usuario = resultado.user;

  if (!esCorreoAutorizado(usuario.email)) {
    await signOut(auth);
    throw new Error('Esta cuenta de Google no está autorizada para usar Gastos.');
  }

  return usuario;
}

export async function cerrarSesion() {
  if (!firebaseConfigurado || !auth) return;
  await signOut(auth);
}
