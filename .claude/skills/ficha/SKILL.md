---
name: generar-ficha
description: Genera o actualiza la página React de una ficha institucional de fondo LVAM. Usar cuando se pide crear, modificar o actualizar la ficha de un fondo. Incluye los 7 tabs, gráficos Chart.js y datos del JSON.
---

# Skill: Generar Ficha Institucional

## Cuándo aplicar
- "genera la ficha de [fondo]"
- "actualiza los datos de [fondo]"
- "cambia la paleta de [fondo]"
- "agrega el tab de [sección] al fondo [nombre]"

## Pasos en orden
1. Leer src/data/FONDOS_LVAM.json, encontrar el fondo por _id o nombre_corto
2. Leer docs/DESIGN.md, extraer los tokens de la paleta del _paleta del fondo
3. Leer docs/SPEC.md para recordar estructura de componentes
4. Generar o actualizar src/app/fondo/[_id]/page.tsx
5. Verificar que campos null del JSON muestren "—" o "Por informar"
6. Componentes con Chart.js llevan 'use client' obligatorio

## Reglas inamovibles
- 7 pestañas siempre: Ficha, Rentabilidad, Comparador, Simulador, Tributario, Guía, Series
- El _id del JSON es la ruta URL
- Nunca inventar datos que no estén en el JSON
- comparadores_simulador del fondo define los 2 comparadores del simulador
