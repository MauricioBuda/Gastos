import './estilos.css';
import { auth, firebaseConfigurado } from './firebase.js';
import {
  observarEstadoDeSesion,
  iniciarSesionConGoogle,
  cerrarSesion,
} from './servicios/autenticacion.js';
import {
  inicializarCatalogosBase,
  observarCategorias,
  observarMediosPago,
  crearOReactivarCategoria,
  crearOReactivarMedioPago,
  obtenerCategorias,
  obtenerMediosPago,
} from './servicios/catalogos.js';
import {
  crearGasto,
  editarGasto,
  eliminarGasto,
  observarGastosDelMes,
} from './servicios/gastos.js';
import {
  observarMes,
  guardarSueldo,
  guardarObservacionSaldo,
} from './servicios/meses.js';
import {
  crearIngresoAdicional,
  editarIngresoAdicional,
  eliminarIngresoAdicional,
  observarIngresosAdicionales,
} from './servicios/ingresosAdicionales.js';
import {
  calcularResumenMensual,
  obtenerFechaLocalActual,
  obtenerPeriodoDeFecha,
  obtenerPersonaPorCorreo,
  normalizarNombre,
} from './servicios/validaciones.js';

const elementos = {
  pantallaEsperaInicial: document.querySelector('#pantalla-espera-inicial'),
  contenedorAplicacion: document.querySelector('#contenedor-aplicacion'),
  panelAcceso: document.querySelector('#panel-acceso'),
  panelInicioSesion: document.querySelector('#panel-inicio-sesion'),
  panelConfiguracion: document.querySelector('#panel-configuracion'),
  panelAplicacion: document.querySelector('#panel-aplicacion'),
  estadoAplicacion: document.querySelector('#estado-aplicacion'),
  estadoOperacion: document.querySelector('#estado-operacion'),
  botonIniciarSesion: document.querySelector('#boton-iniciar-sesion'),
  botonCerrarSesion: document.querySelector('#boton-cerrar-sesion'),
  encabezadoUsuario: document.querySelector('#encabezado-usuario'),
  correoEncabezado: document.querySelector('#correo-encabezado'),
  leyendaEncabezado: document.querySelector('#leyenda-encabezado'),
  insigniaUsuario: document.querySelector('#insignia-usuario'),
  botonVistaCarga: document.querySelector('#boton-vista-carga'),
  botonVistaConsulta: document.querySelector('#boton-vista-consulta'),
  vistaCarga: document.querySelector('#vista-carga'),
  vistaConsulta: document.querySelector('#vista-consulta'),
  panelResumenMensual: document.querySelector('#panel-resumen-mensual'),
  selectorMes: document.querySelector('#selector-mes'),
  totalSueldos: document.querySelector('#total-sueldos'),
  botonDetalleSueldos: document.querySelector('#boton-detalle-sueldos'),
  detalleSueldos: document.querySelector('#detalle-sueldos'),
  detalleSueldoMauri: document.querySelector('#detalle-sueldo-mauri'),
  detalleSueldoRo: document.querySelector('#detalle-sueldo-ro'),
  totalIngresosAdicionales: document.querySelector('#total-ingresos-adicionales'),
  cantidadIngresosAdicionales: document.querySelector('#cantidad-ingresos-adicionales'),
  totalGastosMes: document.querySelector('#total-gastos-mes'),
  saldoDisponible: document.querySelector('#saldo-disponible'),
  tarjetaSaldoDisponible: document.querySelector('#tarjeta-saldo-disponible'),
  estadoSueldosResumen: document.querySelector('#estado-sueldos-resumen'),
  estadoCargaResumen: document.querySelector('#estado-carga-resumen'),
  panelSueldos: document.querySelector('#panel-sueldos'),
  contenedorSueldos: document.querySelector('#contenedor-sueldos'),
  formularioIngresoAdicional: document.querySelector('#formulario-ingreso-adicional'),
  montoIngresoAdicional: document.querySelector('#monto-ingreso-adicional'),
  procedenciaIngresoAdicional: document.querySelector('#procedencia-ingreso-adicional'),
  botonAgregarIngreso: document.querySelector('#boton-agregar-ingreso'),
  listaIngresosAdicionales: document.querySelector('#lista-ingresos-adicionales'),
  botonObservacion: document.querySelector('#boton-observacion'),
  textoObservacionSaldo: document.querySelector('#texto-observacion-saldo'),
  formularioObservacionSaldo: document.querySelector('#formulario-observacion-saldo'),
  observacionSaldo: document.querySelector('#observacion-saldo'),
  botonGuardarObservacion: document.querySelector('#boton-guardar-observacion'),
  botonCancelarObservacion: document.querySelector('#boton-cancelar-observacion'),
  dialogoEdicionIngreso: document.querySelector('#dialogo-edicion-ingreso'),
  formularioEditarIngreso: document.querySelector('#formulario-editar-ingreso'),
  montoIngresoEdicion: document.querySelector('#monto-ingreso-edicion'),
  procedenciaIngresoEdicion: document.querySelector('#procedencia-ingreso-edicion'),
  botonGuardarIngresoEditado: document.querySelector('#boton-guardar-ingreso-editado'),
  botonCancelarIngresoEditado: document.querySelector('#boton-cancelar-ingreso-editado'),
  formularioGasto: document.querySelector('#formulario-gasto'),
  montoGasto: document.querySelector('#monto-gasto'),
  categoriaGasto: document.querySelector('#categoria-gasto'),
  categoriaPersonalizada: document.querySelector('#categoria-personalizada'),
  contenedorCategoriaPersonalizada: document.querySelector('#contenedor-categoria-personalizada'),
  medioPagoGasto: document.querySelector('#medio-pago-gasto'),
  medioPersonalizado: document.querySelector('#medio-personalizado'),
  contenedorMedioPersonalizado: document.querySelector('#contenedor-medio-personalizado'),
  responsableGasto: document.querySelector('#responsable-gasto'),
  fechaGasto: document.querySelector('#fecha-gasto'),
  botonGuardarGasto: document.querySelector('#boton-guardar-gasto'),
  botonCancelarEdicion: document.querySelector('#boton-cancelar-edicion'),
  cantidadMovimientos: document.querySelector('#cantidad-movimientos'),
  totalMovimientos: document.querySelector('#total-movimientos'),
  listaMovimientos: document.querySelector('#lista-movimientos'),
  piePagina: document.querySelector('#pie-pagina'),
};

