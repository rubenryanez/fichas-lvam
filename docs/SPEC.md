# Especificación Técnica — Portal FFMM LVAM

## Componentes principales

### Layout y estructura
- FichaLayout — shell con las 7 pestañas, recibe objeto fondo como prop
- HeroFondo — cabecera con nombre del fondo, patrimonio, chips de categoría
- MetricStrip — banda de KPIs (3 métricas + separador visual + métricas adicionales)
- NavTabs — navegación de 7 pestañas con estado activo

### Contenido por pestaña
- TabFicha — composición, estadísticas, riesgo, antecedentes, emisores
- TabRentabilidad — gráfico base 100, tabla mensual, mejores/peores meses
- TabComparador — radar chart, tabla 3 columnas, contexto textual
- TabSimulador — sliders de monto/horizonte/tasa, gráfico proyección, comparación
- TabTributario — badges APV/APVC/Art57/Art107/Art108, cards por artículo
- TabGuia — selector de horizonte, recomendaciones de allocación, mensajes estratégicos
- TabSeries — tabla de series del fondo con remuneraciones y TAC

### Página índice /
- Grid responsivo de FondoCard (3 col desktop, 2 tablet, 1 móvil)
- FiltrosCategorias — chips horizontales con conteo de fondos por categoría
- Buscador — filtra por nombre_completo y nombre_corto del JSON
- Ordenamiento — por rentabilidad 12M, riesgo, o patrimonio

### FondoCard (tarjeta del índice)
- Nombre corto + categoría display
- Rentabilidad YTD y 12M destacadas
- Nivel de riesgo visual (barra 1-7)
- Color accent según _paleta del fondo
- Link a /fondo/[_id]

## Generación estática
- generateStaticParams() lee todos los _id del JSON
- Todas las fichas se pre-renderizan en build (SSG)
- Metadata dinámica: title="${nombre_corto} | LVAM", description desde objetivo del fondo

## Manejo de datos null
- Siempre verificar antes de renderizar: campo ?? "—"
- patrimonio_display null → "Por informar"
- portfolio_manager null → "Por informar"
- composicion vacía → mostrar mensaje "Composición detallada por informar"
- clasificacion_crediticia vacía → ocultar sección o mostrar placeholder

## Charts (Chart.js 4.x)
- Todos los componentes con Chart.js llevan 'use client'
- Destruir instancia anterior antes de crear nueva (useEffect cleanup)
- Colores de líneas: dataset principal usa var(--forest), comparadores usan colores del JSON
- Tooltips: fondo oscuro #1C2333, título en var(--mint)
