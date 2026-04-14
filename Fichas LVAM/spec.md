\# SPEC.md



\## Arquitectura General



El sistema se compone de:



1\. Frontend interactivo (HTML/CSS/JS)

2\. Configuración dinámica (JSON o similar)

3\. Fuente de datos externa (scraping o carga manual)

4\. Modo administrador



\---



\## Módulos principales



\### 1. Tooltip Engine



\- Detecta elementos con atributo `data-tooltip`

\- Renderiza tooltip en hover

\- Contenido obtenido desde `memory.md`



\---



\### 2. Data Engine



Fuentes:

\- Scraping (CMF / DVA Tools)

\- Carga manual (Excel)

\- Datos base definidos



Debe soportar:

\- Normalización de datos

\- Conversión UF → CLP

\- Ajuste inflación



\---



\### 3. Simulation Engine



Inputs:

\- Monto inicial

\- Horizonte



Proceso:

\- Tomar valor cuota histórico

\- Simular crecimiento

\- Ajustar por inflación



Outputs:

\- Valor final

\- Rentabilidad nominal

\- Rentabilidad real



\---



\### 4. Visualization Engine



Tipos de gráficos:

\- Línea (principal)

\- Barras (comparación)

\- Evolutivo



Debe permitir:

\- Toggle entre nominal y real

\- Cambio de rango temporal



\---



\### 5. Reglas de recomendación



\#### Caso 1: Horizonte mixto

Ejemplo:

\- 50% a 6 meses

\- 50% a 18 meses



→ Sugerir combinación de fondos



\---



\#### Caso 2: Perfil de riesgo



\- Baja tolerancia:

&#x20; → sugerir fondos conservadores



\- Alta tolerancia:

&#x20; → sugerir:

&#x20;   - fondos agresivos

&#x20;   - fondos accionarios

&#x20;   - ETF



\---



\### 6. Beneficios tributarios



Evaluar:

\- Artículo 107

\- Artículo 108

\- Artículo 57 LIR



Output:

\- Mejor alternativa

\- Sugerencia de serie (APV / AP)



\---



\### 7. Clasificación de riesgo



\- Mostrar:

&#x20; - Nivel de riesgo

&#x20; - Explicación breve

\- Relacionar con:

&#x20; - Composición del fondo

&#x20; - Límites de inversión



\---



\## Escalabilidad



El sistema debe permitir:



\- Agregar nuevos fondos fácilmente

\- Reutilizar estructura

\- Separar lógica de datos



\---



\## Integraciones futuras



\- API CMF

\- Automatización scraping

\- Dashboard de administración

