# Portal Institucional FFMM — LarrainVial Asset Management

## Qué es este proyecto
Portal web con fichas institucionales de los 42 fondos LVAM.
Cada ficha tiene 7 pestañas fijas: Ficha, Rentabilidad, Comparador, Simulador, Tributario, Guía, Series.

## Stack tecnológico
- Next.js 15 App Router + TypeScript
- Tailwind CSS con design system propio (ver docs/DESIGN.md)
- Chart.js 4.x para todos los gráficos
- Datos desde src/data/FONDOS_LVAM.json (42 fondos)

## Reglas de diseño — SIEMPRE respetar
- Paleta por categoría: verde=RF UF, azul=RF CLP, indigo=RV, teal=Balanceados, gris=Money Market, ambar=FI Alternativos
- Los tokens de cada paleta están en docs/DESIGN.md
- Tipografía: Nunito Sans (body), Nunito (números), Playfair Display (títulos hero)
- Nunca hardcodear colores hex en componentes, usar CSS variables
- La estructura de 7 pestañas es fija, nunca eliminar ninguna

## Fuente de datos
- src/data/FONDOS_LVAM.json es la única fuente de verdad
- Campos null = datos no disponibles, mostrar "—" o "Por informar" en la UI
- _paleta define el esquema de color del fondo
- _categoria_display define el subtítulo del hero
- _id es el slug URL (ej: "ahorro-a-plazo" → /fondo/ahorro-a-plazo)

## Arquitectura de rutas
- / → índice de todos los fondos con filtros por categoría y buscador
- /fondo/[id] → ficha individual generada estáticamente
- /comparador → comparador multi-fondo standalone

## Comandos disponibles
- /generar-ficha [nombre] → genera página completa de un fondo
- /generar-todas → genera todas las fichas en paralelo
- /deploy → build + preview

## Reglas de código
- Componentes con gráficos Chart.js siempre llevan 'use client'
- generateStaticParams() en todas las rutas dinámicas
- Campos null del JSON nunca causan error, siempre tienen fallback
- No usar CSS modules, solo Tailwind + CSS variables globales
