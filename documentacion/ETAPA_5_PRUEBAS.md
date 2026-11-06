# Etapa 5 — consulta, filtros, dashboard y gráficos

## Vistas de consulta

La consulta mensual contiene tres vistas independientes:

1. **Movimientos:** lista cronológica y filtros combinables.
2. **Dashboard:** resumen mensual compartido ya implementado en la etapa anterior.
3. **Gráficos:** botones independientes para seleccionar una visualización.

El selector de mes está fuera de las tres vistas y se comparte. Al abrir la aplicación se selecciona el mes actual.

## Filtros de movimientos

Se pueden combinar:

- Categoría.
- Persona que realizó el gasto.
- Medio de pago.
- Importe mínimo y máximo.
- Fecha desde y hasta.

El orden puede ser fecha descendente, fecha ascendente, importe descendente o importe ascendente. La lista abre con fecha descendente. El total y la cantidad que se muestran en Movimientos corresponden al resultado filtrado.

Los filtros no se aplican al Dashboard ni a los gráficos.

## Gráficos incluidos

- Gastos por categoría.
- Gastos por persona.
- Gastos por medio de pago.
- Evolución semanal, con semanas de lunes a domingo.
- Evolución mensual, últimos 3, 6 o 12 meses.
- Ingresos vs. gastos del mes seleccionado.

En evolución mensual, cada mes muestra:

- **Ingresos:** sueldo de Mauri + sueldo de Ro + ingresos adicionales.
- **Gastos:** suma de los gastos del mes.
- **Saldo:** ingresos menos gastos.

Los saldos negativos se señalan en rojo. No existe arrastre automático de saldo entre meses.

Los gráficos de categorías, persona, medios de pago, semanas e ingresos vs. gastos toman todos los movimientos del mes seleccionado. No leen los filtros de la lista.

## Funcionamiento de la sección Gráficos

- Al entrar se muestran los seis botones.
- Al seleccionar uno aparece solamente esa visualización.
- Al tocar nuevamente la pestaña principal Gráficos, se ocultan botones y visualización.
- Al volver a desplegar, no se conserva una selección anterior.
- Las suscripciones históricas del gráfico mensual se cancelan al cerrar la sección o salir de Gráficos.

## Favicon

`index.html` contiene la referencia `/favicon.png`. Guardá tu imagen en `public/favicon.png`. La aplicación no incluye un favicon inventado.

## Pruebas automatizadas

Desde la raíz del proyecto:

```bash
node tests/pruebas-logica.mjs
node tests/pruebas-etapa-4.mjs
node tests/pruebas-interfaz-etapa-4-1.mjs
node tests/pruebas-etapa-5.mjs
node tests/pruebas-interfaz-etapa-5.mjs
```

Estas pruebas no escriben ni modifican documentos de Firestore. Para validar la integración real, iniciá Vite e interactuá con el proyecto Firebase.
