import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { normalizarNombre, prepararNombre } from './validaciones.js';
import { crearIdIndiceNombre } from './indicesCatalogos.js';

const COLECCION_CATEGORIAS = 'categorias';
const COLECCION_MEDIOS = 'mediosPago';
const INDICES_CATEGORIAS = 'indicesCategorias';
const INDICES_MEDIOS = 'indicesMediosPago';

export const categoriasIniciales = [
  { id: 'alquiler', nombre: 'Alquiler', orden: 10, protegida: false },
  { id: 'expensas', nombre: 'Expensas', orden: 20, protegida: false },
  { id: 'verduleria', nombre: 'Verdulería', orden: 30, protegida: false },
  { id: 'supermercado', nombre: 'Supermercado', orden: 40, protegida: false },
  { id: 'postres', nombre: 'Postres', orden: 50, protegida: false },
  { id: 'cenas', nombre: 'Cenas', orden: 60, protegida: false },
  { id: 'nafta', nombre: 'Nafta', orden: 70, protegida: false },
  { id: 'tarjeta_credito', nombre: 'Tarjeta de crédito', orden: 80, protegida: false },
  { id: 'otros', nombre: 'Otros', orden: 90, protegida: true },
];

export const mediosPagoIniciales = [
  { id: 'efectivo', nombre: 'Efectivo', orden: 10, protegida: true },
  { id: 'debito', nombre: 'Débito', orden: 20, protegida: true },
  { id: 'otros', nombre: 'Otros', orden: 30, protegida: true },
];

function asegurarBaseDeDatos() {
  if (!db) throw new Error('Firebase no está configurado. Revisá el archivo .env.');
}

function compararCatalogos(a, b) {
  return (a.orden ?? 999) - (b.orden ?? 999)
    || a.nombre.localeCompare(b.nombre, 'es');
}

function prepararDocumentoCatalogo(definicion, nombre) {
  return {
    nombre,
    nombreNormalizado: normalizarNombre(nombre),
    activo: true,
    orden: definicion.orden,
    protegida: definicion.protegida,
    inicial: true,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  };
}

/**
 * Crea los catálogos base una sola vez. Si ya existen, no pisa nombres,
 * orden ni estados que los usuarios hayan modificado previamente.
 */
export async function inicializarCatalogosBase() {
  asegurarBaseDeDatos();

  const definiciones = [
    ...categoriasIniciales.map((item) => ({ ...item, coleccion: COLECCION_CATEGORIAS, indices: INDICES_CATEGORIAS })),
    ...mediosPagoIniciales.map((item) => ({ ...item, coleccion: COLECCION_MEDIOS, indices: INDICES_MEDIOS })),
  ];

  const referenciasDocumentos = definiciones.map((item) => doc(db, item.coleccion, item.id));

  await runTransaction(db, async (transaccion) => {
    const documentos = await Promise.all(
      referenciasDocumentos.map((referencia) => transaccion.get(referencia)),
    );

    const datosParaIndices = await Promise.all(definiciones.map(async (definicion, indice) => {
      const existente = documentos[indice].exists() ? documentos[indice].data() : null;
      const nombreActual = existente?.nombre || definicion.nombre;
      const nombreNormalizado = normalizarNombre(nombreActual);
      const idIndice = await crearIdIndiceNombre(nombreActual);
      const referenciaIndice = doc(db, definicion.indices, idIndice);
      return { definicion, existente, referenciaIndice, nombreActual, nombreNormalizado };
    }));

    const indicesExistentes = await Promise.all(
      datosParaIndices.map((item) => transaccion.get(item.referenciaIndice)),
    );

    datosParaIndices.forEach((item, indice) => {
      const idEsperado = item.definicion.id;
      const indiceActual = indicesExistentes[indice];

      if (indiceActual.exists()) {
        const referenciaActual = indiceActual.data().referenciaId;
        if (referenciaActual !== idEsperado) {
          throw new Error(`Conflicto al preparar el índice de "${item.nombreActual}". No se modificaron los catálogos.`);
        }
      } else {
        transaccion.set(item.referenciaIndice, {
          referenciaId: idEsperado,
          nombreNormalizado: item.nombreNormalizado,
          actualizadoEn: serverTimestamp(),
        });
      }

      if (!item.existente) {
        const referenciaDocumento = doc(db, item.definicion.coleccion, item.definicion.id);
        transaccion.set(referenciaDocumento, prepararDocumentoCatalogo(item.definicion, item.definicion.nombre));
      }
    });
  });

  return {
    categorias: categoriasIniciales.length,
    mediosPago: mediosPagoIniciales.length,
  };
}

