# Estructura de Datos — FONDOS_LVAM.json

## Nivel raíz
{
  "_meta": { ... },
  "fondos": [ ... ]
}

## _meta
- version, generado, periodo_datos, administradora
- total_fondos: 42
- paletas: objeto con las 6 paletas y sus colores
- categorias: mapa de código a display (FM_RF_UF, FM_RF_CLP, etc.)

## Estructura de cada fondo
{
  "_id": string,              // slug URL único, ej: "ahorro-a-plazo"
  "_paleta": string,          // "verde"|"azul"|"indigo"|"teal"|"gris"|"ambar"
  "_categoria": string,       // código: "FM_RF_UF", "FM_RF_CLP", etc.
  "_categoria_display": string, // texto para hero-eye del fondo
  "_estado": string,

  "identificacion": {
    "nombre_completo": string,
    "nombre_corto": string,
    "run": string,
    "nemo_dcv": string | null,
    "bloomberg": string | null,
    "tipo_vehiculo": string,
    "moneda": string,
    "benchmark": string | null,
    "horizonte_minimo": string,
    "rescate": string,
    "monto_minimo": string,
    "portfolio_manager": string | null,
    "auditores": string | null,
    "remuneracion": string | null,
    "serie_referencia": string,
    "vigente": boolean
  },

  "riesgo": {
    "nivel": number,          // 1 a 7
    "escala_max": 7,
    "descripcion": string     // "Muy Bajo", "Bajo", "Medio", etc.
  },

  "datos_mensuales": {
    "periodo": string,
    "patrimonio_display": string | null,
    "patrimonio_mm_clp": number | null,
    "rentabilidades": {
      "ytd": number,
      "1m": number,
      "3m": number,
      "6m": number,
      "12m": number,
      "2y": number
    },
    "estadisticas_cartera": {
      "ytm_clf_pct": number | null,
      "duracion_anios": number | null,
      "volatilidad_pct": number | null,
      "rating_promedio": string | null,
      "expo_uf_pct": number | null,
      "tac_pct": number | null,
      "tac_industria_pct": number | null
    },
    "composicion": [ { "nombre": string, "pct": number } ],
    "clasificacion_crediticia": [ { "rating": string, "pct": number } ],
    "principales_emisores": [ { "nombre": string, "pct": number } ],
    "base_100_actual": number,
    "fecha_dato": string
  },

  "rentabilidades_historicas": {
    "2022": { "ene": number|null, ..., "anual": number|null },
    "2023": { ... },
    "2024": { ... },
    "2025": { ... },
    "2026": { ... }
  },

  "tributario": {
    "apv": boolean,
    "apvc": boolean,
    "art57": boolean,
    "art107": boolean,
    "art108": boolean
  },

  "series": [
    {
      "serie": string,
      "remuneracion_pct": number | null,
      "tac_pct": number | null,
      "apv": boolean,
      "monto_minimo": string
    }
  ],

  "comparadores_simulador": [
    {
      "nombre": string,
      "rent_anual_ref_pct": number,
      "color": string
    }
  ],

  "objetivo": string
}
