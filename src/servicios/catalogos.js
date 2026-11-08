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
const INDICES_CATEGORIAS = 'indicesCategorias';

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

function asegurarBaseDeDatos() {
  if (!db) throw new Error('Firebase no está configurado. Revisá el archivo .env.');
}

function compararCategorias(a, b) {
  if (a.id === 'otros') return 1;
  if (b.id === 'otros') return -1;
  return (a.orden ?? 999) - (b.orden ?? 999)
    || a.nombre.localeCompare(b.nombre, 'es');
}

function prepararDocumentoCategoria(definicion, nombre, visibleEnFormulario = true) {
  return {
    nombre,
    nombreNormalizado: normalizarNombre(nombre),
    activo: true,
    visibleEnFormulario,
    orden: definicion.orden,
    protegida: definicion.protegida,
    inicial: true,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  };
}

function normalizarDocumentoCategoria(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    ...datos,
    // Compatibilidad con categorías creadas antes de incorporar el control del ojo.
    // Esas opciones permanecen visibles para no alterar los hábitos ya existentes.
    visibleEnFormulario: typeof datos.visibleEnFormulario === 'boolean'
      ? datos.visibleEnFormulario
      : true,
  };
}

/**
 * Prepara únicamente el catálogo de categorías.
 * Los catálogos históricos de medios de pago y sus índices permanecen intactos
 * en Firestore; esta implementación no los consulta ni modifica.
 * También migra categorías anteriores: las ya existentes quedan visibles,
 * mientras que las categorías nuevas se crean ocultas hasta que el usuario
 * active su visibilidad desde Administración.
 */
export async function inicializarCatalogosBase() {
  asegurarBaseDeDatos();

  const referenciasDocumentos = categoriasIniciales.map((item) => doc(db, COLECCION_CATEGORIAS, item.id));

  await runTransaction(db, async (transaccion) => {
    const documentos = await Promise.all(
      referenciasDocumentos.map((referencia) => transaccion.get(referencia)),
    );

    const datosParaIndices = await Promise.all(categoriasIniciales.map(async (definicion, indice) => {
      const existente = documentos[indice].exists() ? documentos[indice].data() : null;
      const nombreActual = existente?.nombre || definicion.nombre;
      const nombreNormalizado = normalizarNombre(nombreActual);
      const idIndice = await crearIdIndiceNombre(nombreActual);
      const referenciaIndice = doc(db, INDICES_CATEGORIAS, idIndice);
      return { definicion, existente, referenciaIndice, nombreActual, nombreNormalizado };
    }));

    const indicesExistentes = await Promise.all(
      datosParaIndices.map((item) => transaccion.get(item.referenciaIndice)),
    );

    // Todas las lecturas de la transacción se realizan antes de las escrituras.
    datosParaIndices.forEach((item, indice) => {
      const indiceActual = indicesExistentes[indice];
      if (indiceActual.exists()) {
        const referenciaActual = indiceActual.data().referenciaId;
        if (referenciaActual !== item.definicion.id) {
          throw new Error(`Conflicto al preparar el índice de "${item.nombreActual}". No se modificaron las categorías.`);
        }
      } else {
        transaccion.set(item.referenciaIndice, {
          referenciaId: item.definicion.id,
          nombreNormalizado: item.nombreNormalizado,
          actualizadoEn: serverTimestamp(),
        });
      }

      const referenciaDocumento = doc(db, COLECCION_CATEGORIAS, item.definicion.id);
      if (!item.existente) {
        transaccion.set(referenciaDocumento, prepararDocumentoCategoria(item.definicion, item.definicion.nombre, true));
      } else if (typeof item.existente.visibleEnFormulario !== 'boolean' && !item.existente.protegida) {
        // Las categorías preexistentes estaban disponibles en el selector antes de esta actualización.
        transaccion.update(referenciaDocumento, {
          visibleEnFormulario: true,
          actualizadoEn: serverTimestamp(),
        });
      }
    });
  });

  return { categorias: categoriasIniciales.length };
}

async function listarCategorias(soloActivas) {
  asegurarBaseDeDatos();
  const resultado = await getDocs(collection(db, COLECCION_CATEGORIAS));
  return resultado.docs
    .map(normalizarDocumentoCategoria)
    .filter((item) => !soloActivas || item.activo)
    .sort(compararCategorias);
}

export function obtenerCategorias({ incluirInactivas = false } = {}) {
  return listarCategorias(!incluirInactivas);
}

export function observarCategorias(callback, alError, { incluirInactivas = false } = {}) {
  asegurarBaseDeDatos();
  return onSnapshot(collection(db, COLECCION_CATEGORIAS), (resultado) => {
    const categorias = resultado.docs
      .map(normalizarDocumentoCategoria)
      .filter((item) => incluirInactivas || item.activo)
      .sort(compararCategorias);
    callback(categorias);
  }, alError);
}