async function listarCatalogo(coleccion, soloActivos) {
  asegurarBaseDeDatos();
  const resultado = await getDocs(collection(db, coleccion));
  return resultado.docs
    .map((documento) => ({ id: documento.id, ...documento.data() }))
    .filter((item) => !soloActivos || item.activo)
    .sort(compararCatalogos);
}

export function obtenerCategorias({ incluirInactivas = false } = {}) {
  return listarCatalogo(COLECCION_CATEGORIAS, !incluirInactivas);
}

export function obtenerMediosPago({ incluirInactivos = false } = {}) {
  return listarCatalogo(COLECCION_MEDIOS, !incluirInactivos);
}

export function observarCategorias(callback, alError, { incluirInactivas = false } = {}) {
  asegurarBaseDeDatos();
  return onSnapshot(collection(db, COLECCION_CATEGORIAS), (resultado) => {
    const categorias = resultado.docs
      .map((documento) => ({ id: documento.id, ...documento.data() }))
      .filter((item) => incluirInactivas || item.activo)
      .sort(compararCatalogos);
    callback(categorias);
  }, alError);
}

export function observarMediosPago(callback, alError, { incluirInactivos = false } = {}) {
  asegurarBaseDeDatos();
  return onSnapshot(collection(db, COLECCION_MEDIOS), (resultado) => {
    const medios = resultado.docs
      .map((documento) => ({ id: documento.id, ...documento.data() }))
      .filter((item) => incluirInactivos || item.activo)
      .sort(compararCatalogos);
    callback(medios);
  }, alError);
}

async function crearOReactivarOpcion({ nombreIngresado, coleccion, coleccionIndices, etiqueta }) {
  asegurarBaseDeDatos();
  const { nombre, nombreNormalizado } = prepararNombre(nombreIngresado, etiqueta);
  const idIndice = await crearIdIndiceNombre(nombreNormalizado);
  const referenciaIndice = doc(db, coleccionIndices, idIndice);

  return runTransaction(db, async (transaccion) => {
    const indice = await transaccion.get(referenciaIndice);

    if (indice.exists()) {
      const datosIndice = indice.data();
      if (datosIndice.nombreNormalizado !== nombreNormalizado) {
        throw new Error('Se detectó una colisión interna al comprobar el nombre. No se guardó la opción.');
      }

      const referenciaExistente = doc(db, coleccion, datosIndice.referenciaId);
      const documentoExistente = await transaccion.get(referenciaExistente);
      if (!documentoExistente.exists()) {
        throw new Error('El índice de esta opción no encuentra su registro. Contactá con soporte antes de continuar.');
      }

      const datosExistentes = documentoExistente.data();
      if (datosExistentes.activo) {
        throw new Error(`Ya existe una opción llamada "${datosExistentes.nombre}".`);
      }
      if (datosExistentes.protegida) {
        throw new Error('Esta opción especial no puede modificarse.');
      }

      transaccion.update(referenciaExistente, {
        activo: true,
        actualizadoEn: serverTimestamp(),
      });
      transaccion.update(referenciaIndice, {
        actualizadoEn: serverTimestamp(),
      });

      return { id: referenciaExistente.id, nombre: datosExistentes.nombre, reactivada: true };
    }

    const nuevaReferencia = doc(collection(db, coleccion));
    transaccion.set(nuevaReferencia, {
      nombre,
      nombreNormalizado,
      activo: true,
      orden: 100,
      protegida: false,
      inicial: false,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
    transaccion.set(referenciaIndice, {
      referenciaId: nuevaReferencia.id,
      nombreNormalizado,
      actualizadoEn: serverTimestamp(),
    });

    return { id: nuevaReferencia.id, nombre, reactivada: false };
  });
}

async function editarOpcion({ id, nombreIngresado, coleccion, coleccionIndices, etiqueta }) {
  asegurarBaseDeDatos();
  const { nombre, nombreNormalizado } = prepararNombre(nombreIngresado, etiqueta);
  const nuevoIdIndice = await crearIdIndiceNombre(nombreNormalizado);
  const referenciaDocumento = doc(db, coleccion, id);
  const referenciaNuevoIndice = doc(db, coleccionIndices, nuevoIdIndice);

  return runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referenciaDocumento);
    if (!documento.exists()) throw new Error('La opción que intentás editar ya no existe.');

    const datosActuales = documento.data();
    if (datosActuales.protegida) throw new Error('Esta opción es fija y no se puede editar.');
    if (!datosActuales.activo) throw new Error('No se puede editar una opción que está eliminada.');

    const indiceNuevo = await transaccion.get(referenciaNuevoIndice);
    if (indiceNuevo.exists()) {
      const datosIndice = indiceNuevo.data();
      if (datosIndice.nombreNormalizado !== nombreNormalizado) {
        throw new Error('Se detectó una colisión interna al comprobar el nombre. No se guardó el cambio.');
      }
      if (datosIndice.referenciaId !== id) {
        throw new Error(`Ya existe otra opción llamada "${nombre}".`);
      }
    }

    const nombreAnteriorNormalizado = normalizarNombre(datosActuales.nombre);
    const idIndiceAnterior = await crearIdIndiceNombre(nombreAnteriorNormalizado);
    const referenciaIndiceAnterior = doc(db, coleccionIndices, idIndiceAnterior);
    const indiceAnterior = await transaccion.get(referenciaIndiceAnterior);

    transaccion.update(referenciaDocumento, {
      nombre,
      nombreNormalizado,
      actualizadoEn: serverTimestamp(),
    });

    if (!indiceNuevo.exists()) {
      transaccion.set(referenciaNuevoIndice, {
        referenciaId: id,
        nombreNormalizado,
        actualizadoEn: serverTimestamp(),
      });
    }

    if (idIndiceAnterior !== nuevoIdIndice && indiceAnterior.exists()) {
      transaccion.delete(referenciaIndiceAnterior);
    }

    return { id, nombre };
  });
}