let usuarioActivo = null;
let categorias = [];
let mediosPago = [];
let gastosMes = [];
let ingresosAdicionales = [];
let mesSeleccionado = crearMesVacio(obtenerPeriodoDeFecha(obtenerFechaLocalActual()));
let cargandoGastos = false;
let cargandoMes = false;
let cargandoIngresos = false;
let gastoEnEdicion = null;
let ingresoEnEdicion = null;
let periodoSeleccionado = obtenerPeriodoDeFecha(obtenerFechaLocalActual());
let cancelarObservadorCategorias = null;
let cancelarObservadorMedios = null;
let cancelarObservadorGastos = null;
let cancelarObservadorMes = null;
let cancelarObservadorIngresos = null;
let vistaActiva = 'carga';
let uidInicializando = null;
let uidAplicacionLista = null;
let periodoSueldosInicializado = null;
const edicionesSueldos = { mauri: false, ro: false };

function crearMesVacio(periodo) {
  return {
    id: periodo,
    periodo,
    sueldoMauri: null,
    sueldoRo: null,
    observacionSaldo: '',
    existeEnBase: false,
  };
}

function revelarInterfazPrincipal() {
  elementos.contenedorAplicacion.hidden = false;
  elementos.pantallaEsperaInicial.hidden = true;
}

function mostrarEstadoAplicacion(mensaje, tipo = 'normal') {
  elementos.estadoAplicacion.replaceChildren();
  elementos.estadoAplicacion.dataset.tipo = tipo;
  elementos.estadoAplicacion.hidden = !mensaje;
  if (!mensaje) return;

  if (tipo === 'cargando') {
    elementos.estadoAplicacion.append(crearIndicadorCarga(), document.createTextNode(mensaje));
  } else {
    elementos.estadoAplicacion.textContent = mensaje;
  }
}

function mostrarEstadoOperacion(mensaje, tipo = 'normal') {
  elementos.estadoOperacion.replaceChildren();
  elementos.estadoOperacion.dataset.tipo = tipo;
  elementos.estadoOperacion.hidden = !mensaje;
  if (!mensaje) return;

  if (tipo === 'cargando') {
    elementos.estadoOperacion.append(crearIndicadorCarga(), document.createTextNode(mensaje));
  } else {
    elementos.estadoOperacion.textContent = mensaje;
  }
}

function crearIndicadorCarga() {
  const indicador = document.createElement('span');
  indicador.className = 'indicador-carga';
  indicador.setAttribute('aria-hidden', 'true');
  return indicador;
}

function activarCargaBoton(boton, mensaje) {
  if (!boton || boton.disabled) return () => {};
  const contenidoOriginal = boton.innerHTML;
  boton.dataset.contenidoOriginal = contenidoOriginal;
  boton.disabled = true;
  boton.classList.add('boton--cargando');
  boton.replaceChildren(crearIndicadorCarga());
  const texto = document.createElement('span');
  texto.textContent = mensaje;
  boton.append(texto);

  return () => {
    boton.innerHTML = boton.dataset.contenidoOriginal || contenidoOriginal;
    delete boton.dataset.contenidoOriginal;
    boton.classList.remove('boton--cargando');
    boton.disabled = false;
  };
}

function detenerObservadores() {
  cancelarObservadorCategorias?.();
  cancelarObservadorMedios?.();
  cancelarObservadorGastos?.();
  cancelarObservadorMes?.();
  cancelarObservadorIngresos?.();
  cancelarObservadorCategorias = null;
  cancelarObservadorMedios = null;
  cancelarObservadorGastos = null;
  cancelarObservadorMes = null;
  cancelarObservadorIngresos = null;
}

function mostrarPantallaAcceso() {
  detenerObservadores();
  usuarioActivo = null;
  categorias = [];
  mediosPago = [];
  gastosMes = [];
  ingresosAdicionales = [];
  mesSeleccionado = crearMesVacio(periodoSeleccionado);
  cargandoGastos = false;
  cargandoMes = false;
  cargandoIngresos = false;
  gastoEnEdicion = null;
  ingresoEnEdicion = null;
  uidAplicacionLista = null;
  elementos.panelAcceso.hidden = false;
  elementos.panelInicioSesion.hidden = true;
  elementos.panelConfiguracion.hidden = true;
  elementos.panelAplicacion.hidden = true;
  elementos.encabezadoUsuario.hidden = true;
  elementos.leyendaEncabezado.hidden = false;
  elementos.piePagina.hidden = false;
  mostrarEstadoAplicacion('Iniciá sesión para continuar.');
  elementos.botonIniciarSesion.disabled = false;
  elementos.botonIniciarSesion.innerHTML = '<span class="boton-principal__icono" aria-hidden="true">G</span>Continuar con Google';
}

function mostrarConfiguracionPendiente() {
  revelarInterfazPrincipal();
  elementos.panelAcceso.hidden = false;
  elementos.panelInicioSesion.hidden = true;
  elementos.panelConfiguracion.hidden = false;
  elementos.panelAplicacion.hidden = true;
  mostrarEstadoAplicacion('Falta configurar las variables de Firebase.', 'aviso');
}

function mostrarVista(nombre) {
  vistaActiva = nombre;
  const verCarga = nombre === 'carga';
  elementos.vistaCarga.hidden = !verCarga;
  elementos.vistaConsulta.hidden = verCarga;
  elementos.botonVistaCarga.classList.toggle('boton-navegacion--activo', verCarga);
  elementos.botonVistaConsulta.classList.toggle('boton-navegacion--activo', !verCarga);
  if (verCarga) {
    elementos.botonVistaCarga.setAttribute('aria-current', 'page');
    elementos.botonVistaConsulta.removeAttribute('aria-current');
  } else {
    elementos.botonVistaConsulta.setAttribute('aria-current', 'page');
    elementos.botonVistaCarga.removeAttribute('aria-current');
    renderizarGastos();
  }
  mostrarEstadoOperacion('');
}

