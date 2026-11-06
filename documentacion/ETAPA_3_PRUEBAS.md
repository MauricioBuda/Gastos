# Etapa 3 — carga y consulta inicial de gastos

## Incluido

- Inicio de sesión y preparación de catálogos existentes.
- Formulario para crear gastos con fecha local precargada.
- Responsable precargado por correo autorizado, con selección manual alternativa.
- Selección de categorías y medios de pago activos.
- Creación/reactivación de opciones personalizadas desde «Otros».
- Prevención de duplicados por normalización de nombres.
- Consulta en tiempo real de gastos del mes elegido.
- Orden cronológico descendente por fecha.
- Edición y eliminación con confirmaciones.

## Casos manuales recomendados

1. Registrar un gasto en el mes actual.
2. Registrar otro gasto a nombre de la persona que no inició sesión.
3. Seleccionar «Otros» en categoría y crear una categoría personalizada.
4. Repetir la carga con una variante de mayúsculas/tildes/espacios de esa categoría: se debe reutilizar la existente.
5. Cambiar la consulta a un mes anterior y confirmar que no muestra los movimientos del mes actual.
6. Editar un gasto y mover su fecha a otro mes: debe cambiar de listado automáticamente.
7. Cancelar la confirmación de edición: el documento no debe cambiar.
8. Eliminar un gasto y cancelar la confirmación: debe permanecer.
9. Confirmar la eliminación: debe desaparecer del listado.
10. Repetir las pruebas desde la cuenta de la otra persona y confirmar que los datos son compartidos.

## Límites deliberados de esta etapa

No incorpora todavía dashboard, gráficos, sueldos, ingresos adicionales, filtros combinables ni panel de administración visual de catálogos. Esas funciones se implementarán después de comprobar que el alta, la consulta, la edición y la eliminación de gastos funcionan correctamente en Firestore.
