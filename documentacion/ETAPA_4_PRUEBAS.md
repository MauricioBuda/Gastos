# Etapa 4 — Pruebas de sueldos, ingresos y balance mensual

## 1. Pantalla inicial y autenticación

1. Iniciá sesión con Mauri o Ro.
2. Recargá con F5 varias veces.
3. Durante la comprobación debe aparecer la pantalla de espera con el indicador animado.
4. No debe aparecer fugazmente el formulario de inicio de sesión cuando la sesión ya está activa.
5. Cerrá sesión y comprobá que la pantalla de acceso aparece después de terminar la comprobación.

## 2. Sueldos del mes

1. Seleccioná el mes actual en «Mes de gestión».
2. Abrí «Administrar sueldos del mes» si no está abierto.
3. Ingresá el sueldo de Mauri y guardalo.
4. Comprobá que el campo de Mauri desaparezca y quede disponible el de Ro.
5. Ingresá el sueldo de Ro.
6. Comprobá que el panel de carga se contraiga al quedar los dos sueldos registrados.
7. Pasá el cursor sobre «Saldo inicial» en computadora para ver ambos importes individuales.
8. En celular, tocá «Saldo inicial» para desplegar el detalle y volvé a tocarlo para ocultarlo.
9. Abrí el panel de sueldos y probá corregir uno. Debe solicitar confirmación antes de guardar.

Los sueldos pendientes se consideran cero para el cálculo provisional, pero se identifican como pendientes. No impiden cargar gastos.

## 3. Ingresos adicionales

1. Abrí «Ingresos adicionales».
2. Cargá un monto entero y una procedencia.
3. Comprobá que aparezca en la lista y que aumente el total de ingresos adicionales.
4. Editá un ingreso. Debe pedir confirmación antes de guardar.
5. Eliminá un ingreso. Debe pedir confirmación antes de eliminar.
6. Comprobá que el saldo se actualice automáticamente.

## 4. Observación del saldo

1. Presioná «Agregar observación» aunque el saldo sea positivo, cero o negativo.
2. Escribí una observación y guardala.
3. Comprobá que se muestre debajo del título.
4. Editá una observación existente: debe pedir confirmación.
5. Navegá a otro mes y comprobá que cada mes conserva su propia observación.

## 5. Sincronización y períodos

1. Cambiá el mes de gestión a uno anterior.
2. Comprobá que muestre los sueldos, ingresos adicionales, gastos y observación de ese período.
3. Ingresá un sueldo o ingreso adicional en ese mes anterior.
4. Abrí la aplicación con la cuenta del otro usuario y comprobá que ambos vean los mismos datos.
5. Recargá la aplicación y comprobá que los datos sigan guardados.

## 6. Indicadores de carga

Los botones de guardar, editar, eliminar, iniciar sesión y cerrar sesión deben mostrar un indicador animado mientras esperan una operación. La pantalla inicial debe mostrar el indicador hasta que Firebase resuelva el estado de autenticación.

## Fórmula del balance

`Saldo inicial = sueldo de Mauri + sueldo de Ro`

`Total de ingresos = saldo inicial + ingresos adicionales`

`Saldo restante = total de ingresos - gastos del mes`

Los importes calculados no se guardan como fuente de verdad: se recalculan desde los documentos actuales.
