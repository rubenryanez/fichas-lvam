# /generar-todas

Genera las fichas de todos los fondos del JSON.

## Flujo
1. Leer todos los _id de src/data/FONDOS_LVAM.json
2. Para cada fondo aplicar el skill generar-ficha
3. Procesar en grupos de 5 fondos
4. Al finalizar reportar: total generadas, errores, lista de campos null por fondo
