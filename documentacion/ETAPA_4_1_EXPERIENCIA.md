# Etapa 4.1 — Notificaciones y confirmaciones

## Cambios
- Se elimina el aviso fijo de preparación de catálogos («Listo…»). La preparación se ejecuta sin dejar un banner permanente.
- Las notificaciones de éxito, error y aviso aparecen como ventanas emergentes discretas y temporales, fuera del flujo de contenido.
- Las operaciones en curso muestran una notificación con spinner; al terminar, se reemplaza por el resultado. Los botones siguen mostrando su propio indicador de carga.
- Las confirmaciones de edición y eliminación usan un diálogo propio de la aplicación, con fondo oscurecido y desenfoque.
- El diálogo permite cancelar con el botón, con Escape o tocando fuera de la ventana.
- Se conserva el tema arena, beige y tierra y la adaptación móvil.

## Pruebas manuales
1. Iniciar sesión y comprobar que no aparezca el mensaje fijo «Listo. 9 categorías y 3 medios de pago disponibles».
2. Guardar un gasto: debe aparecer una notificación emergente de éxito y desaparecer sola.
3. Eliminar un gasto: la pregunta debe abrirse en un diálogo de la aplicación, con el fondo desenfocado; no debe aparecer un `confirm()` del navegador.
4. Cancelar desde el botón, Escape y clic fuera: no debe ejecutarse la eliminación.
5. Confirmar la eliminación: debe aparecer una notificación emergente de éxito.
6. Repetir las pruebas con la edición de gastos, sueldos e ingresos adicionales.
7. Comprobar errores de Firestore: deben aparecer como notificación emergente de error.
8. Repetir en un celular o emulación móvil; los avisos deben ubicarse abajo y no tapar de forma permanente la pantalla.
