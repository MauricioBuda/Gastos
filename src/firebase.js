import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const variablesFirebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const nombresVariables = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

export const variablesFirebaseFaltantes = Object.entries(variablesFirebase)
  .filter(([, valor]) => !valor || !String(valor).trim())
  .map(([clave]) => nombresVariables[clave]);

export const firebaseConfigurado = variablesFirebaseFaltantes.length === 0;

let aplicacionFirebase = null;
let autenticacion = null;
let baseDeDatos = null;

if (firebaseConfigurado) {
  aplicacionFirebase = getApps().length
    ? getApp()
    : initializeApp(variablesFirebase);

  autenticacion = getAuth(aplicacionFirebase);
  baseDeDatos = getFirestore(aplicacionFirebase);
}

export const app = aplicacionFirebase;
export const auth = autenticacion;
export const db = baseDeDatos;
