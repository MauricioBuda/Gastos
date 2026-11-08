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
  crearOReactivarCategoria,
  editarCategoria,
  eliminarCategoria,
  actualizarVisibilidadCategoria,
  obtenerCategorias,
} from './servicios/catalogos.js';
import {
  crearGasto,
  editarGasto,
  eliminarGasto,
  observarGastosDelMes,
  observarGastosEnRango,
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
import {
  filtrarGastos,
  agruparImportesPor,
  obtenerPeriodosRecientes,
  crearResumenesEvolucionMensual,
  agruparGastosPorSemana,
  contarFiltrosActivos,
} from './servicios/analisis.js';

const elementos = {
  pantallaEsperaInicial: document.querySelector('#pantalla-espera-inicial'),
  contenedorAplicacion: document.querySelector('#contenedor-aplicacion'),
  panelAcceso: document.querySelector('#panel-acceso'),
  panelInicioSesion: document.querySelector('#panel-inicio-sesion'),
  panelConfiguracion: document.querySelector('#panel-configuracion'),
  panelAplicacion: document.querySelector('#panel-aplicacion'),
  estadoAplicacion: document.querySelector('#estado-aplicacion'),
  contenedorNotificaciones: document.querySelector('#contenedor-notificaciones'),
  dialogoConfirmacion: document.querySelector('#dialogo-confirmacion'),
  tituloDialogoConfirmacion: document.querySelector('#titulo-dialogo-confirmacion'),
  mensajeDialogoConfirmacion: document.querySelector('#mensaje-dialogo-confirmacion'),
  botonCancelarConfirmacion: document.querySelector('#boton-cancelar-confirmacion'),
  botonAceptarConfirmacion: document.querySelector('#boton-aceptar-confirmacion'),
  botonIniciarSesion: document.querySelector('#boton-iniciar-sesion'),
  botonCerrarSesion: document.querySelector('#boton-cerrar-sesion'),
  botonAdministrarCatalogos: document.querySelector('#boton-administrar-catalogos'),
  dialogoAdministracionCatalogos: document.querySelector('#dialogo-administracion-catalogos'),
  botonCerrarAdministracion: document.querySelector('#boton-cerrar-administracion'),
  formularioNuevaCategoria: document.querySelector('#formulario-nueva-categoria'),
  nombreNuevaCategoria: document.querySelector('#nombre-nueva-categoria'),
  botonGuardarNuevaCategoria: document.querySelector('#boton-guardar-nueva-categoria'),
  listaCategoriasActivas: document.querySelector('#lista-categorias-activas'),
  listaCategoriasInactivas: document.querySelector('#lista-categorias-inactivas'),
  cantidadCategoriasActivas: document.querySelector('#cantidad-categorias-activas'),
  cantidadCategoriasInactivas: document.querySelector('#cantidad-categorias-inactivas'),
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
  tarjetaIngresosAdicionales: document.querySelector('#tarjeta-ingresos-adicionales'),
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
  responsableGasto: document.querySelector('#responsable-gasto'),
  fechaGasto: document.querySelector('#fecha-gasto'),
  botonGuardarGasto: document.querySelector('#boton-guardar-gasto'),
  botonCancelarEdicion: document.querySelector('#boton-cancelar-edicion'),
  cantidadMovimientos: document.querySelector('#cantidad-movimientos'),
  totalMovimientos: document.querySelector('#total-movimientos'),
  listaMovimientos: document.querySelector('#lista-movimientos'),
  subvistaMovimientos: document.querySelector('#subvista-movimientos'),
  subvistaDashboard: document.querySelector('#subvista-dashboard'),
  subvistaGraficos: document.querySelector('#subvista-graficos'),
  botonSubvistaMovimientos: document.querySelector('#boton-subvista-movimientos'),
  botonSubvistaDashboard: document.querySelector('#boton-subvista-dashboard'),
  botonSubvistaGraficos: document.querySelector('#boton-subvista-graficos'),
  filtroCategoria: document.querySelector('#filtro-categoria'),
  filtroPersona: document.querySelector('#filtro-persona'),
  filtroMontoMinimo: document.querySelector('#filtro-monto-minimo'),
  filtroMontoMaximo: document.querySelector('#filtro-monto-maximo'),
  filtroFechaDesde: document.querySelector('#filtro-fecha-desde'),
  filtroFechaHasta: document.querySelector('#filtro-fecha-hasta'),
  filtroOrden: document.querySelector('#filtro-orden'),
  contadorFiltros: document.querySelector('#contador-filtros'),
  ayudaFiltros: document.querySelector('#ayuda-filtros'),
  botonLimpiarFiltros: document.querySelector('#boton-limpiar-filtros'),
  grupoBotonesGraficos: document.querySelector('#grupo-botones-graficos'),
  panelGrafico: document.querySelector('#panel-grafico'),
  tituloGraficoActivo: document.querySelector('#titulo-grafico-activo'),
  descripcionGraficoActivo: document.querySelector('#descripcion-grafico-activo'),
  contenidoGrafico: document.querySelector('#contenido-grafico'),
  controlAlcanceGrafico: document.querySelector('#control-alcance-grafico'),
  selectorCantidadMeses: document.querySelector('#selector-cantidad-meses'),
  ayudaGraficos: document.querySelector('#ayuda-graficos'),
  piePagina: document.querySelector('#pie-pagina'),
};

let usuarioActivo = null;
let categorias = [];
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
let cancelarObservadorGastos = null;
let cancelarObservadorMes = null;
let cancelarObservadorIngresos = null;
let vistaActiva = 'carga';
let uidInicializando = null;
let uidAplicacionLista = null;
let periodoSueldosInicializado = null;
const edicionesSueldos = { mauri: false, ro: false };
let resolverConfirmacionPendiente = null;
let temporizadorNotificacion = null;
let subvistaActiva = 'movimientos';
let graficosDesplegados = false;
let tipoGraficoActivo = null;
let canceladorObservadorGastosGrafico = null;
let canceladoresObservadoresHistorial = [];
let periodosGraficoActivo = [];
let gastosHistoricosGrafico = [];
let mesesHistoricosGrafico = {};
let ingresosHistoricosGrafico = {};
let gastoRangoGraficoCargado = false;
let periodosMesGraficoCargados = new Set();
let periodosIngresosGraficoCargados = new Set();
let versionSuscripcionGrafico = 0;
let catalogoEnEdicion = null;

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
  if (temporizadorNotificacion) {
    clearTimeout(temporizadorNotificacion);
    temporizadorNotificacion = null;
  }
  const contenedor = elementos.contenedorNotificaciones;
  contenedor.replaceChildren();
  if (!mensaje) {
    if (contenedor.open) contenedor.close();
    return;
  }

  const notificacion = document.createElement('div');
  notificacion.className = 'notificacion';
  notificacion.dataset.tipo = tipo;
  notificacion.setAttribute('role', tipo === 'error' ? 'alert' : 'status');

  const icono = document.createElement('span');
  icono.className = 'notificacion__icono';
  icono.setAttribute('aria-hidden', 'true');
  if (tipo === 'cargando') {
    icono.append(crearIndicadorCarga());
  } else {
    icono.textContent = tipo === 'correcto' ? '✓' : tipo === 'error' ? '×' : tipo === 'aviso' ? '!' : 'i';
  }

  const texto = document.createElement('span');
  texto.className = 'notificacion__mensaje';
  texto.textContent = mensaje;

  const cerrar = document.createElement('button');
  cerrar.className = 'notificacion__cerrar';
  cerrar.type = 'button';
  cerrar.setAttribute('aria-label', 'Cerrar notificación');
  cerrar.textContent = '×';
  cerrar.addEventListener('click', retirarNotificacion);

  notificacion.append(icono, texto, cerrar);
  contenedor.append(notificacion);
  if (!contenedor.open) contenedor.showModal();

  // Los avisos de resultado permanecen exactamente tres segundos en el centro.
  // Los estados de carga continúan visibles hasta que finaliza la operación.
  if (tipo !== 'cargando') temporizadorNotificacion = setTimeout(retirarNotificacion, 3000);
}

