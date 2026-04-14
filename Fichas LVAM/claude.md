# CLAUDE.md

## Contexto General
Este proyecto consiste en el desarrollo de fichas interactivas para fondos mutuos de LarrainVial, comenzando con el fondo "Ahorro UF".

El objetivo es construir una herramienta visual, educativa e interactiva que permita explicar conceptos financieros de forma simple, clara y profesional, manteniendo estrictamente la identidad visual institucional.

---

## Principios de Diseño

- Mantener 100% fidelidad a:
  - Colores institucionales
  - Tipografías
  - Logos
- Evitar diseño infantil o informal
- Estilo limpio, ejecutivo, tipo presentación corporativa

---

## Interactividad Clave

### Tooltips informativos
- Algunos conceptos deben incluir un punto visual (color institucional)
- Al hacer hover:
  - Mostrar explicación breve (1 línea)
  - Lenguaje simple, no técnico
- Deben ser reutilizables y definidos desde `memory.md`

Ejemplo:
- "Duration" → "Sensibilidad del precio del fondo ante cambios en tasas"

---

## Conceptos a incluir (obligatorio)

- Renta fija
- Sharpe Ratio
- Duration
- Rentabilidad nominal
- Rentabilidad real
- TAC
- Remuneración
- Plazo recomendado
- YTM CLF
- Volatilidad 1Yr
- Rating promedio
- Exposición a UF

---

## Estructura de la ficha

### Header
Debe incluir:
- Nombre del fondo
- Serie
- Objetivo del fondo
- Perfil de riesgo
- Plazo recomendado

### Composición
- % renta fija / variable
- Nacional / internacional
- % en UF
- Clasificación (ej: balanceado)
- Benchmark

---

## Gráficos y datos

- Mostrar:
  - Rentabilidad nominal
  - Rentabilidad real
- Permitir:
  - Cambio de vistas (línea, barras, etc.)
  - Evolución del valor cuota
- Preparado para scraping:
  - CMF
  - DVA Tools

---

## Simulación

- Input:
  - Monto en CLP
  - Horizonte (mínimo 6 meses)
- Output:
  - Evolución histórica
  - Rentabilidad real vs nominal

---

## Acceso administrador (modo maestro)

Debe permitir:
- Carga de archivos (Excel UF histórico)
- Modificación de datos del fondo
- Edición de parámetros

---

## Reglas clave

- No inventar datos financieros
- Todo debe poder escalar a múltiples fondos
- Código modular y reutilizable