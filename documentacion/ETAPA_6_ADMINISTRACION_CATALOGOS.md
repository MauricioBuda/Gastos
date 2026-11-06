# Etapa 6 — Administración de categorías y medios de pago

## Funcionalidades
- Acceso discreto desde el encabezado, sin crear una tercera sección principal.
- Administración separada de categorías y medios de pago.
- Alta de opciones personalizadas.
- Edición de categorías y medios editables con confirmación visual.
- Baja lógica con confirmación visual; el nombre y el identificador quedan conservados para movimientos anteriores.
- Recuperación manual de opciones inactivas.
- Los elementos protegidos se muestran como fijos y no ofrecen lápiz ni X.
- La edición se refleja en los movimientos históricos porque cada gasto conserva la referencia estable al documento del catálogo.
- Los servicios existentes impiden duplicados normalizando mayúsculas, espacios externos y tildes. Si se intenta crear una opción eliminada, se reactiva la misma referencia en lugar de crear otra.
- Las modificaciones se reflejan en los selectores, filtros, movimientos y gráficos mediante los observadores de Firestore.

## Elementos protegidos
- Categoría «Otros».
- Medios de pago «Efectivo», «Débito» y «Otros».
- Las demás categorías, incluida «Tarjeta de crédito», son editables y eliminables.
- Los medios personalizados son editables y eliminables.

## Instalación
Extraer el ZIP en la raíz del proyecto Vite y reemplazar los archivos entregados. Conservar `package.json`, `package-lock.json`, `node_modules` y `.env`. No se agregan dependencias, colecciones ni reglas de Firestore nuevas.

## Pruebas manuales recomendadas
1. Abrir «Administrar» desde el encabezado.
2. Confirmar que las opciones fijas no tengan lápiz ni X.
3. Agregar una categoría personalizada.
4. Intentar agregarla nuevamente con mayúsculas, espacios externos o sin tilde: no debe duplicarse.
5. Editar una categoría y verificar que un gasto anterior refleje el nuevo nombre.
6. Eliminar una categoría y comprobar que desaparece de nuevas cargas, pero permanece visible en movimientos antiguos.
7. Restaurar la categoría desde «Opciones eliminadas».
8. Repetir las pruebas para medios de pago.
9. Comprobar el mismo comportamiento con la cuenta de Ro.
10. Repetir en vista celular.
