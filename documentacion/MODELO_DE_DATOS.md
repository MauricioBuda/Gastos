# Modelo de datos de Gastos

## Identidad y acceso

Los dos usuarios autorizados comparten la misma base. El acceso se limita con Firebase Authentication y reglas de Cloud Firestore para las cuentas verificadas:

- `mauricio.ariel.buda@gmail.com`
- `wakeuprodiaz@gmail.com`

No se guarda una cuenta de usuario por gasto. `responsable` identifica a quien realizó el gasto (`mauri` o `ro`) y no a quien cargó el formulario.

## Colecciones

### `gastos/{gastoId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `monto` | entero | Pesos argentinos, sin centavos; debe ser mayor que cero. |
| `fecha` | texto `AAAA-MM-DD` | Fecha editable. Determina el mes al que pertenece el gasto. |
| `categoriaId` | texto | ID estable del documento de `categorias`. |
| `medioPagoId` | texto | ID estable del documento de `mediosPago`. |
| `responsable` | texto | `mauri` o `ro`. |
| `creadoEn` | timestamp | Momento técnico de creación. No se muestra en pantalla. |
| `actualizadoEn` | timestamp | Última modificación. |

La colección es global, no hay una colección de gastos por mes. Para consultar un mes se filtra `fecha` entre el primer día del mes y el primer día del mes siguiente. Si se cambia la fecha de un gasto, cambia automáticamente el mes en el que aparece.

### `meses/{AAAA-MM}`

| Campo | Tipo | Descripción |
|---|---|---|
| `periodo` | texto | El mismo valor que el ID del documento, por ejemplo `2026-11`. |
| `sueldoMauri` | entero opcional | No existe hasta que Mauri lo ingresa. Puede corregirse después. |
| `sueldoRo` | entero opcional | No existe hasta que Ro lo ingresa. Puede corregirse después. |
| `observacionSaldo` | texto | Un único campo editable por mes. |
| `creadoEn` | timestamp | Creación del documento mensual. |
| `actualizadoEn` | timestamp | Última modificación. |

Que un sueldo no exista es distinto de que sea cero: la interfaz puede saber qué sueldo todavía está pendiente.

#### `meses/{AAAA-MM}/ingresosAdicionales/{ingresoId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `monto` | entero | Pesos argentinos, sin centavos; mayor que cero. |
| `procedencia` | texto | Origen del ingreso adicional. |
| `creadoEn` | timestamp | Creación del registro. |
| `actualizadoEn` | timestamp | Última modificación. |

Cada ingreso adicional es un documento independiente, por eso se pueden cargar varios en el mismo mes.

### `categorias/{categoriaId}`

Campos: `nombre`, `nombreNormalizado`, `activo`, `orden`, `protegida`, `inicial`, `creadoEn`, `actualizadoEn`.

Las categorías iniciales son Alquiler, Expensas, Verdulería, Supermercado, Postres, Cenas, Nafta, Tarjeta de crédito y Otros. Solamente `Otros` está protegida. Las demás se pueden renombrar o desactivar.

### `mediosPago/{medioPagoId}`

Usa los mismos campos que categorías. Efectivo, Débito y Otros están protegidos. Los medios personalizados se pueden renombrar o desactivar.

## Índices internos de nombres

### `indicesCategorias/{hashNombre}`
### `indicesMediosPago/{hashNombre}`

Guardan `referenciaId`, `nombreNormalizado` y `actualizadoEn`. Permiten reservar el nombre normalizado y evitar duplicados incluso si Mauri y Ro intentan crear la misma opción al mismo tiempo.

La normalización elimina espacios al principio y al final, ignora mayúsculas/minúsculas y elimina diacríticos. Por eso `Verduleria`, `verdulería` y ` VERDULERIA ` se consideran el mismo nombre.

Al desactivar una opción, se conserva tanto el documento del catálogo como su índice. Si se intenta crear otra vez con ese nombre, se reactiva el registro anterior. Al renombrar, se actualiza el documento del catálogo y se mueve el índice de unicidad; como los gastos guardan el ID del catálogo, los históricos muestran el nombre actualizado.

## Cálculos del resumen mensual

- `totalSueldos = sueldoMauri + sueldoRo` (los sueldos pendientes se cuentan como cero para el cálculo, pero la interfaz los distingue como pendientes).
- `totalIngresosAdicionales = suma de los ingresos adicionales del mes`.
- `totalIngresos = totalSueldos + totalIngresosAdicionales`.
- `totalGastos = suma de los gastos cuya fecha corresponde al mes`.
- `saldoDisponible = totalIngresos - totalGastos`.

Los importes calculados no se guardan como una fuente de verdad: se derivan de los documentos actuales para que una edición o eliminación no deje balances desactualizados. El saldo sobrante no se arrastra al mes siguiente.

## Seguridad

Las reglas incluidas en `firestore.rules` limitan lectura y escritura a las dos cuentas autorizadas con correo verificado, validan la forma de cada documento y evitan la eliminación física de catálogos. Los gastos e ingresos sí pueden eliminarse. Las opciones de catálogo se eliminan mediante `activo = false`.

## Comportamiento de la interfaz implementado en la etapa 4

- El selector «Mes de gestión» gobierna la consulta de gastos, los sueldos, los ingresos adicionales y la observación del período.
- El formulario de un gasto nuevo sigue precargando siempre la fecha actual del dispositivo; el mes seleccionado no sustituye esa fecha.
- Los sueldos pendientes se contabilizan provisionalmente como cero, pero se señalan como pendientes y no bloquean la carga de gastos.
- El total conjunto de sueldos se muestra en el balance. El detalle individual se revela mediante interacción sobre el total.
- El panel de carga de sueldos se abre si falta alguno; al registrarse ambos, se contrae. Los sueldos ya cargados se corrigen mediante una acción de edición.
- Cada ingreso adicional se puede crear, editar y eliminar por separado. La procedencia no está vinculada a una persona.
- El campo de observación del saldo está disponible incluso con saldo cero o negativo.
- La interfaz muestra indicadores de carga durante operaciones asíncronas y una pantalla de espera inicial hasta que Firebase resuelve la sesión, evitando mostrar brevemente el formulario de acceso al recargar.