function mostrarUsuario(usuario) {
  revelarInterfazPrincipal();
  usuarioActivo = usuario;
  elementos.panelAcceso.hidden = true;
  elementos.panelAplicacion.hidden = false;
  elementos.panelResumenMensual.hidden = false;
  elementos.encabezadoUsuario.hidden = false;
  elementos.leyendaEncabezado.hidden = true;
  elementos.piePagina.hidden = true;
  elementos.correoEncabezado.textContent = usuario.email || '';
  elementos.insigniaUsuario.textContent = (usuario.displayName || usuario.email || 'U').trim().charAt(0).toUpperCase();
  elementos.selectorMes.value = periodoSeleccionado;
  prepararFormularioNuevo();
  mostrarVista('carga');
}

async function iniciarAplicacionPrivada(usuario) {
  if (!usuario?.uid || uidAplicacionLista === usuario.uid || uidInicializando === usuario.uid) return;
  uidInicializando = usuario.uid;
  mostrarUsuario(usuario);
  mostrarEstadoOperacion('Preparando los catálogos…', 'cargando');

  try {
    const resultado = await inicializarCatalogosBase();
    if (auth?.currentUser?.uid !== usuario.uid) return;

    iniciarObservadoresCatalogos();
    cambiarPeriodoConsultado(periodoSeleccionado);
    uidAplicacionLista = usuario.uid;
    mostrarEstadoOperacion(
      `Listo. ${resultado.categorias} categorías y ${resultado.mediosPago} medios de pago disponibles.`,
      'correcto',
    );
  } catch (error) {
    console.error('No se pudo preparar la aplicación:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    if (uidInicializando === usuario.uid) uidInicializando = null;
  }
}

function iniciarObservadoresCatalogos() {
  cancelarObservadorCategorias?.();
  cancelarObservadorMedios?.();

  cancelarObservadorCategorias = observarCategorias((resultado) => {
    categorias = resultado;
    actualizarSelectorCategorias();
    renderizarGastos();
  }, (error) => {
    console.error('Error al consultar categorías:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  }, { incluirInactivas: true });

  cancelarObservadorMedios = observarMediosPago((resultado) => {
    mediosPago = resultado;
    actualizarSelectorMedios();
    renderizarGastos();
  }, (error) => {
    console.error('Error al consultar medios de pago:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  }, { incluirInactivos: true });
}

function actualizarSelectorCategorias(idSeleccionado = elementos.categoriaGasto.value) {
  const opcionesVisibles = categorias.filter((item) => item.activo || item.id === idSeleccionado);
  cargarOpcionesSelect(elementos.categoriaGasto, opcionesVisibles, 'Seleccioná una categoría', idSeleccionado);
  actualizarVisibilidadCamposPersonalizados();
}

function actualizarSelectorMedios(idSeleccionado = elementos.medioPagoGasto.value) {
  const opcionesVisibles = mediosPago.filter((item) => item.activo || item.id === idSeleccionado);
  cargarOpcionesSelect(elementos.medioPagoGasto, opcionesVisibles, 'Seleccioná un medio de pago', idSeleccionado);
  actualizarVisibilidadCamposPersonalizados();
}

function cargarOpcionesSelect(select, opciones, textoInicial, idSeleccionado = '') {
  const fragmento = document.createDocumentFragment();
  const opcionInicial = document.createElement('option');
  opcionInicial.value = '';
  opcionInicial.textContent = textoInicial;
  opcionInicial.disabled = true;
  fragmento.append(opcionInicial);

  for (const item of opciones) {
    const opcion = document.createElement('option');
    opcion.value = item.id;
    opcion.textContent = item.activo ? item.nombre : `${item.nombre} (eliminada)`;
    opcion.disabled = !item.activo && item.id !== idSeleccionado;
    fragmento.append(opcion);
  }

  select.replaceChildren(fragmento);
  select.value = idSeleccionado || '';
}

function actualizarVisibilidadCamposPersonalizados() {
  const esCategoriaOtros = elementos.categoriaGasto.value === 'otros';
  const esMedioOtros = elementos.medioPagoGasto.value === 'otros';
  elementos.contenedorCategoriaPersonalizada.hidden = !esCategoriaOtros;
  elementos.contenedorMedioPersonalizado.hidden = !esMedioOtros;
  elementos.categoriaPersonalizada.required = esCategoriaOtros;
  elementos.medioPersonalizado.required = esMedioOtros;
}

function renderizarPanelSueldos() {
  if (cargandoMes) {
    elementos.contenedorSueldos.replaceChildren(crearMensajeCargando('Consultando los sueldos…'));
    return;
  }

  if (periodoSueldosInicializado !== periodoSeleccionado) {
    periodoSueldosInicializado = periodoSeleccionado;
    edicionesSueldos.mauri = false;
    edicionesSueldos.ro = false;
    elementos.panelSueldos.open = mesSeleccionado.sueldoMauri === null || mesSeleccionado.sueldoRo === null;
  }

  elementos.contenedorSueldos.replaceChildren();
  elementos.contenedorSueldos.append(
    crearFilaSueldo('mauri', mesSeleccionado.sueldoMauri),
    crearFilaSueldo('ro', mesSeleccionado.sueldoRo),
  );
}

function crearFilaSueldo(persona, montoActual) {
  const nombre = persona === 'mauri' ? 'Mauri' : 'Ro';
  const fila = document.createElement('div');
  fila.className = 'fila-sueldo';

  if (montoActual !== null && !edicionesSueldos[persona]) {
    const texto = document.createElement('span');
    texto.className = 'fila-sueldo__estado';
    texto.textContent = `Sueldo de ${nombre} registrado`;
    const botonEditar = crearBotonAccion(`Editar sueldo de ${nombre}`, '✎', 'boton-icono boton-icono--editar');
    botonEditar.dataset.editarSueldo = persona;
    fila.append(texto, botonEditar);
    return fila;
  }

  const formulario = document.createElement('form');
  formulario.className = 'formulario-sueldo';
  formulario.dataset.persona = persona;
  formulario.dataset.edicion = String(montoActual !== null);

  const campo = document.createElement('div');
  campo.className = 'campo-formulario campo-formulario--compacto';
  const etiqueta = document.createElement('label');
  etiqueta.textContent = `Sueldo de ${nombre}`;
  etiqueta.htmlFor = `monto-sueldo-${persona}`;
  const entrada = document.createElement('input');
  entrada.id = `monto-sueldo-${persona}`;
  entrada.name = 'monto';
  entrada.type = 'number';
  entrada.inputMode = 'numeric';
  entrada.min = '0';
  entrada.step = '1';
  entrada.required = true;
  entrada.placeholder = 'Importe en pesos';
  entrada.value = montoActual === null ? '' : String(montoActual);
  campo.append(etiqueta, entrada);

  const acciones = document.createElement('div');
  acciones.className = 'acciones-sueldo';
  const botonGuardar = document.createElement('button');
  botonGuardar.type = 'submit';
  botonGuardar.className = 'boton-secundario';
  botonGuardar.textContent = montoActual === null ? 'Guardar sueldo' : 'Guardar corrección';
  acciones.append(botonGuardar);

  if (montoActual !== null) {
    const botonCancelar = document.createElement('button');
    botonCancelar.type = 'button';
    botonCancelar.className = 'boton-texto';
    botonCancelar.textContent = 'Cancelar';
    botonCancelar.dataset.cancelarEdicionSueldo = persona;
    acciones.append(botonCancelar);
  }

  formulario.append(campo, acciones);
  fila.append(formulario);
  return fila;
}

async function guardarSueldoDesdeFormulario(evento) {
  const formulario = evento.target.closest('form[data-persona]');
  if (!formulario) return;
  evento.preventDefault();

  const persona = formulario.dataset.persona;
  const monto = formulario.elements.monto.value;
  const esEdicion = formulario.dataset.edicion === 'true';
  const nombre = persona === 'mauri' ? 'Mauri' : 'Ro';
  const periodoOperacion = periodoSeleccionado;
  if (!formulario.reportValidity()) return;

  if (esEdicion && !window.confirm(`¿Confirmás corregir el sueldo de ${nombre} para ${formatearPeriodo(periodoOperacion)}?`)) return;

  const boton = formulario.querySelector('button[type="submit"]');
  const finalizarCarga = activarCargaBoton(boton, 'Guardando…');
  mostrarEstadoOperacion(`Guardando el sueldo de ${nombre}…`, 'cargando');

  try {
    await guardarSueldo(periodoOperacion, persona, monto);
    if (periodoSeleccionado === periodoOperacion) {
      const campo = persona === 'mauri' ? 'sueldoMauri' : 'sueldoRo';
      mesSeleccionado = { ...mesSeleccionado, [campo]: Number(monto) };
      edicionesSueldos[persona] = false;
      renderizarPanelSueldos();
      if (mesSeleccionado.sueldoMauri !== null && mesSeleccionado.sueldoRo !== null) {
        elementos.panelSueldos.open = false;
      }
      actualizarBalanceMensual();
    }
    mostrarEstadoOperacion(`Sueldo de ${nombre} guardado en ${formatearPeriodo(periodoOperacion)}.`, 'correcto');
  } catch (error) {
    console.error('No se pudo guardar el sueldo:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

function renderizarIngresosAdicionales() {
  elementos.cantidadIngresosAdicionales.textContent = String(ingresosAdicionales.length);
  elementos.listaIngresosAdicionales.replaceChildren();

  if (cargandoIngresos) {
    elementos.listaIngresosAdicionales.append(crearMensajeCargando('Consultando ingresos…'));
    return;
  }

  if (ingresosAdicionales.length === 0) {
    elementos.listaIngresosAdicionales.append(crearMensajeVacio('Todavía no hay ingresos adicionales en este mes.'));
    return;
  }

  const fragmento = document.createDocumentFragment();
  for (const ingreso of ingresosAdicionales) {
    fragmento.append(crearTarjetaIngreso(ingreso));
  }
  elementos.listaIngresosAdicionales.append(fragmento);
}

function crearTarjetaIngreso(ingreso) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta-ingreso';
  const contenido = document.createElement('div');
  contenido.className = 'tarjeta-ingreso__contenido';
  const procedencia = document.createElement('strong');
  procedencia.textContent = ingreso.procedencia;
  const monto = document.createElement('span');
  monto.className = 'tarjeta-ingreso__monto';
  monto.textContent = formatearMoneda(ingreso.monto);
  contenido.append(procedencia, monto);

  const acciones = document.createElement('div');
  acciones.className = 'acciones-movimiento';
  const botonEditar = crearBotonAccion('Editar ingreso adicional', '✎', 'boton-icono boton-icono--editar');
  botonEditar.addEventListener('click', () => abrirEdicionIngreso(ingreso));
  const botonEliminar = crearBotonAccion('Eliminar ingreso adicional', '×', 'boton-icono boton-icono--eliminar');
  botonEliminar.addEventListener('click', () => confirmarEliminacionIngreso(ingreso, botonEliminar));
  acciones.append(botonEditar, botonEliminar);
  tarjeta.append(contenido, acciones);
  return tarjeta;
}

function abrirEdicionIngreso(ingreso) {
  ingresoEnEdicion = { id: ingreso.id, periodo: periodoSeleccionado };
  elementos.montoIngresoEdicion.value = String(ingreso.monto);
  elementos.procedenciaIngresoEdicion.value = ingreso.procedencia;
  elementos.dialogoEdicionIngreso.showModal();
  elementos.montoIngresoEdicion.focus();
}

async function guardarIngresoEditado(evento) {
  evento.preventDefault();
  if (!ingresoEnEdicion?.id || !elementos.formularioEditarIngreso.reportValidity()) return;
  if (!window.confirm('¿Confirmás guardar los cambios de este ingreso adicional?')) return;
  const edicionActual = { ...ingresoEnEdicion };

  const finalizarCarga = activarCargaBoton(elementos.botonGuardarIngresoEditado, 'Guardando…');
  mostrarEstadoOperacion('Actualizando el ingreso adicional…', 'cargando');
  try {
    await editarIngresoAdicional(edicionActual.periodo, edicionActual.id, {
      monto: elementos.montoIngresoEdicion.value,
      procedencia: elementos.procedenciaIngresoEdicion.value,
    });
    elementos.dialogoEdicionIngreso.close();
    ingresoEnEdicion = null;
    mostrarEstadoOperacion(`Ingreso adicional actualizado en ${formatearPeriodo(edicionActual.periodo)}.`, 'correcto');
  } catch (error) {
    console.error('No se pudo editar el ingreso adicional:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

async function confirmarEliminacionIngreso(ingreso, boton) {
  if (!window.confirm(`¿Querés eliminar el ingreso “${ingreso.procedencia}” por ${formatearMoneda(ingreso.monto)}?`)) return;
  const periodoOperacion = periodoSeleccionado;
  const finalizarCarga = activarCargaBoton(boton, '');
  mostrarEstadoOperacion('Eliminando el ingreso adicional…', 'cargando');
  try {
    await eliminarIngresoAdicional(periodoOperacion, ingreso.id);
    mostrarEstadoOperacion('Ingreso adicional eliminado correctamente.', 'correcto');
  } catch (error) {
    console.error('No se pudo eliminar el ingreso adicional:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

async function guardarIngresoAdicionalDesdeFormulario(evento) {
  evento.preventDefault();
  if (!elementos.formularioIngresoAdicional.reportValidity()) return;

  const periodoOperacion = periodoSeleccionado;
  const finalizarCarga = activarCargaBoton(elementos.botonAgregarIngreso, 'Agregando…');
  mostrarEstadoOperacion('Guardando el ingreso adicional…', 'cargando');
  try {
    await crearIngresoAdicional(periodoOperacion, {
      monto: elementos.montoIngresoAdicional.value,
      procedencia: elementos.procedenciaIngresoAdicional.value,
    });
    elementos.formularioIngresoAdicional.reset();
    mostrarEstadoOperacion(`Ingreso adicional agregado a ${formatearPeriodo(periodoOperacion)}.`, 'correcto');
  } catch (error) {
    console.error('No se pudo agregar el ingreso adicional:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

function renderizarObservacionSaldo() {
  const observacion = mesSeleccionado.observacionSaldo || '';
  const editorAbierto = !elementos.formularioObservacionSaldo.hidden;
  elementos.textoObservacionSaldo.textContent = observacion || 'Todavía no agregaron una observación para este mes.';
  elementos.botonObservacion.textContent = observacion ? 'Editar observación' : 'Agregar observación';
  if (!editorAbierto) elementos.observacionSaldo.value = observacion;
}

function abrirEditorObservacion() {
  elementos.observacionSaldo.value = mesSeleccionado.observacionSaldo || '';
  elementos.formularioObservacionSaldo.hidden = false;
  elementos.observacionSaldo.focus();
}

async function guardarObservacionDesdeFormulario(evento) {
  evento.preventDefault();
  const periodoOperacion = periodoSeleccionado;
  const nuevaObservacion = elementos.observacionSaldo.value.trim();
  const observacionAnterior = mesSeleccionado.observacionSaldo || '';
  if (nuevaObservacion === observacionAnterior) {
    elementos.formularioObservacionSaldo.hidden = true;
    return;
  }
  if (observacionAnterior && !window.confirm('¿Confirmás modificar la observación del saldo de este mes?')) return;

  const finalizarCarga = activarCargaBoton(elementos.botonGuardarObservacion, 'Guardando…');
  mostrarEstadoOperacion('Guardando la observación del mes…', 'cargando');
  try {
    await guardarObservacionSaldo(periodoOperacion, nuevaObservacion);
    if (periodoSeleccionado === periodoOperacion) {
      mesSeleccionado = { ...mesSeleccionado, observacionSaldo: nuevaObservacion };
      elementos.formularioObservacionSaldo.hidden = true;
      renderizarObservacionSaldo();
    }
    mostrarEstadoOperacion(`Observación guardada en ${formatearPeriodo(periodoOperacion)}.`, 'correcto');
  } catch (error) {
    console.error('No se pudo guardar la observación:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

function cambiarVisibilidadDetalleSueldos() {
  const visible = elementos.botonDetalleSueldos.getAttribute('aria-expanded') === 'true';
  elementos.botonDetalleSueldos.setAttribute('aria-expanded', String(!visible));
  elementos.detalleSueldos.classList.toggle('detalle-sueldos--visible', !visible);
  elementos.detalleSueldos.setAttribute('aria-hidden', String(visible));
}

function cambiarPeriodoConsultado(periodo) {
  if (elementos.dialogoEdicionIngreso.open) elementos.dialogoEdicionIngreso.close();
  ingresoEnEdicion = null;
  elementos.formularioObservacionSaldo.hidden = true;
  periodoSeleccionado = periodo;
  gastosMes = [];
  ingresosAdicionales = [];
  mesSeleccionado = crearMesVacio(periodo);
  cargandoGastos = true;
  cargandoMes = true;
  cargandoIngresos = true;
  periodoSueldosInicializado = null;
  edicionesSueldos.mauri = false;
  edicionesSueldos.ro = false;
  elementos.selectorMes.value = periodo;
  cancelarObservadorGastos?.();
  cancelarObservadorMes?.();
  cancelarObservadorIngresos?.();
  elementos.listaMovimientos.replaceChildren(crearMensajeCargando('Cargando movimientos…'));
  elementos.cantidadMovimientos.textContent = 'Cargando movimientos…';
  elementos.totalMovimientos.textContent = '';
  actualizarBalanceMensual();
  renderizarPanelSueldos();
  renderizarIngresosAdicionales();
  elementos.estadoCargaResumen.hidden = false;

  try {
    cancelarObservadorGastos = observarGastosDelMes(periodo, (resultado) => {
      cargandoGastos = false;
      gastosMes = resultado;
      renderizarGastos();
      actualizarBalanceMensual();
      actualizarIndicadorCargaMensual();
    }, (error) => {
      cargandoGastos = false;
      console.error('Error al consultar gastos:', error);
      elementos.listaMovimientos.replaceChildren(crearMensajeVacio(obtenerMensajeDeError(error)));
      elementos.cantidadMovimientos.textContent = 'No se pudieron cargar los movimientos';
      elementos.totalMovimientos.textContent = '';
      actualizarIndicadorCargaMensual();
    });

    cancelarObservadorMes = observarMes(periodo, (resultado) => {
      cargandoMes = false;
      mesSeleccionado = resultado;
      renderizarPanelSueldos();
      renderizarObservacionSaldo();
      actualizarBalanceMensual();
      actualizarIndicadorCargaMensual();
    }, (error) => {
      cargandoMes = false;
      console.error('Error al consultar el mes:', error);
      mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
      actualizarIndicadorCargaMensual();
    });

    cancelarObservadorIngresos = observarIngresosAdicionales(periodo, (resultado) => {
      cargandoIngresos = false;
      ingresosAdicionales = resultado;
      renderizarIngresosAdicionales();
      actualizarBalanceMensual();
      actualizarIndicadorCargaMensual();
    }, (error) => {
      cargandoIngresos = false;
      console.error('Error al consultar ingresos adicionales:', error);
      elementos.listaIngresosAdicionales.replaceChildren(crearMensajeVacio(obtenerMensajeDeError(error)));
      actualizarIndicadorCargaMensual();
    });
  } catch (error) {
    console.error('No se pudo consultar el período:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  }
}

function actualizarIndicadorCargaMensual() {
  const sigueCargando = cargandoGastos || cargandoMes || cargandoIngresos;
  elementos.estadoCargaResumen.hidden = !sigueCargando;
  if (!sigueCargando) {
    actualizarBalanceMensual();
    renderizarGastos();
  }
}

function actualizarBalanceMensual() {
  if (cargandoGastos || cargandoMes || cargandoIngresos) {
    elementos.totalSueldos.textContent = '—';
    elementos.totalIngresosAdicionales.textContent = '—';
    elementos.totalGastosMes.textContent = '—';
    elementos.saldoDisponible.textContent = '—';
    return;
  }

  const resumen = calcularResumenMensual({
    mes: mesSeleccionado,
    gastos: gastosMes,
    ingresosAdicionales,
  });

  elementos.totalSueldos.textContent = formatearMoneda(resumen.totalSueldos);
  elementos.totalIngresosAdicionales.textContent = formatearMoneda(resumen.totalIngresosAdicionales);
  elementos.totalGastosMes.textContent = formatearMoneda(resumen.totalGastos);
  elementos.saldoDisponible.textContent = formatearMoneda(resumen.saldoDisponible);
  elementos.tarjetaSaldoDisponible.classList.toggle('tarjeta-resumen--negativo', resumen.saldoDisponible < 0);

  elementos.detalleSueldoMauri.textContent = mesSeleccionado.sueldoMauri === null
    ? 'Mauri: pendiente de cargar'
    : `Mauri: ${formatearMoneda(resumen.sueldoMauri)}`;
  elementos.detalleSueldoRo.textContent = mesSeleccionado.sueldoRo === null
    ? 'Ro: pendiente de cargar'
    : `Ro: ${formatearMoneda(resumen.sueldoRo)}`;

  const pendientes = [];
  if (mesSeleccionado.sueldoMauri === null) pendientes.push('Mauri');
  if (mesSeleccionado.sueldoRo === null) pendientes.push('Ro');
  elementos.estadoSueldosResumen.textContent = pendientes.length
    ? `Pendiente de ingresar el sueldo de ${pendientes.join(' y ')}. Los gastos se pueden cargar normalmente.`
    : 'Los dos sueldos están registrados para este mes.';
}

function renderizarGastos() {
  if (!elementos.listaMovimientos || elementos.vistaConsulta.hidden) return;

  elementos.listaMovimientos.replaceChildren();
  if (cargandoGastos) {
    elementos.listaMovimientos.append(crearMensajeCargando('Cargando movimientos…'));
    elementos.cantidadMovimientos.textContent = 'Cargando movimientos…';
    elementos.totalMovimientos.textContent = '';
    return;
  }
  const cantidad = gastosMes.length;
  const total = gastosMes.reduce((suma, gasto) => suma + Number(gasto.monto || 0), 0);
  elementos.cantidadMovimientos.textContent = cantidad === 1 ? '1 movimiento' : `${cantidad} movimientos`;
  elementos.totalMovimientos.textContent = formatearMoneda(total);

  if (cantidad === 0) {
    elementos.listaMovimientos.append(crearMensajeVacio('Todavía no hay gastos registrados en este mes.'));
    return;
  }

  const fragmento = document.createDocumentFragment();
  for (const gasto of gastosMes) fragmento.append(crearTarjetaGasto(gasto));
  elementos.listaMovimientos.append(fragmento);
}

function crearTarjetaGasto(gasto) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta-movimiento';

  const contenido = document.createElement('div');
  contenido.className = 'tarjeta-movimiento__contenido';

  const titulo = document.createElement('strong');
  titulo.className = 'tarjeta-movimiento__categoria';
  const categoria = categorias.find((item) => item.id === gasto.categoriaId);
  titulo.textContent = categoria?.nombre || 'Categoría no disponible';

  const detalle = document.createElement('p');
  detalle.className = 'tarjeta-movimiento__detalle';
  const medio = mediosPago.find((item) => item.id === gasto.medioPagoId);
  const responsable = gasto.responsable === 'mauri' ? 'Mauri' : 'Ro';
  detalle.textContent = `${formatearFecha(gasto.fecha)} · ${medio?.nombre || 'Medio no disponible'} · ${responsable}`;
  contenido.append(titulo, detalle);

  const columnaImporte = document.createElement('div');
  columnaImporte.className = 'tarjeta-movimiento__importe';
  const importe = document.createElement('strong');
  importe.textContent = formatearMoneda(gasto.monto);
  columnaImporte.append(importe);

  const acciones = document.createElement('div');
  acciones.className = 'acciones-movimiento';
  const botonEditar = crearBotonAccion('Editar gasto', '✎', 'boton-icono boton-icono--editar');
  botonEditar.addEventListener('click', () => comenzarEdicion(gasto));
  const botonEliminar = crearBotonAccion('Eliminar gasto', '×', 'boton-icono boton-icono--eliminar');
  botonEliminar.addEventListener('click', () => confirmarEliminacion(gasto, botonEliminar));
  acciones.append(botonEditar, botonEliminar);
  tarjeta.append(contenido, columnaImporte, acciones);
  return tarjeta;
}

function crearBotonAccion(ariaLabel, texto, clase) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = clase;
  boton.setAttribute('aria-label', ariaLabel);
  boton.title = ariaLabel;
  boton.textContent = texto;
  return boton;
}

function crearMensajeVacio(texto) {
  const mensaje = document.createElement('p');
  mensaje.className = 'mensaje-vacio';
  mensaje.textContent = texto;
  return mensaje;
}

function crearMensajeCargando(texto) {
  const mensaje = document.createElement('p');
  mensaje.className = 'mensaje-cargando';
  mensaje.append(crearIndicadorCarga(), document.createTextNode(texto));
  return mensaje;
}

async function resolverOpcionPersonalizada(tipo, nombreIngresado) {
  const nombre = nombreIngresado.trim();
  const normalizado = normalizarNombre(nombre);
  if (!normalizado) throw new Error('Completá el nombre de la opción nueva.');
  if (normalizado === 'otros') throw new Error('“Otros” es una opción reservada. Escribí otro nombre.');

  const catalogo = tipo === 'categoria' ? categorias : mediosPago;
  const existente = catalogo.find((item) => item.nombreNormalizado === normalizado || normalizarNombre(item.nombre) === normalizado);
  if (existente?.activo) {
    mostrarEstadoOperacion(`“${existente.nombre}” ya existe. Se utilizará la opción existente.`, 'aviso');
    return existente.id;
  }

  try {
    const resultado = tipo === 'categoria'
      ? await crearOReactivarCategoria(nombre)
      : await crearOReactivarMedioPago(nombre);
    return resultado.id;
  } catch (error) {
    const actualizado = tipo === 'categoria'
      ? await obtenerCategorias({ incluirInactivas: true })
      : await obtenerMediosPago({ incluirInactivos: true });
    const coincidencia = actualizado.find((item) => normalizarNombre(item.nombre) === normalizado && item.activo);
    if (coincidencia) return coincidencia.id;
    const coincidenciaInactiva = actualizado.find((item) => normalizarNombre(item.nombre) === normalizado && !item.activo);
    if (coincidenciaInactiva) {
      const reactivada = tipo === 'categoria'
        ? await crearOReactivarCategoria(nombre)
        : await crearOReactivarMedioPago(nombre);
      return reactivada.id;
    }
    throw error;
  }
}

function obtenerDatosFormularioGasto() {
  return {
    monto: elementos.montoGasto.value,
    fecha: elementos.fechaGasto.value,
    categoriaId: elementos.categoriaGasto.value,
    medioPagoId: elementos.medioPagoGasto.value,
    responsable: elementos.responsableGasto.value,
  };
}

async function guardarGastoDesdeFormulario(evento) {
  evento.preventDefault();
  if (!elementos.formularioGasto.reportValidity()) return;

  const estaEditando = Boolean(gastoEnEdicion);
  const datos = obtenerDatosFormularioGasto();
  if (!datos.categoriaId || !datos.medioPagoId) {
    mostrarEstadoOperacion('Seleccioná una categoría y un medio de pago.', 'error');
    return;
  }
  if (estaEditando && !window.confirm('¿Confirmás guardar los cambios de este gasto?')) return;

  const finalizarCarga = activarCargaBoton(elementos.botonGuardarGasto, estaEditando ? 'Guardando cambios…' : 'Guardando…');
  mostrarEstadoOperacion(estaEditando ? 'Actualizando el gasto…' : 'Guardando el gasto…', 'cargando');

  try {
    if (datos.categoriaId === 'otros') {
      datos.categoriaId = await resolverOpcionPersonalizada('categoria', elementos.categoriaPersonalizada.value);
    }
    if (datos.medioPagoId === 'otros') {
      datos.medioPagoId = await resolverOpcionPersonalizada('medio', elementos.medioPersonalizado.value);
    }

    let periodoDestino;
    if (estaEditando) {
      const resultado = await editarGasto(gastoEnEdicion, datos);
      periodoDestino = resultado.periodoNuevo;
    } else {
      await crearGasto(datos);
      periodoDestino = obtenerPeriodoDeFecha(datos.fecha);
    }

    gastoEnEdicion = null;
    prepararFormularioNuevo();
    if (periodoDestino !== periodoSeleccionado) cambiarPeriodoConsultado(periodoDestino);
    mostrarVista('consulta');
    mostrarEstadoOperacion(estaEditando ? 'Gasto actualizado correctamente.' : 'Gasto guardado correctamente.', 'correcto');
  } catch (error) {
    console.error('No se pudo guardar el gasto:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

function comenzarEdicion(gasto) {
  gastoEnEdicion = gasto.id;
  elementos.montoGasto.value = String(gasto.monto);
  elementos.fechaGasto.value = gasto.fecha;
  actualizarSelectorCategorias(gasto.categoriaId);
  actualizarSelectorMedios(gasto.medioPagoId);
  elementos.responsableGasto.value = gasto.responsable;
  elementos.botonGuardarGasto.textContent = 'Guardar cambios';
  elementos.botonCancelarEdicion.hidden = false;
  mostrarVista('carga');
  mostrarEstadoOperacion('Estás editando un gasto. Los cambios se confirmarán antes de guardarse.', 'aviso');
  elementos.montoGasto.focus();
  elementos.formularioGasto.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function confirmarEliminacion(gasto, boton) {
  const categoria = categorias.find((item) => item.id === gasto.categoriaId)?.nombre || 'este gasto';
  if (!window.confirm(`¿Querés eliminar el gasto “${categoria}” por ${formatearMoneda(gasto.monto)}? Esta acción no se puede deshacer.`)) return;

  const finalizarCarga = activarCargaBoton(boton, '');
  mostrarEstadoOperacion('Eliminando el gasto…', 'cargando');
  try {
    await eliminarGasto(gasto.id);
    mostrarEstadoOperacion('Gasto eliminado correctamente.', 'correcto');
  } catch (error) {
    console.error('No se pudo eliminar el gasto:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

function prepararFormularioNuevo() {
  gastoEnEdicion = null;
  elementos.formularioGasto.reset();
  elementos.fechaGasto.value = obtenerFechaLocalActual();
  elementos.responsableGasto.value = obtenerPersonaPorCorreo(usuarioActivo?.email) || 'mauri';
  elementos.montoGasto.value = '';
  elementos.categoriaPersonalizada.value = '';
  elementos.medioPersonalizado.value = '';
  actualizarSelectorCategorias('');
  actualizarSelectorMedios('');
  elementos.botonGuardarGasto.innerHTML = 'Guardar gasto';
  elementos.botonCancelarEdicion.hidden = true;
}

function cancelarEdicion() {
  prepararFormularioNuevo();
  mostrarEstadoOperacion('Edición cancelada. No se modificó el gasto.', 'aviso');
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);
}

function formatearFecha(fecha) {
  if (typeof fecha !== 'string') return '';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function formatearPeriodo(periodo) {
  const [anio, mes] = periodo.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
    .format(new Date(anio, mes - 1, 1));
}

function obtenerMensajeDeError(error) {
  const codigo = error?.code || '';
  if (codigo === 'auth/unauthorized-domain') return 'Este dominio no está autorizado en Firebase Authentication.';
  if (codigo === 'auth/popup-closed-by-user') return 'Se cerró la ventana de Google antes de completar el acceso.';
  if (codigo === 'auth/popup-blocked') return 'El navegador bloqueó la ventana de Google. Permití las ventanas emergentes para localhost.';
  if (codigo === 'auth/cancelled-popup-request') return 'Ya hay otra ventana de acceso abierta. Completá esa operación.';
  if (codigo === 'permission-denied' || codigo === 'firestore/permission-denied') return 'Firebase rechazó la operación. Revisá las reglas publicadas y que la sesión pertenezca a Mauri o Ro.';
  if (codigo === 'failed-precondition') return 'Firestore indicó que falta una configuración o un índice. Revisá la consola para ver el detalle.';
  if (error?.message) return error.message;
  return 'No se pudo completar la operación. Revisá la consola del navegador para ver el detalle.';
}

if (!firebaseConfigurado) {
  mostrarConfiguracionPendiente();
} else {
  observarEstadoDeSesion(({ estado, usuario }) => {
    revelarInterfazPrincipal();

    if (estado === 'autenticado' && usuario) {
      void iniciarAplicacionPrivada(usuario);
      return;
    }

    if (estado === 'no-autorizado') {
      mostrarPantallaAcceso();
      mostrarEstadoAplicacion('Esa cuenta no está autorizada. Iniciá sesión con Mauri o Ro.', 'error');
      elementos.panelInicioSesion.hidden = false;
      return;
    }

    mostrarPantallaAcceso();
    elementos.panelInicioSesion.hidden = false;
  });
}

elementos.botonIniciarSesion?.addEventListener('click', async () => {
  const finalizarCarga = activarCargaBoton(elementos.botonIniciarSesion, 'Conectando…');
  mostrarEstadoAplicacion('Abriendo el acceso seguro de Google…', 'cargando');
  try {
    await iniciarSesionConGoogle();
  } catch (error) {
    mostrarEstadoAplicacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
});

elementos.botonCerrarSesion?.addEventListener('click', async () => {
  const finalizarCarga = activarCargaBoton(elementos.botonCerrarSesion, 'Cerrando…');
  try {
    await cerrarSesion();
  } catch (error) {
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
});

elementos.botonVistaCarga.addEventListener('click', () => mostrarVista('carga'));
elementos.botonVistaConsulta.addEventListener('click', () => mostrarVista('consulta'));
elementos.formularioGasto.addEventListener('submit', guardarGastoDesdeFormulario);
elementos.botonCancelarEdicion.addEventListener('click', cancelarEdicion);
elementos.categoriaGasto.addEventListener('change', () => {
  actualizarVisibilidadCamposPersonalizados();
  if (elementos.categoriaGasto.value !== 'otros') elementos.categoriaPersonalizada.value = '';
});
elementos.medioPagoGasto.addEventListener('change', () => {
  actualizarVisibilidadCamposPersonalizados();
  if (elementos.medioPagoGasto.value !== 'otros') elementos.medioPersonalizado.value = '';
});
elementos.selectorMes.addEventListener('change', () => {
  if (elementos.selectorMes.value) cambiarPeriodoConsultado(elementos.selectorMes.value);
});
elementos.botonDetalleSueldos.addEventListener('click', cambiarVisibilidadDetalleSueldos);
elementos.contenedorSueldos.addEventListener('submit', guardarSueldoDesdeFormulario);
elementos.contenedorSueldos.addEventListener('click', (evento) => {
  const botonEditar = evento.target.closest('[data-editar-sueldo]');
  if (botonEditar) {
    const persona = botonEditar.dataset.editarSueldo;
    edicionesSueldos[persona] = true;
    elementos.panelSueldos.open = true;
    renderizarPanelSueldos();
    elementos.contenedorSueldos.querySelector(`#monto-sueldo-${persona}`)?.focus();
    return;
  }

  const botonCancelar = evento.target.closest('[data-cancelar-edicion-sueldo]');
  if (botonCancelar) {
    edicionesSueldos[botonCancelar.dataset.cancelarEdicionSueldo] = false;
    renderizarPanelSueldos();
  }
});
elementos.formularioIngresoAdicional.addEventListener('submit', guardarIngresoAdicionalDesdeFormulario);
elementos.formularioEditarIngreso.addEventListener('submit', guardarIngresoEditado);
elementos.botonCancelarIngresoEditado.addEventListener('click', () => {
  elementos.dialogoEdicionIngreso.close();
  ingresoEnEdicion = null;
});
elementos.dialogoEdicionIngreso.addEventListener('close', () => {
  ingresoEnEdicion = null;
  elementos.formularioEditarIngreso.reset();
});
elementos.botonObservacion.addEventListener('click', abrirEditorObservacion);
elementos.formularioObservacionSaldo.addEventListener('submit', guardarObservacionDesdeFormulario);
elementos.botonCancelarObservacion.addEventListener('click', () => {
  elementos.formularioObservacionSaldo.hidden = true;
  elementos.observacionSaldo.value = mesSeleccionado.observacionSaldo || '';
});

