---
name: portal-componentes
description: Construye y mantiene la página índice del portal LVAM, los componentes compartidos entre fichas, filtros, búsqueda y navegación global. Usar para trabajo en la home o en componentes reutilizables.
---

# Skill: Componentes del Portal

## Componentes a mantener
- src/app/page.tsx → índice con grid de FondoCard
- src/components/FondoCard.tsx → tarjeta por fondo
- src/components/Header.tsx → nav global LVAM
- src/components/FiltrosCategorias.tsx → chips por categoría

## Datos del índice
- Leer todos los fondos del JSON para construir el grid
- Filtrar por _categoria
- Chips de filtro: Todos | RF UF | RF CLP | Renta Variable | Balanceados | Money Market | FI Alternativos
- Cada FondoCard usa el color --forest de la _paleta del fondo

## Reglas
- CSS variables siempre, nunca hex directo en JSX
- El grid debe ser responsivo: 3 col → 2 col → 1 col
