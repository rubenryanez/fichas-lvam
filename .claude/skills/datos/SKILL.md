---
name: manejo-datos
description: Lee, interpreta y trabaja con FONDOS_LVAM.json. Usar cuando se trabaja con rentabilidades históricas, composición de cartera, patrimonio, tributario o cualquier dato de los fondos LVAM.
---

# Skill: Datos FFMM LVAM

## Campos críticos
- _id: slug URL único
- _paleta: define colores del fondo
- datos_mensuales.rentabilidades: ytd, 1m, 3m, 6m, 12m, 2y
- rentabilidades_historicas: objeto por año, meses en minúscula
- tributario: booleans apv, apvc, art57, art107, art108
- comparadores_simulador: array de 2 fondos para el simulador

## Manejo de nulls
- null → "—" en métricas, "Por informar" en antecedentes
- composicion vacía → placeholder "Composición por informar"
- clasificacion_crediticia vacía → ocultar sección rating bars
- principales_emisores vacía → placeholder