function retirarNotificacion() {
  if (temporizadorNotificacion) {
    clearTimeout(temporizadorNotificacion);
    temporizadorNotificacion = null;
  }
  const contenedor = elementos.contenedorNotificaciones;
  const notificacion = contenedor.firstElementChild;
  if (!notificacion) {
    if (contenedor.open) contenedor.close();
    return;
  }
  notificacion.classList.add('notificacion--salida');
  const finalizar = () => {
    if (notificacion.isConnected) notificacion.remove();
    if (!contenedor.firstElementChild && contenedor.open) contenedor.close();
  };
  notificacion.addEventListener('animationend', finalizar, { once: true });
  setTimeout(finalizar, 220);
}

function solicitarConfirmacion({
  titulo = '¿Confirmás esta acción?',
  mensaje = 'Revisá los datos antes de continuar.',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  destructiva = false,
} = {}) {
  if (elementos.dialogoConfirmacion.open) return Promise.resolve(false);

  elementos.tituloDialogoConfirmacion.textContent = titulo;
  elementos.mensajeDialogoConfirmacion.textContent = mensaje;
  elementos.botonAceptarConfirmacion.textContent = textoConfirmar;
  elementos.botonCancelarConfirmacion.textContent = textoCancelar;
  elementos.botonAceptarConfirmacion.classList.toggle('boton-confirmacion--destructivo', destructiva);

  return new Promise((resolver) => {
    resolverConfirmacionPendiente = resolver;
    elementos.dialogoConfirmacion.showModal();
    requestAnimationFrame(() => elementos.botonCancelarConfirmacion.focus());
  });
}

function cerrarDialogoConfirmacion(resultado) {
  const resolver = resolverConfirmacionPendiente;
  resolverConfirmacionPendiente = null;
  if (elementos.dialogoConfirmacion.open) elementos.dialogoConfirmacion.close();
  resolver?.(resultado);
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
  detenerObservadoresGraficoMensual();
  cancelarObservadorCategorias?.();
  cancelarObservadorGastos?.();
  cancelarObservadorMes?.();
  cancelarObservadorIngresos?.();
  cancelarObservadorCategorias = null;
  cancelarObservadorGastos = null;
  cancelarObservadorMes = null;
  cancelarObservadorIngresos = null;
}

function mostrarPantallaAcceso() {
  detenerObservadores();
  usuarioActivo = null;
  categorias = [];
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
  if (elementos.dialogoAdministracionCatalogos.open) elementos.dialogoAdministracionCatalogos.close();
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
  const verCarga = nombre === 'carga';
  if (verCarga && subvistaActiva === 'graficos') {
    // No mantener lecturas históricas abiertas cuando se abandona la consulta.
    detenerObservadoresGraficoMensual();
    tipoGraficoActivo = null;
    elementos.panelGrafico.hidden = true;
    actualizarEstadoBotonesGraficos();
  }
  vistaActiva = nombre;
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
    mostrarSubvistaConsulta(subvistaActiva, true);
    renderizarGastos();
  }
  mostrarEstadoOperacion('');
}

function mostrarSubvistaConsulta(nombre, forzar = false) {
  if (nombre === 'graficos' && subvistaActiva === 'graficos' && !forzar) {
    graficosDesplegados = !graficosDesplegados;
    elementos.grupoBotonesGraficos.hidden = !graficosDesplegados;
    elementos.panelGrafico.hidden = true;
    elementos.ayudaGraficos.hidden = !graficosDesplegados;
    tipoGraficoActivo = null;
    detenerObservadoresGraficoMensual();
    elementos.controlAlcanceGrafico.hidden = true;
    actualizarEstadoBotonesGraficos();
    elementos.botonSubvistaGraficos.setAttribute('aria-expanded', String(graficosDesplegados));
    return;
  }

  subvistaActiva = nombre;
  elementos.subvistaMovimientos.hidden = nombre !== 'movimientos';
  elementos.subvistaDashboard.hidden = nombre !== 'dashboard';
  elementos.subvistaGraficos.hidden = nombre !== 'graficos';

  const botones = [
    [elementos.botonSubvistaMovimientos, 'movimientos'],
    [elementos.botonSubvistaDashboard, 'dashboard'],
    [elementos.botonSubvistaGraficos, 'graficos'],
  ];
  for (const [boton, identificador] of botones) {
    const activo = identificador === nombre;
    boton.classList.toggle('boton-vista-consulta--activo', activo);
    boton.setAttribute('aria-pressed', String(activo));
  }

  if (nombre === 'movimientos') {
    elementos.botonSubvistaGraficos.setAttribute('aria-expanded', 'false');
    graficosDesplegados = false;
    elementos.grupoBotonesGraficos.hidden = true;
    elementos.panelGrafico.hidden = true;
    elementos.ayudaGraficos.hidden = true;
    tipoGraficoActivo = null;
    detenerObservadoresGraficoMensual();
    renderizarGastos();
  } else if (nombre === 'dashboard') {
    elementos.botonSubvistaGraficos.setAttribute('aria-expanded', 'false');
    graficosDesplegados = false;
    elementos.grupoBotonesGraficos.hidden = true;
    elementos.panelGrafico.hidden = true;
    elementos.ayudaGraficos.hidden = true;
    tipoGraficoActivo = null;
    detenerObservadoresGraficoMensual();
  } else {
    detenerObservadoresGraficoMensual();
    graficosDesplegados = true;
    tipoGraficoActivo = null;
    elementos.panelGrafico.hidden = true;
    elementos.controlAlcanceGrafico.hidden = true;
    elementos.grupoBotonesGraficos.hidden = false;
    elementos.ayudaGraficos.hidden = false;
    elementos.botonSubvistaGraficos.setAttribute('aria-expanded', 'true');
    actualizarEstadoBotonesGraficos();
  }
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
  actualizarOpcionesFiltros();
  mostrarSubvistaConsulta('movimientos', true);
  prepararFormularioNuevo();
  mostrarVista('carga');
}