async function crearOReactivarOpcion(nombreIngresado) {
  asegurarBaseDeDatos();
  const { nombre, nombreNormalizado } = prepararNombre(nombreIngresado, 'La categoría');
  if (nombreNormalizado === 'otros' || nombreNormalizado === 'agregar otra categoria') {
    throw new Error('Ese nombre está reservado para la opción «Agregar otra categoría».');
  }

  const idIndice = await crearIdIndiceNombre(nombreNormalizado);
  const referenciaIndice = doc(db, INDICES_CATEGORIAS, idIndice);

  return runTransaction(db, async (transaccion) => {
    const indice = await transaccion.get(referenciaIndice);

    if (indice.exists()) {
      const datosIndice = indice.data();
      if (datosIndice.nombreNormalizado !== nombreNormalizado) {
        throw new Error('Se detectó una colisión interna al comprobar el nombre. No se guardó la categoría.');
      }

      const referenciaExistente = doc(db, COLECCION_CATEGORIAS, datosIndice.referenciaId);
      const documentoExistente = await transaccion.get(referenciaExistente);
      if (!documentoExistente.exists()) {
        throw new Error('El índice de esta categoría no encuentra su registro. Contactá con soporte antes de continuar.');
      }

      const datosExistentes = documentoExistente.data();
      if (datosExistentes.activo) {
        throw new Error(`Ya existe una categoría llamada "${datosExistentes.nombre}".`);
      }
      if (datosExistentes.protegida) {
        throw new Error('Esta opción especial no puede modificarse.');
      }

      transaccion.update(referenciaExistente, {
        activo: true,
        actualizadoEn: serverTimestamp(),
      });
      transaccion.update(referenciaIndice, { actualizadoEn: serverTimestamp() });

      return {
        id: referenciaExistente.id,
        nombre: datosExistentes.nombre,
        reactivada: true,
        visibleEnFormulario: datosExistentes.visibleEnFormulario !== false,
      };
    }

    const nuevaReferencia = doc(collection(db, COLECCION_CATEGORIAS));
    transaccion.set(nuevaReferencia, {
      nombre,
      nombreNormalizado,
      activo: true,
      visibleEnFormulario: false,
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

    return { id: nuevaReferencia.id, nombre, reactivada: false, visibleEnFormulario: false };
  });
}

async function editarOpcion(id, nombreIngresado) {
  asegurarBaseDeDatos();
  const { nombre, nombreNormalizado } = prepararNombre(nombreIngresado, 'La categoría');
  if (nombreNormalizado === 'otros' || nombreNormalizado === 'agregar otra categoria') {
    throw new Error('Ese nombre está reservado para la opción «Agregar otra categoría».');
  }
  const nuevoIdIndice = await crearIdIndiceNombre(nombreNormalizado);
  const referenciaDocumento = doc(db, COLECCION_CATEGORIAS, id);
  const referenciaNuevoIndice = doc(db, INDICES_CATEGORIAS, nuevoIdIndice);

  return runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referenciaDocumento);
    if (!documento.exists()) throw new Error('La categoría que intentás editar ya no existe.');

    const datosActuales = documento.data();
    if (datosActuales.protegida) throw new Error('Esta opción es fija y no se puede editar.');
    if (!datosActuales.activo) throw new Error('No se puede editar una categoría que está eliminada.');

    const indiceNuevo = await transaccion.get(referenciaNuevoIndice);
    if (indiceNuevo.exists()) {
      const datosIndice = indiceNuevo.data();
      if (datosIndice.nombreNormalizado !== nombreNormalizado) {
        throw new Error('Se detectó una colisión interna al comprobar el nombre. No se guardó el cambio.');
      }
      if (datosIndice.referenciaId !== id) throw new Error(`Ya existe otra categoría llamada "${nombre}".`);
    }

    const idIndiceAnterior = await crearIdIndiceNombre(normalizarNombre(datosActuales.nombre));
    const referenciaIndiceAnterior = doc(db, INDICES_CATEGORIAS, idIndiceAnterior);
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

export function crearOReactivarCategoria(nombre) {
  return crearOReactivarOpcion(nombre);
}

export function editarCategoria(id, nombre) {
  return editarOpcion(id, nombre);
}

export async function eliminarCategoria(id) {
  asegurarBaseDeDatos();
  const referenciaDocumento = doc(db, COLECCION_CATEGORIAS, id);

  return runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referenciaDocumento);
    if (!documento.exists()) throw new Error('La categoría que intentás eliminar ya no existe.');
    const datos = documento.data();
    if (datos.protegida) throw new Error('Esta opción es fija y no se puede eliminar.');
    if (!datos.activo) return { id, yaEstabaInactiva: true };

    transaccion.update(referenciaDocumento, {
      activo: false,
      actualizadoEn: serverTimestamp(),
    });
    return { id, yaEstabaInactiva: false };
  });
}

export async function actualizarVisibilidadCategoria(id, visibleEnFormulario) {
  asegurarBaseDeDatos();
  if (typeof visibleEnFormulario !== 'boolean') {
    throw new Error('La visibilidad de la categoría debe ser visible u oculta.');
  }
  if (id === 'otros') throw new Error('La opción «Agregar otra categoría» siempre debe permanecer disponible.');

  const referenciaDocumento = doc(db, COLECCION_CATEGORIAS, id);
  await runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referenciaDocumento);
    if (!documento.exists()) throw new Error('La categoría ya no existe.');
    const datos = documento.data();
    if (!datos.activo) throw new Error('Primero tenés que recuperar la categoría para cambiar su visibilidad.');

    transaccion.update(referenciaDocumento, {
      visibleEnFormulario,
      actualizadoEn: serverTimestamp(),
    });
  });
  return { id, visibleEnFormulario };
}