async function eliminarOpcion({ id, coleccion }) {
  asegurarBaseDeDatos();
  const referenciaDocumento = doc(db, coleccion, id);

  return runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referenciaDocumento);
    if (!documento.exists()) throw new Error('La opción que intentás eliminar ya no existe.');
    const datos = documento.data();

    if (datos.protegida) throw new Error('Esta opción es fija y no se puede eliminar.');
    if (!datos.activo) return { id, yaEstabaInactiva: true };

    // Baja lógica: se conserva el documento para que los gastos históricos
    // sigan pudiendo mostrar el nombre y para permitir recuperarlo después.
    transaccion.update(referenciaDocumento, {
      activo: false,
      actualizadoEn: serverTimestamp(),
    });

    return { id, yaEstabaInactiva: false };
  });
}

export function crearOReactivarCategoria(nombre) {
  return crearOReactivarOpcion({
    nombreIngresado: nombre,
    coleccion: COLECCION_CATEGORIAS,
    coleccionIndices: INDICES_CATEGORIAS,
    etiqueta: 'La categoría',
  });
}

export function editarCategoria(id, nombre) {
  return editarOpcion({
    id,
    nombreIngresado: nombre,
    coleccion: COLECCION_CATEGORIAS,
    coleccionIndices: INDICES_CATEGORIAS,
    etiqueta: 'La categoría',
  });
}

export function eliminarCategoria(id) {
  return eliminarOpcion({ id, coleccion: COLECCION_CATEGORIAS });
}

export function crearOReactivarMedioPago(nombre) {
  return crearOReactivarOpcion({
    nombreIngresado: nombre,
    coleccion: COLECCION_MEDIOS,
    coleccionIndices: INDICES_MEDIOS,
    etiqueta: 'El medio de pago',
  });
}

export function editarMedioPago(id, nombre) {
  return editarOpcion({
    id,
    nombreIngresado: nombre,
    coleccion: COLECCION_MEDIOS,
    coleccionIndices: INDICES_MEDIOS,
    etiqueta: 'El medio de pago',
  });
}

export function eliminarMedioPago(id) {
  return eliminarOpcion({ id, coleccion: COLECCION_MEDIOS });
}
