# Etapa 5.1 — Corrección de inicialización de Firestore

## Problema corregido

En `src/main.js` se declaraba `canceladorObservadorGastosGrafico`, pero el código intentaba usar `cancelarObservadorGastosGrafico`. Esa diferencia de nombre producía `ReferenceError` al entrar a la aplicación o navegar entre las vistas de consulta. Como el error ocurría dentro de `mostrarUsuario`, interrumpía `iniciarAplicacionPrivada` antes de inicializar los catálogos y las escuchas de Firestore.

## Solución

Se unificó la declaración, asignación y cancelación usando `canceladorObservadorGastosGrafico`. También se agregó una aserción de regresión en `tests/pruebas-interfaz-etapa-5.mjs` para evitar que vuelva a introducirse la referencia incorrecta.

## Instalación

1. Detener Vite con `Ctrl + C`.
2. Hacer una copia de seguridad del proyecto.
3. Extraer el ZIP directamente en la raíz de `gastos`, reemplazando los archivos.
4. Conservar `package.json`, `package-lock.json`, `node_modules` y `.env`.
5. No se requiere `npm install` ni publicar nuevas reglas de Firestore.
6. Ejecutar las pruebas indicadas abajo y luego `npm run dev`.

## Pruebas

Desde la raíz del proyecto:

```bash
node tests/pruebas-interfaz-etapa-5.mjs
node tests/pruebas-etapa-5.mjs
node tests/pruebas-logica.mjs
npm run dev
```

Esta corrección resuelve el error de JavaScript identificado en la consola. La verificación final de lectura en tiempo real debe hacerse en el navegador contra el proyecto Firebase real.
