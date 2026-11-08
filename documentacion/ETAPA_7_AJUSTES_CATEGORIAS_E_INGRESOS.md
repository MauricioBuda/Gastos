# Etapa 7 — Categorías, ingresos y retiro de medios de pago

## Cambios funcionales

- La tarjeta de resumen «Ingresos adicionales» solamente se muestra cuando el mes contiene uno o más ingresos adicionales.
- El contador y la lista vacía no muestran un cero ni un mensaje vacío que ocupe espacio. El panel para agregar ingresos sigue disponible para que se pueda crear el primer registro.
- La opción especial del selector de categorías se presenta como «Agregar otra categoría» y se mantiene siempre al final.
- Las categorías creadas desde ese campo se guardan inicialmente ocultas (`visibleEnFormulario = false`). No se agregan automáticamente al selector.
- En Administración, el botón del ojo controla individualmente si cada categoría aparece en el formulario. El ojo abierto indica visible; el ojo tachado indica oculta. La opción «Agregar otra categoría» permanece siempre visible y protegida.
- Se retiraron los medios de pago de formularios, listados, filtros, ordenamientos, administración, gráficos y cálculos.
- Los documentos históricos que todavía contienen `medioPagoId` no se modifican ni eliminan. El cliente no lee ese campo. Las nuevas altas no lo guardan; las ediciones de gastos antiguos actualizan los campos funcionales y conservan intacto el campo histórico existente.
- Las colecciones históricas `mediosPago` e `indicesMediosPago` quedan en Firestore sin limpieza. La aplicación ya no las consulta ni las modifica y se quitaron las reglas de acceso del cliente para esas colecciones.
- Las notificaciones de éxito, error y aviso se muestran centradas vertical y horizontalmente durante tres segundos, con el fondo desenfocado. Los indicadores de carga permanecen hasta que finaliza la operación.

## Instalación

1. Detener Vite con `Ctrl + C`.
2. Hacer una copia de seguridad del proyecto local.
3. Extraer el contenido del ZIP en la raíz del proyecto, permitiendo reemplazar los archivos.
4. Conservar `package.json`, `package-lock.json`, `node_modules`, `.env` y el `public/favicon.png` propio.
5. Publicar el contenido del nuevo `firestore.rules` en Firebase → Firestore Database → Reglas.
6. Ejecutar las pruebas indicadas en `tests/INSTRUCCIONES.txt` y luego `npm run dev`.

No se requieren dependencias nuevas. Las reglas actualizadas son necesarias porque la aplicación deja de usar los catálogos de medios de pago; no borran ningún documento histórico de Firestore.

## Pruebas manuales recomendadas

1. Abrir un mes sin ingresos adicionales: no debe aparecer una tarjeta «Ingresos adicionales: $0» ni un contador cero. Debe seguir disponible el panel «Agregar o administrar ingresos adicionales».
2. Crear un ingreso adicional: debe aparecer la tarjeta con su total y el detalle del registro.
3. Eliminar el último ingreso adicional: la tarjeta del resumen debe desaparecer nuevamente.
4. Abrir el formulario de gastos: el último elemento del selector debe decir «Agregar otra categoría».
5. Crear una categoría nueva desde ese selector: el gasto se debe guardar, pero la categoría nueva no debe aparecer en nuevas cargas hasta activar su ojo desde Administración.
6. Abrir Administración: cada categoría normal debe mostrar lápiz, X y ojo. El ojo cambia entre visible y oculta. La opción especial debe permanecer fija y al final.
7. Activar una categoría oculta y verificar que aparece en el formulario; volver a ocultarla y comprobar que deja de aparecer.
8. Revisar gráficos, filtros y tarjetas de gastos: no debe mostrarse medio de pago en ningún sitio.
9. Editar un gasto histórico: comprobar que se puede guardar sin perder el campo `medioPagoId` antiguo en Firestore.
10. Cargar un gasto nuevo y verificar en Firestore que no se agregue `medioPagoId` al documento nuevo.
11. Completar una operación: la notificación debe aparecer en el centro con el fondo desenfocado y retirarse a los tres segundos. Repetirlo con un error controlado y con una operación demorada.
12. Repetir en vista mobile y con ambas cuentas.

## Alcance de validación

Las pruebas automatizadas incluidas verifican lógica, estructura, referencias y compatibilidad con documentos históricos. La compilación de Vite y las operaciones remotas de Firestore deben confirmarse en el entorno local del usuario.