async function iniciarAplicacionPrivada(usuario) {
  if (!usuario?.uid || uidAplicacionLista === usuario.uid || uidInicializando === usuario.uid) return;
  uidInicializando = usuario.uid;
  mostrarUsuario(usuario);
  mostrarEstadoOperacion('Preparando los catálogos…', 'cargando');

  try {
    await inicializarCatalogosBase();
    if (auth?.currentUser?.uid !== usuario.uid) return;

    iniciarObservadoresCatalogos();
    cambiarPeriodoConsultado(periodoSeleccionado);
    uidAplicacionLista = usuario.uid;
    // La preparación de catálogos no requiere un aviso permanente en pantalla.
    mostrarEstadoOperacion('');
  } catch (error) {
    console.error('No se pudo preparar la aplicación:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    if (uidInicializando === usuario.uid) uidInicializando = null;
  }
}

function iniciarObservadoresCatalogos() {
  cancelarObservadorCategorias?.();

  cancelarObservadorCategorias = observarCategorias((resultado) => {
    categorias = resultado;
    actualizarSelectorCategorias();
    actualizarOpcionesFiltros();
    renderizarGastos();
    if (tipoGraficoActivo && tipoGraficoActivo !== 'mensual') renderizarGraficoActivo();
    if (elementos.dialogoAdministracionCatalogos.open) renderizarAdministracionCatalogos();
  }, (error) => {
    console.error('Error al consultar categorías:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  }, { incluirInactivas: true });
}

async function abrirAdministracionCatalogos() {
  if (elementos.dialogoAdministracionCatalogos.open) return;
  const finalizarCarga = activarCargaBoton(elementos.botonAdministrarCatalogos, 'Cargando…');
  mostrarEstadoOperacion('Consultando categorías…', 'cargando');
  try {
    categorias = await obtenerCategorias({ incluirInactivas: true });
    actualizarSelectorCategorias();
    actualizarOpcionesFiltros();
    catalogoEnEdicion = null;
    renderizarAdministracionCatalogos();
    elementos.dialogoAdministracionCatalogos.showModal();
    mostrarEstadoOperacion('');
    requestAnimationFrame(() => elementos.botonCerrarAdministracion.focus());
  } catch (error) {
    console.error('No se pudieron consultar las categorías para administrarlas:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

function renderizarAdministracionCatalogos() {
  if (!elementos.listaCategoriasActivas) return;
  renderizarListaAdministracionCatalogo(categorias);
}

function renderizarListaAdministracionCatalogo(catalogo) {
  const contenedorActivos = document.getElementById('lista-categorias-activas');
  const contenedorInactivos = document.getElementById('lista-categorias-inactivas');
  const contadorActivos = document.getElementById('cantidad-categorias-activas');
  const contadorInactivos = document.getElementById('cantidad-categorias-inactivas');

  if (!contenedorActivos || !contenedorInactivos) {
    throw new Error('Falta la estructura HTML para administrar categorías. Revisá que index.html corresponda a esta versión.');
  }

  const comparar = (a, b) => {
    if (a.id === 'otros') return 1;
    if (b.id === 'otros') return -1;
    return (a.orden ?? 999) - (b.orden ?? 999) || a.nombre.localeCompare(b.nombre, 'es-AR');
  };
  const activos = catalogo.filter((item) => item.activo).sort(comparar);
  const inactivos = catalogo.filter((item) => !item.activo).sort(comparar);
  if (contadorActivos) contadorActivos.textContent = String(activos.length);
  if (contadorInactivos) contadorInactivos.textContent = String(inactivos.length);
  contenedorActivos.replaceChildren();
  contenedorInactivos.replaceChildren();

  if (activos.length) activos.forEach((item) => contenedorActivos.append(crearFilaAdministracionCatalogo(item, false)));
  else contenedorActivos.append(crearMensajeVacio('No hay categorías activas.'));

  if (inactivos.length) inactivos.forEach((item) => contenedorInactivos.append(crearFilaAdministracionCatalogo(item, true)));
  else contenedorInactivos.append(crearMensajeVacio('No hay categorías eliminadas.'));
}

function crearIconoOjo(oculto) {
  const espacioSVG = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(espacioSVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('icono-ojo-categoria');
  const contorno = document.createElementNS(espacioSVG, 'path');
  contorno.setAttribute('d', 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z');
  contorno.setAttribute('fill', 'none');
  contorno.setAttribute('stroke', 'currentColor');
  contorno.setAttribute('stroke-width', '1.8');
  contorno.setAttribute('stroke-linecap', 'round');
  contorno.setAttribute('stroke-linejoin', 'round');
  svg.append(contorno);
  if (oculto) {
    const linea = document.createElementNS(espacioSVG, 'path');
    linea.setAttribute('d', 'M4 4 20 20');
    linea.setAttribute('fill', 'none');
    linea.setAttribute('stroke', 'currentColor');
    linea.setAttribute('stroke-width', '2');
    linea.setAttribute('stroke-linecap', 'round');
    svg.append(linea);
  } else {
    const pupila = document.createElementNS(espacioSVG, 'circle');
    pupila.setAttribute('cx', '12');
    pupila.setAttribute('cy', '12');
    pupila.setAttribute('r', '3');
    pupila.setAttribute('fill', 'none');
    pupila.setAttribute('stroke', 'currentColor');
    pupila.setAttribute('stroke-width', '1.8');
    svg.append(pupila);
  }
  return svg;
}

async function cambiarVisibilidadCategoria(item, boton) {
  const nuevaVisibilidad = item.visibleEnFormulario === false;
  const finalizarCarga = activarCargaBoton(boton, '');
  mostrarEstadoOperacion(nuevaVisibilidad ? 'Mostrando la categoría en el formulario…' : 'Ocultando la categoría del formulario…', 'cargando');
  try {
    await actualizarVisibilidadCategoria(item.id, nuevaVisibilidad);
    mostrarEstadoOperacion(nuevaVisibilidad
      ? `“${item.nombre}” ya aparece en el desplegable de gastos.`
      : `“${item.nombre}” ya no aparece en el desplegable. Los gastos anteriores se conservaron.`, 'correcto');
  } catch (error) {
    console.error('No se pudo cambiar la visibilidad de la categoría:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

function crearFilaAdministracionCatalogo(item, estaInactiva) {
  const fila = document.createElement('article');
  fila.className = 'fila-administracion-catalogo';
  fila.dataset.tipoCatalogo = 'categoria';
  fila.dataset.idCatalogo = item.id;

  if (!estaInactiva && catalogoEnEdicion?.id === item.id) {
    const formulario = document.createElement('form');
    formulario.className = 'formulario-edicion-catalogo';
    formulario.dataset.formularioEditarCatalogo = 'categoria';
    const campo = document.createElement('input');
    campo.type = 'text';
    campo.value = item.nombre;
    campo.maxLength = 60;
    campo.required = true;
    campo.autocomplete = 'off';
    campo.setAttribute('aria-label', `Nuevo nombre para ${item.nombre}`);
    campo.dataset.campoEdicionCatalogo = '';
    const acciones = document.createElement('div');
    acciones.className = 'acciones-edicion-catalogo';
    const guardar = document.createElement('button');
    guardar.type = 'submit';
    guardar.className = 'boton-principal boton-principal--compacto';
    guardar.textContent = 'Guardar';
    const cancelar = document.createElement('button');
    cancelar.type = 'button';
    cancelar.className = 'boton-secundario boton-secundario--compacto';
    cancelar.textContent = 'Cancelar';
    cancelar.addEventListener('click', () => {
      catalogoEnEdicion = null;
      renderizarAdministracionCatalogos();
    });
    acciones.append(guardar, cancelar);
    formulario.append(campo, acciones);
    formulario.addEventListener('submit', (evento) => guardarEdicionCatalogo(evento, item, guardar));
    fila.append(formulario);
    requestAnimationFrame(() => campo.focus());
    return fila;
  }

  const contenido = document.createElement('div');
  contenido.className = 'fila-administracion-catalogo__contenido';
  const nombre = document.createElement('strong');
  nombre.className = 'fila-administracion-catalogo__nombre';
  nombre.textContent = item.id === 'otros' ? 'Agregar otra categoría' : item.nombre;
  contenido.append(nombre);

  if (estaInactiva) {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-catalogo etiqueta-catalogo--inactiva';
    etiqueta.textContent = 'Eliminada';
    contenido.append(etiqueta);
  } else if (item.protegida) {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-catalogo';
    etiqueta.textContent = 'Siempre disponible';
    contenido.append(etiqueta);
  } else if (item.visibleEnFormulario === false) {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-catalogo etiqueta-catalogo--oculta';
    etiqueta.textContent = 'Oculta del formulario';
    contenido.append(etiqueta);
  }

  const acciones = document.createElement('div');
  acciones.className = 'acciones-fila-catalogo';
  if (estaInactiva) {
    const restaurar = document.createElement('button');
    restaurar.type = 'button';
    restaurar.className = 'boton-secundario boton-restaurar-catalogo';
    restaurar.textContent = 'Restaurar';
    restaurar.addEventListener('click', () => restaurarCategoria(item, restaurar));
    acciones.append(restaurar);
  } else if (item.id !== 'otros') {
    const visibilidad = document.createElement('button');
    visibilidad.type = 'button';
    const estaVisible = item.visibleEnFormulario !== false;
    visibilidad.className = `boton-icono boton-visibilidad-categoria${estaVisible ? '' : ' boton-visibilidad-categoria--oculta'}`;
    visibilidad.append(crearIconoOjo(!estaVisible));
    visibilidad.title = estaVisible ? `Ocultar ${item.nombre} del formulario` : `Mostrar ${item.nombre} en el formulario`;
    visibilidad.setAttribute('aria-label', visibilidad.title);
    visibilidad.setAttribute('aria-pressed', String(estaVisible));
    visibilidad.addEventListener('click', () => cambiarVisibilidadCategoria(item, visibilidad));
    acciones.append(visibilidad);

    if (!item.protegida) {
      const editar = document.createElement('button');
      editar.type = 'button';
      editar.className = 'boton-icono boton-icono--editar';
      editar.textContent = '✎';
      editar.title = `Editar ${item.nombre}`;
      editar.setAttribute('aria-label', `Editar ${item.nombre}`);
      editar.addEventListener('click', () => {
        catalogoEnEdicion = { id: item.id };
        renderizarAdministracionCatalogos();
        const filaActual = elementos.listaCategoriasActivas.querySelector(`[data-id-catalogo="${item.id}"] [data-campo-edicion-catalogo]`);
        filaActual?.focus();
      });

      const eliminar = document.createElement('button');
      eliminar.type = 'button';
      eliminar.className = 'boton-icono boton-icono--eliminar';
      eliminar.textContent = '×';
      eliminar.title = `Eliminar ${item.nombre}`;
      eliminar.setAttribute('aria-label', `Eliminar ${item.nombre}`);
      eliminar.addEventListener('click', () => eliminarCategoriaDesdeAdministracion(item, eliminar));
      acciones.append(editar, eliminar);
    }
  }

  fila.append(contenido, acciones);
  if (estaInactiva) fila.classList.add('fila-administracion-catalogo--inactiva');
  if (item.protegida) fila.classList.add('fila-administracion-catalogo--protegida');
  return fila;
}

async function guardarNuevaOpcionCatalogo(evento) {
  evento.preventDefault();
  const formulario = elementos.formularioNuevaCategoria;
  const campo = elementos.nombreNuevaCategoria;
  const boton = elementos.botonGuardarNuevaCategoria;
  if (!formulario.reportValidity()) return;

  const nombre = campo.value.trim();
  const finalizarCarga = activarCargaBoton(boton, 'Guardando…');
  mostrarEstadoOperacion('Guardando categoría…', 'cargando');
  try {
    const resultado = await crearOReactivarCategoria(nombre);
    formulario.reset();
    catalogoEnEdicion = null;
    mostrarEstadoOperacion(resultado.reactivada
      ? `${resultado.nombre} se recuperó. Revisá el ojo para decidir si aparece en el formulario.`
      : `${resultado.nombre} se agregó. Activá el ojo si querés mostrarla al cargar gastos.`, 'correcto');
    renderizarAdministracionCatalogos();
  } catch (error) {
    console.error('No se pudo agregar la categoría:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

async function guardarEdicionCatalogo(evento, item, boton) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  if (!formulario.reportValidity()) return;
  const campo = formulario.querySelector('[data-campo-edicion-catalogo]');
  const nombreNuevo = campo.value.trim();
  if (!nombreNuevo) {
    mostrarEstadoOperacion('El nombre no puede quedar vacío.', 'error');
    campo.focus();
    return;
  }
  if (nombreNuevo === item.nombre) {
    catalogoEnEdicion = null;
    renderizarAdministracionCatalogos();
    mostrarEstadoOperacion('No hay cambios para guardar.', 'aviso');
    return;
  }

  const confirmado = await solicitarConfirmacion({
    titulo: 'Editar categoría',
    mensaje: `¿Querés cambiar “${item.nombre}” por “${nombreNuevo}”? El nuevo nombre también se mostrará en los movimientos anteriores.`,
    textoConfirmar: 'Guardar cambios',
  });
  if (!confirmado) return;

  catalogoEnEdicion = null;
  const finalizarCarga = activarCargaBoton(boton, 'Guardando…');
  mostrarEstadoOperacion('Actualizando categoría…', 'cargando');
  try {
    await editarCategoria(item.id, nombreNuevo);
    mostrarEstadoOperacion(`Se actualizó “${nombreNuevo}”. Los movimientos anteriores ya muestran el nuevo nombre.`, 'correcto');
    renderizarAdministracionCatalogos();
  } catch (error) {
    console.error('No se pudo editar la categoría:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
    renderizarAdministracionCatalogos();
  } finally {
    finalizarCarga();
  }
}

async function eliminarCategoriaDesdeAdministracion(item, boton) {
  const confirmado = await solicitarConfirmacion({
    titulo: 'Eliminar categoría',
    mensaje: `¿Querés quitar “${item.nombre}” de las opciones disponibles? Los movimientos anteriores conservarán esta categoría y podrás recuperarla más adelante.`,
    textoConfirmar: 'Eliminar categoría',
    destructiva: true,
  });
  if (!confirmado) return;

  const finalizarCarga = activarCargaBoton(boton, 'Eliminando…');
  mostrarEstadoOperacion('Eliminando categoría…', 'cargando');
  try {
    await eliminarCategoria(item.id);
    mostrarEstadoOperacion(`“${item.nombre}” se quitó de las opciones nuevas. El historial se conservó.`, 'correcto');
    renderizarAdministracionCatalogos();
  } catch (error) {
    console.error('No se pudo eliminar la categoría:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

async function restaurarCategoria(item, boton) {
  const confirmado = await solicitarConfirmacion({
    titulo: 'Recuperar categoría',
    mensaje: `¿Querés volver a habilitar “${item.nombre}”? Se recuperará la opción anterior, sin crear un duplicado.`,
    textoConfirmar: 'Recuperar categoría',
  });
  if (!confirmado) return;

  const finalizarCarga = activarCargaBoton(boton, 'Recuperando…');
  mostrarEstadoOperacion('Recuperando categoría…', 'cargando');
  try {
    const resultado = await crearOReactivarCategoria(item.nombre);
    mostrarEstadoOperacion(`“${resultado.nombre}” volvió a estar disponible.`, 'correcto');
    renderizarAdministracionCatalogos();
  } catch (error) {
    console.error('No se pudo recuperar la categoría:', error);
    mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
  } finally {
    finalizarCarga();
  }
}

function actualizarSelectorCategorias(idSeleccionado = elementos.categoriaGasto.value) {
  const opcionesVisibles = categorias.filter((item) => {
    if (item.id === 'otros') return true;
    return (item.activo && item.visibleEnFormulario !== false) || item.id === idSeleccionado;
  });
  opcionesVisibles.sort((a, b) => {
    if (a.id === 'otros') return 1;
    if (b.id === 'otros') return -1;
    return (a.orden ?? 999) - (b.orden ?? 999) || a.nombre.localeCompare(b.nombre, 'es-AR');
  });
  const fragmento = document.createDocumentFragment();
  const opcionInicial = document.createElement('option');
  opcionInicial.value = '';
  opcionInicial.textContent = 'Seleccioná una categoría';
  opcionInicial.disabled = true;
  fragmento.append(opcionInicial);

  opcionesVisibles.forEach((item) => {
    const opcion = document.createElement('option');
    opcion.value = item.id;
    opcion.textContent = item.id === 'otros' ? 'Agregar otra categoría' : item.nombre;
    opcion.disabled = !item.activo && item.id !== idSeleccionado;
    fragmento.append(opcion);
  });
  elementos.categoriaGasto.replaceChildren(fragmento);
  elementos.categoriaGasto.value = idSeleccionado || '';
  actualizarVisibilidadCamposPersonalizados();
}

function actualizarVisibilidadCamposPersonalizados() {
  const esCategoriaEspecial = elementos.categoriaGasto.value === 'otros';
  elementos.contenedorCategoriaPersonalizada.hidden = !esCategoriaEspecial;
  elementos.categoriaPersonalizada.required = esCategoriaEspecial;
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

  if (esEdicion && !(await solicitarConfirmacion({
    titulo: 'Corregir sueldo',
    mensaje: `¿Confirmás corregir el sueldo de ${nombre} para ${formatearPeriodo(periodoOperacion)}?`,
    textoConfirmar: 'Guardar cambios',
  }))) return;

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
  elementos.cantidadIngresosAdicionales.hidden = ingresosAdicionales.length === 0;
  elementos.listaIngresosAdicionales.replaceChildren();

  if (cargandoIngresos) {
    elementos.listaIngresosAdicionales.hidden = false;
    elementos.listaIngresosAdicionales.append(crearMensajeCargando('Consultando ingresos…'));
    return;
  }

  if (ingresosAdicionales.length === 0) {
    elementos.listaIngresosAdicionales.hidden = true;
    return;
  }
  elementos.listaIngresosAdicionales.hidden = false;

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
  if (!(await solicitarConfirmacion({
    titulo: 'Guardar cambios del ingreso',
    mensaje: '¿Confirmás guardar los cambios de este ingreso adicional?',
    textoConfirmar: 'Guardar cambios',
  }))) return;
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
  if (!(await solicitarConfirmacion({
    titulo: 'Eliminar ingreso adicional',
    mensaje: `¿Querés eliminar el ingreso “${ingreso.procedencia}” por ${formatearMoneda(ingreso.monto)}? Esta acción no se puede deshacer.`,
    textoConfirmar: 'Eliminar ingreso',
    destructiva: true,
  }))) return;
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
  if (observacionAnterior && !(await solicitarConfirmacion({
    titulo: 'Modificar observación',
    mensaje: '¿Confirmás modificar la observación del saldo de este mes?',
    textoConfirmar: 'Guardar cambios',
  }))) return;

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
  if (subvistaActiva === 'graficos' && tipoGraficoActivo === 'mensual' && graficosDesplegados) prepararObservadoresGraficoMensual();
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
      if (tipoGraficoActivo && tipoGraficoActivo !== 'mensual') renderizarGraficoActivo();
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
      if (tipoGraficoActivo === 'ingresos-gastos') renderizarGraficoActivo();
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
      if (tipoGraficoActivo === 'ingresos-gastos') renderizarGraficoActivo();
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
    elementos.tarjetaIngresosAdicionales.hidden = true;
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
  elementos.tarjetaIngresosAdicionales.hidden = ingresosAdicionales.length === 0;
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

function obtenerFiltrosActuales() {
  return {
    categoriaId: elementos.filtroCategoria.value,
    responsable: elementos.filtroPersona.value,
    montoMinimo: elementos.filtroMontoMinimo.value,
    montoMaximo: elementos.filtroMontoMaximo.value,
    fechaDesde: elementos.filtroFechaDesde.value,
    fechaHasta: elementos.filtroFechaHasta.value,
    orden: elementos.filtroOrden.value,
    nombresCategorias: Object.fromEntries(categorias.map((item) => [item.id, nombreVisibleCategoria(item)])),
  };
}

function nombreVisibleCategoria(item) {
  return item?.id === 'otros' ? 'Agregar otra categoría' : (item?.nombre || 'Categoría no disponible');
}

function actualizarOpcionesFiltros() {
  const valorCategoria = elementos.filtroCategoria.value;
  elementos.filtroCategoria.replaceChildren();
  const opcionTodas = document.createElement('option');
  opcionTodas.value = '';
  opcionTodas.textContent = 'Todas';
  elementos.filtroCategoria.append(opcionTodas);
  categorias
    .filter((item) => item.id !== 'otros')
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-AR'))
    .forEach((item) => {
      const opcion = document.createElement('option');
      opcion.value = item.id;
      opcion.textContent = item.activo ? item.nombre : `${item.nombre} (inactiva)`;
      elementos.filtroCategoria.append(opcion);
    });
  elementos.filtroCategoria.value = valorCategoria;
}

function limpiarFiltros() {
  elementos.filtroCategoria.value = '';
  elementos.filtroPersona.value = '';
  elementos.filtroMontoMinimo.value = '';
  elementos.filtroMontoMaximo.value = '';
  elementos.filtroFechaDesde.value = '';
  elementos.filtroFechaHasta.value = '';
  elementos.filtroOrden.value = 'fecha-desc';
  renderizarGastos();
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

  let gastosFiltrados;
  try {
    gastosFiltrados = filtrarGastos(gastosMes, obtenerFiltrosActuales());
    elementos.ayudaFiltros.textContent = 'Los filtros se pueden combinar. Los gráficos no se modifican.';
  } catch (error) {
    elementos.ayudaFiltros.textContent = error.message;
    elementos.ayudaFiltros.dataset.tipo = 'error';
    elementos.cantidadMovimientos.textContent = 'Revisá los filtros';
    elementos.totalMovimientos.textContent = '';
    elementos.listaMovimientos.append(crearMensajeVacio(error.message));
    elementos.contadorFiltros.textContent = `${contarFiltrosActivos(obtenerFiltrosActuales())} filtros`;
    return;
  }

  delete elementos.ayudaFiltros.dataset.tipo;
  const cantidad = gastosFiltrados.length;
  const total = gastosFiltrados.reduce((suma, gasto) => suma + Number(gasto.monto || 0), 0);
  const filtrosActivos = contarFiltrosActivos(obtenerFiltrosActuales());
  elementos.contadorFiltros.textContent = filtrosActivos === 1 ? '1 filtro' : `${filtrosActivos} filtros`;
  elementos.cantidadMovimientos.textContent = cantidad === 1 ? '1 movimiento' : `${cantidad} movimientos`;
  elementos.totalMovimientos.textContent = formatearMoneda(total);

  if (cantidad === 0) {
    elementos.listaMovimientos.append(crearMensajeVacio(
      gastosMes.length ? 'Ningún gasto coincide con los filtros seleccionados.' : 'Todavía no hay gastos registrados en este mes.',
    ));
    return;
  }

  const fragmento = document.createDocumentFragment();
  for (const gasto of gastosFiltrados) fragmento.append(crearTarjetaGasto(gasto));
  elementos.listaMovimientos.append(fragmento);
}

const DEFINICIONES_GRAFICOS = {
  categorias: { titulo: 'Gastos por categoría', descripcion: 'Distribución de los gastos del mes seleccionado según su categoría.' },
  personas: { titulo: 'Gastos por persona', descripcion: 'Comparación de los gastos realizados por Mauri y Ro.' },
  semanal: { titulo: 'Evolución semanal', descripcion: 'Gastos agrupados en semanas de lunes a domingo.' },
  mensual: { titulo: 'Evolución mensual', descripcion: 'Comparación de ingresos totales, gastos y saldo disponible de los últimos meses.' },
  'ingresos-gastos': { titulo: 'Ingresos vs. gastos', descripcion: 'Comparación de los ingresos y gastos del mes seleccionado.' },
};

function actualizarEstadoBotonesGraficos() {
  document.querySelectorAll('[data-tipo-grafico]').forEach((boton) => {
    const activo = boton.dataset.tipoGrafico === tipoGraficoActivo;
    boton.classList.toggle('boton-grafico--activo', activo);
    boton.setAttribute('aria-pressed', String(activo));
  });
}

function detenerObservadoresGraficoMensual() {
  versionSuscripcionGrafico += 1;
  canceladorObservadorGastosGrafico?.();
  canceladorObservadorGastosGrafico = null;
  canceladoresObservadoresHistorial.forEach((cancelar) => cancelar?.());
  canceladoresObservadoresHistorial = [];
  periodosGraficoActivo = [];
  gastosHistoricosGrafico = [];
  mesesHistoricosGrafico = {};
  ingresosHistoricosGrafico = {};
  gastoRangoGraficoCargado = false;
  periodosMesGraficoCargados = new Set();
  periodosIngresosGraficoCargados = new Set();
}

function prepararObservadoresGraficoMensual() {
  detenerObservadoresGraficoMensual();
  const versionActual = versionSuscripcionGrafico;
  const cantidadMeses = Number(elementos.selectorCantidadMeses.value || 6);
  periodosGraficoActivo = obtenerPeriodosRecientes(periodoSeleccionado, cantidadMeses);
  const primerPeriodo = periodosGraficoActivo[0];
  const [anioFinal, mesFinal] = periodoSeleccionado.split('-').map(Number);
  const siguienteMes = new Date(anioFinal, mesFinal, 1);
  const limiteSuperior = `${siguienteMes.getFullYear()}-${String(siguienteMes.getMonth() + 1).padStart(2, '0')}-01`;

  elementos.contenidoGrafico.replaceChildren(crearMensajeCargando('Consultando los últimos meses…'));
  canceladorObservadorGastosGrafico = observarGastosEnRango(`${primerPeriodo}-01`, limiteSuperior, (resultado) => {
    if (versionActual !== versionSuscripcionGrafico) return;
    gastosHistoricosGrafico = resultado;
    gastoRangoGraficoCargado = true;
    actualizarGraficoMensualSiListo();
  }, (error) => {
    if (versionActual !== versionSuscripcionGrafico) return;
    console.error('No se pudo consultar la evolución mensual:', error);
    elementos.contenidoGrafico.replaceChildren(crearMensajeVacio(obtenerMensajeDeError(error)));
  });

  for (const periodo of periodosGraficoActivo) {
    mesesHistoricosGrafico[periodo] = crearMesVacio(periodo);
    ingresosHistoricosGrafico[periodo] = [];
    const cancelarMes = observarMes(periodo, (mes) => {
      if (versionActual !== versionSuscripcionGrafico) return;
      mesesHistoricosGrafico[periodo] = mes;
      periodosMesGraficoCargados.add(periodo);
      actualizarGraficoMensualSiListo();
    }, (error) => manejarErrorGraficoHistorico(error, versionActual));
    const cancelarIngresos = observarIngresosAdicionales(periodo, (ingresos) => {
      if (versionActual !== versionSuscripcionGrafico) return;
      ingresosHistoricosGrafico[periodo] = ingresos;
      periodosIngresosGraficoCargados.add(periodo);
      actualizarGraficoMensualSiListo();
    }, (error) => manejarErrorGraficoHistorico(error, versionActual));
    canceladoresObservadoresHistorial.push(cancelarMes, cancelarIngresos);
  }
}

function manejarErrorGraficoHistorico(error, versionActual) {
  if (versionActual !== versionSuscripcionGrafico) return;
  console.error('No se pudieron consultar datos históricos del gráfico:', error);
  mostrarEstadoOperacion(obtenerMensajeDeError(error), 'error');
}

function seleccionarGrafico(tipo) {
  if (!graficosDesplegados || !DEFINICIONES_GRAFICOS[tipo]) return;
  detenerObservadoresGraficoMensual();
  tipoGraficoActivo = tipo;
  const definicion = DEFINICIONES_GRAFICOS[tipo];
  elementos.tituloGraficoActivo.textContent = definicion.titulo;
  elementos.descripcionGraficoActivo.textContent = definicion.descripcion;
  elementos.panelGrafico.hidden = false;
  elementos.ayudaGraficos.hidden = true;
  elementos.controlAlcanceGrafico.hidden = tipo !== 'mensual';
  actualizarEstadoBotonesGraficos();
  if (tipo === 'mensual') prepararObservadoresGraficoMensual();
  else renderizarGraficoActivo();
}

function crearBarraGrafico(etiqueta, valor, maximo, clase = '') {
  const fila = document.createElement('div');
  fila.className = `fila-grafico ${clase}`.trim();
  const cabecera = document.createElement('div');
  cabecera.className = 'fila-grafico__cabecera';
  const nombre = document.createElement('span');
  nombre.className = 'fila-grafico__etiqueta';
  nombre.textContent = etiqueta;
  const importe = document.createElement('strong');
  importe.className = 'fila-grafico__importe';
  importe.textContent = formatearMoneda(valor);
  cabecera.append(nombre, importe);
  const pista = document.createElement('div');
  pista.className = 'fila-grafico__pista';
  const barra = document.createElement('span');
  barra.className = 'fila-grafico__barra';
  const ancho = maximo > 0 ? Math.max(0, Math.min(100, Math.abs(Number(valor)) / maximo * 100)) : 0;
  barra.style.width = `${ancho}%`;
  pista.append(barra);
  fila.append(cabecera, pista);
  return fila;
}

function renderizarListaBarras(datos, clase = '') {
  elementos.contenidoGrafico.replaceChildren();
  if (!datos.length || datos.every((dato) => dato.monto === 0)) {
    elementos.contenidoGrafico.append(crearMensajeVacio('No hay datos suficientes para este gráfico en el mes seleccionado.'));
    return;
  }
  const maximo = Math.max(...datos.map((dato) => Math.abs(dato.monto)), 1);
  const lista = document.createElement('div');
  lista.className = `lista-grafico-barras ${clase}`.trim();
  datos.forEach((dato) => lista.append(crearBarraGrafico(dato.etiqueta, dato.monto, maximo)));
  elementos.contenidoGrafico.append(lista);
}

function renderizarGraficoActivo() {
  if (!tipoGraficoActivo || tipoGraficoActivo === 'mensual' || elementos.panelGrafico.hidden) return;
  if (tipoGraficoActivo === 'categorias') {
    const datos = agruparImportesPor(gastosMes, (gasto) => categorias.find((item) => item.id === gasto.categoriaId)?.nombre || 'Categoría no disponible')
      .map((dato) => ({ etiqueta: dato.clave, monto: dato.monto }));
    renderizarListaBarras(datos);
    return;
  }
  if (tipoGraficoActivo === 'personas') {
    const agrupados = agruparImportesPor(gastosMes, (gasto) => gasto.responsable || 'sin-asignar');
    const datos = ['mauri', 'ro'].map((persona) => ({
      etiqueta: persona === 'mauri' ? 'Mauri' : 'Ro',
      monto: agrupados.find((dato) => dato.clave === persona)?.monto || 0,
    }));
    renderizarListaBarras(datos, 'lista-grafico-barras--personas');
    return;
  }
  if (tipoGraficoActivo === 'semanal') {
    const datos = agruparGastosPorSemana(gastosMes, periodoSeleccionado)
      .map((grupo) => ({ etiqueta: grupo.etiqueta, monto: grupo.monto }));
    renderizarListaBarras(datos, 'lista-grafico-barras--semanal');
    return;
  }
  if (tipoGraficoActivo === 'ingresos-gastos') {
    const resumen = calcularResumenMensual({ mes: mesSeleccionado, gastos: gastosMes, ingresosAdicionales });
    const datos = [
      { etiqueta: 'Ingresos totales', monto: resumen.totalIngresos },
      { etiqueta: 'Gastos totales', monto: resumen.totalGastos },
    ];
    renderizarListaBarras(datos, 'lista-grafico-barras--comparacion');
    const saldo = document.createElement('p');
    saldo.className = `resumen-saldo-grafico${resumen.saldoDisponible < 0 ? ' resumen-saldo-grafico--negativo' : ''}`;
    saldo.textContent = `Saldo disponible del mes: ${formatearMoneda(resumen.saldoDisponible)}`;
    elementos.contenidoGrafico.append(saldo);
  }
}

function actualizarGraficoMensualSiListo() {
  const todosLosMesesListos = periodosGraficoActivo.every((periodo) =>
    periodosMesGraficoCargados.has(periodo) && periodosIngresosGraficoCargados.has(periodo),
  );
  if (!gastoRangoGraficoCargado || !todosLosMesesListos) {
    elementos.contenidoGrafico.replaceChildren(crearMensajeCargando('Consultando los últimos meses…'));
    return;
  }
  renderizarGraficoEvolucionMensual();
}

function renderizarGraficoEvolucionMensual() {
  if (tipoGraficoActivo !== 'mensual' || elementos.panelGrafico.hidden) return;
  if (!periodosGraficoActivo.length) return;
  const resumenes = crearResumenesEvolucionMensual(
    periodosGraficoActivo,
    gastosHistoricosGrafico,
    mesesHistoricosGrafico,
    ingresosHistoricosGrafico,
  );
  const maximo = Math.max(1, ...resumenes.flatMap((resumen) => [resumen.totalIngresos, resumen.totalGastos, Math.abs(resumen.saldoDisponible)]));
  const contenedor = document.createElement('div');
  contenedor.className = 'grafico-evolucion-mensual';

  for (const resumen of resumenes) {
    const bloque = document.createElement('article');
    bloque.className = 'bloque-mes-grafico';
    const titulo = document.createElement('h4');
    titulo.textContent = formatearPeriodo(resumen.periodo);
    bloque.append(titulo);
    const series = [
      { nombre: 'Ingresos', valor: resumen.totalIngresos, clase: 'serie-grafico--ingresos' },
      { nombre: 'Gastos', valor: resumen.totalGastos, clase: 'serie-grafico--gastos' },
      { nombre: 'Saldo', valor: resumen.saldoDisponible, clase: resumen.saldoDisponible < 0 ? 'serie-grafico--negativo' : 'serie-grafico--saldo' },
    ];
    for (const serie of series) {
      const fila = document.createElement('div');
      fila.className = `serie-grafico ${serie.clase}`;
      const etiqueta = document.createElement('span');
      etiqueta.className = 'serie-grafico__nombre';
      etiqueta.textContent = serie.nombre;
      const pista = document.createElement('div');
      pista.className = 'serie-grafico__pista';
      const barra = document.createElement('span');
      barra.className = 'serie-grafico__barra';
      barra.style.width = `${Math.min(100, Math.abs(serie.valor) / maximo * 100)}%`;
      pista.append(barra);
      const valor = document.createElement('strong');
      valor.className = 'serie-grafico__valor';
      valor.textContent = formatearMoneda(serie.valor);
      fila.append(etiqueta, pista, valor);
      bloque.append(fila);
    }
    contenedor.append(bloque);
  }
  elementos.contenidoGrafico.replaceChildren(contenedor);
}

function crearTarjetaGasto(gasto) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta-movimiento';

  const contenido = document.createElement('div');
  contenido.className = 'tarjeta-movimiento__contenido';

  const titulo = document.createElement('strong');
  titulo.className = 'tarjeta-movimiento__categoria';
  const categoria = categorias.find((item) => item.id === gasto.categoriaId);
  titulo.textContent = nombreVisibleCategoria(categoria);

  const detalle = document.createElement('p');
  detalle.className = 'tarjeta-movimiento__detalle';
  const responsable = gasto.responsable === 'mauri' ? 'Mauri' : 'Ro';
  detalle.textContent = `${formatearFecha(gasto.fecha)} · ${responsable}`;
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

async function resolverCategoriaPersonalizada(nombreIngresado) {
  const nombre = nombreIngresado.trim();
  const normalizado = normalizarNombre(nombre);
  if (!normalizado) throw new Error('Completá el nombre de la categoría nueva.');
  if (normalizado === 'otros' || normalizado === 'agregar otra categoria') {
    throw new Error('Ese nombre está reservado para la opción «Agregar otra categoría».');
  }

  const existente = categorias.find((item) => item.nombreNormalizado === normalizado || normalizarNombre(item.nombre) === normalizado);
  if (existente?.activo) {
    mostrarEstadoOperacion(`“${existente.nombre}” ya existe. Se utilizará esa categoría; su visibilidad no se modificó.`, 'aviso');
    return existente.id;
  }

  try {
    const resultado = await crearOReactivarCategoria(nombre);
    return resultado.id;
  } catch (error) {
    const actualizado = await obtenerCategorias({ incluirInactivas: true });
    const coincidencia = actualizado.find((item) => normalizarNombre(item.nombre) === normalizado && item.activo);
    if (coincidencia) return coincidencia.id;
    const coincidenciaInactiva = actualizado.find((item) => normalizarNombre(item.nombre) === normalizado && !item.activo);
    if (coincidenciaInactiva) {
      const reactivada = await crearOReactivarCategoria(nombre);
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
    responsable: elementos.responsableGasto.value,
  };
}

async function guardarGastoDesdeFormulario(evento) {
  evento.preventDefault();
  if (!elementos.formularioGasto.reportValidity()) return;

  const estaEditando = Boolean(gastoEnEdicion);
  const datos = obtenerDatosFormularioGasto();
  if (!datos.categoriaId) {
    mostrarEstadoOperacion('Seleccioná una categoría.', 'error');
    return;
  }
  if (estaEditando && !(await solicitarConfirmacion({
    titulo: 'Guardar cambios del gasto',
    mensaje: '¿Confirmás guardar las modificaciones de este gasto?',
    textoConfirmar: 'Guardar cambios',
  }))) return;

  const finalizarCarga = activarCargaBoton(elementos.botonGuardarGasto, estaEditando ? 'Guardando cambios…' : 'Guardando…');
  mostrarEstadoOperacion(estaEditando ? 'Actualizando el gasto…' : 'Guardando el gasto…', 'cargando');

  try {
    if (datos.categoriaId === 'otros') {
      datos.categoriaId = await resolverCategoriaPersonalizada(elementos.categoriaPersonalizada.value);
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
  if (!(await solicitarConfirmacion({
    titulo: 'Eliminar gasto',
    mensaje: `¿Querés eliminar el gasto “${categoria}” por ${formatearMoneda(gasto.monto)}? Esta acción no se puede deshacer.`,
    textoConfirmar: 'Eliminar gasto',
    destructiva: true,
  }))) return;

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
  actualizarSelectorCategorias('');
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

elementos.botonCancelarConfirmacion?.addEventListener('click', () => cerrarDialogoConfirmacion(false));
elementos.botonAceptarConfirmacion?.addEventListener('click', () => cerrarDialogoConfirmacion(true));
elementos.dialogoConfirmacion?.addEventListener('close', () => {
  if (resolverConfirmacionPendiente) {
    const resolver = resolverConfirmacionPendiente;
    resolverConfirmacionPendiente = null;
    resolver(false);
  }
});
elementos.dialogoConfirmacion?.addEventListener('click', (evento) => {
  if (evento.target === elementos.dialogoConfirmacion) cerrarDialogoConfirmacion(false);
});

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

elementos.botonAdministrarCatalogos.addEventListener('click', abrirAdministracionCatalogos);
elementos.botonCerrarAdministracion.addEventListener('click', () => elementos.dialogoAdministracionCatalogos.close());
elementos.dialogoAdministracionCatalogos.addEventListener('click', (evento) => {
  if (evento.target === elementos.dialogoAdministracionCatalogos) elementos.dialogoAdministracionCatalogos.close();
});
elementos.formularioNuevaCategoria.addEventListener('submit', guardarNuevaOpcionCatalogo);

elementos.botonVistaCarga.addEventListener('click', () => mostrarVista('carga'));
elementos.botonVistaConsulta.addEventListener('click', () => mostrarVista('consulta'));
elementos.botonSubvistaMovimientos.addEventListener('click', () => mostrarSubvistaConsulta('movimientos'));
elementos.botonSubvistaDashboard.addEventListener('click', () => mostrarSubvistaConsulta('dashboard'));
elementos.botonSubvistaGraficos.addEventListener('click', () => mostrarSubvistaConsulta('graficos'));
elementos.grupoBotonesGraficos.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-tipo-grafico]');
  if (boton) seleccionarGrafico(boton.dataset.tipoGrafico);
});
elementos.selectorCantidadMeses.addEventListener('change', () => {
  if (tipoGraficoActivo === 'mensual' && graficosDesplegados) prepararObservadoresGraficoMensual();
});
const controlesFiltro = [
  elementos.filtroCategoria, elementos.filtroPersona,
  elementos.filtroMontoMinimo, elementos.filtroMontoMaximo,
  elementos.filtroFechaDesde, elementos.filtroFechaHasta, elementos.filtroOrden,
];
controlesFiltro.forEach((control) => {
  control.addEventListener('input', renderizarGastos);
  control.addEventListener('change', renderizarGastos);
});
elementos.botonLimpiarFiltros.addEventListener('click', limpiarFiltros);
elementos.formularioGasto.addEventListener('submit', guardarGastoDesdeFormulario);
elementos.botonCancelarEdicion.addEventListener('click', cancelarEdicion);
elementos.categoriaGasto.addEventListener('change', () => {
  actualizarVisibilidadCamposPersonalizados();
  if (elementos.categoriaGasto.value !== 'otros') elementos.categoriaPersonalizada.value = '';
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

