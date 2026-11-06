# Etapa 6.1 — Corrección al abrir la administración

## Síntoma corregido
Al abrir «Administrar», el navegador mostraba un `TypeError` al intentar asignar `textContent` a una referencia indefinida dentro de `renderizarListaAdministracionCatalogo()`.

## Corrección
- La función ahora obtiene los cuatro elementos de la interfaz (listas y contadores) directamente por su ID.
- Los contadores son informativos y se actualizan únicamente si están presentes.
- Las listas activa e inactiva sí son necesarias; si falta alguna, se genera un mensaje descriptivo que permite identificar un `index.html` desactualizado o mezclado con otra versión.
- Se agrega `tests/pruebas-interfaz-etapa-6-1.mjs` para comprobar la presencia de los IDs y que el acceso a los contadores sea seguro.

## Alcance
No se modifica el modelo de Firestore, los documentos ya guardados, las reglas de seguridad, la configuración de Firebase ni las dependencias.

## Comprobación local
Ejecutar desde la raíz del proyecto:

```bash
node tests/pruebas-interfaz-etapa-6-1.mjs
npm run dev
```

Después abrir «Administrar» y comprobar las pestañas «Categorías» y «Medios de pago», incluyendo las listas de opciones eliminadas.
