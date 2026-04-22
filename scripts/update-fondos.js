// Actualiza FONDOS_LVAM.json con datos reales de 4 fondos + IPC mensual
const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'data', 'FONDOS_LVAM.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// ---------- IPC mensual en _meta ----------
const metaEntries = Object.entries(data._meta);
const newMeta = {};
for (const [k, v] of metaEntries) {
  newMeta[k] = v;
  if (k === 'total_fondos') {
    newMeta.ipc_mensual = {
      fuente: 'INE Chile',
      datos: {
        '2025': {
          ene: 1.1, feb: 0.4, mar: 0.5, abr: 0.2,
          may: 0.2, jun: -0.4, jul: 0.9, ago: 0.0,
          sep: 0.4, oct: 0.0, nov: 0.3, dic: -0.2,
          anual: 3.5,
        },
        '2026': {
          ene: 0.4, feb: 0.0, mar: 1.0,
          abr: null, may: null, jun: null,
          jul: null, ago: null, sep: null,
          oct: null, nov: null, dic: null,
          acumulado: 1.4, ultimos_12m: 2.8,
        },
      },
    };
  }
}
data._meta = newMeta;

// ---------- Updates por fondo ----------
const updates = {
  'ahorro-a-plazo': {
    _paleta: 'azul',
    identificacion: {
      nombre_completo: 'Fondo Mutuo LarrainVial Ahorro a Plazo',
      nombre_corto: 'Ahorro a Plazo',
      run: '8755',
      nemo_dcv: 'CFMLVAPLAZ',
      bloomberg: 'LARVIAP CI Equity',
      tipo_vehiculo: 'Fondo Mutuo',
      moneda: 'CLP',
      benchmark: 'TAB 30 días (duración máx 365 días)',
      horizonte_minimo: 'Desde 6 meses',
      rescate: 'T+1',
      monto_minimo: 'Sin mínimo',
      portfolio_manager: 'Javier Marshall',
      auditores: 'KPMG',
      remuneracion: 'Hasta 1,60% anual IVA incluido',
      serie_referencia: 'A',
      vigente: true,
    },
    riesgo: { nivel: 2, escala_max: 7, descripcion: 'Bajo' },
    datos_mensuales: {
      patrimonio_display: '$137.838 millones CLP',
      patrimonio_mm_clp: 137838,
      rentabilidades: { ytd: 1.26, '1m': 0.69, '3m': 1.26, '6m': 1.83, '12m': 3.90, '2y': 10.06, '3y': 19.13, '5y': 31.35 },
      estadisticas_cartera: {
        ytm_clf_pct: 4.9, duracion_anios: 0.7, volatilidad_pct: 0.3,
        rating_promedio: 'AA+', expo_uf_pct: 38.7, tac_pct: 1.71, tac_industria_pct: 1.35,
      },
      composicion: [
        { nombre: 'Depósitos', pct: 49.4 },
        { nombre: 'Bonos Bancarios', pct: 29.7 },
        { nombre: 'Bonos Corporativos', pct: 20.9 },
      ],
      clasificacion_crediticia: [
        { rating: 'N-1', pct: 30 },
        { rating: 'AAA', pct: 25 },
        { rating: 'AA', pct: 25 },
        { rating: 'Gobierno', pct: 20 },
      ],
      principales_emisores: [
        { nombre: 'Banco Central de Chile', pct: 19.7 },
        { nombre: 'Scotiabank Chile', pct: 14.3 },
        { nombre: 'Banco Itaú CorpBanca', pct: 12.2 },
        { nombre: 'Banco Santander Chile', pct: 8.5 },
        { nombre: 'Banco Security', pct: 6.6 },
        { nombre: 'BCI', pct: 5.6 },
        { nombre: 'Banco de Chile', pct: 3.7 },
        { nombre: 'Banco Consorcio', pct: 3.5 },
        { nombre: 'Caja Compensación Los Andes', pct: 2.9 },
        { nombre: 'Costanera Norte SA', pct: 2.4 },
      ],
    },
    rentabilidades_historicas: {
      '2022': { ene: 0.25, feb: 1.00, mar: 0.67, abr: 1.60, may: 0.83, jun: 0.83, jul: 1.10, ago: 0.16, sep: 0.23, oct: 0.86, nov: 0.95, dic: 0.73, anual: 9.62 },
      '2023': { ene: 0.87, feb: 0.58, mar: 0.63, abr: 0.48, may: 0.52, jun: 1.07, jul: 1.05, ago: 0.40, sep: 0.22, oct: 0.51, nov: 0.69, dic: 0.99, anual: 8.31 },
      '2024': { ene: 0.68, feb: 0.63, mar: 0.71, abr: 0.56, may: 0.57, jun: 0.52, jul: 0.61, ago: 0.58, sep: 0.58, oct: 0.08, nov: 0.61, dic: 0.36, anual: 6.69 },
      '2025': { ene: 0.44, feb: 0.42, mar: 0.44, abr: 0.49, may: 0.22, jun: 0.25, jul: 0.33, ago: 0.39, sep: 0.34, oct: 0.25, nov: 0.18, dic: 0.13, anual: 3.94 },
      '2026': { ene: 0.24, feb: 0.33, mar: 0.69, abr: null, may: null, jun: null, jul: null, ago: null, sep: null, oct: null, nov: null, dic: null, anual: 1.26 },
    },
    tributario: { apv: true, apvc: true, art57: true, art107: false, art108: true },
    objetivo:
      'Invertir en instrumentos de deuda local de corto y mediano plazo con duración máxima de cartera de 365 días.',
  },
  'ahorro-capital': {
    _paleta: 'verde',
    identificacion: {
      nombre_completo: 'Fondo Mutuo LarrainVial Ahorro Capital',
      nombre_corto: 'Ahorro Capital',
      run: '8263',
      nemo_dcv: 'CFMLVAHCAP',
      bloomberg: 'LARVACA CI Equity',
      tipo_vehiculo: 'Fondo Mutuo',
      moneda: 'CLP',
      benchmark: 'BCU 5 Años (duración 366–1460 días)',
      horizonte_minimo: 'Desde 1 año',
      rescate: 'T+1',
      monto_minimo: 'Sin mínimo',
      portfolio_manager: 'Javier Marshall',
      auditores: 'KPMG',
      remuneracion: 'Hasta 1,85% anual IVA incluido',
      serie_referencia: 'A',
      vigente: true,
    },
    riesgo: { nivel: 3, escala_max: 7, descripcion: 'Medio Bajo' },
    datos_mensuales: {
      patrimonio_display: '$423.148 millones CLP',
      patrimonio_mm_clp: 423148,
      rentabilidades: { ytd: 2.05, '1m': 1.05, '3m': 2.05, '6m': 2.72, '12m': 5.60, '2y': 14.58, '3y': 20.70, '5y': 30.16 },
      estadisticas_cartera: {
        ytm_clf_pct: 2.1, duracion_anios: 2.9, volatilidad_pct: 0.9,
        rating_promedio: 'AA+', expo_uf_pct: 93.0, tac_pct: 1.96, tac_industria_pct: 1.35,
      },
      composicion: [
        { nombre: 'Bonos Bancarios', pct: 55.8 },
        { nombre: 'Bonos Corporativos', pct: 35.2 },
        { nombre: 'Gobierno', pct: 5.4 },
        { nombre: 'Depósitos', pct: 3.6 },
        { nombre: 'Letras Hipotecarias', pct: 0.1 },
      ],
      clasificacion_crediticia: [
        { rating: 'AA', pct: 45 },
        { rating: 'A', pct: 15 },
        { rating: 'AAA', pct: 10 },
        { rating: 'BBB', pct: 10 },
        { rating: '<BB', pct: 10 },
        { rating: 'Gobierno', pct: 5 },
        { rating: 'N-1', pct: 5 },
      ],
      principales_emisores: [
        { nombre: 'Banco de Chile', pct: 17.4 },
        { nombre: 'Scotiabank Chile', pct: 12.2 },
        { nombre: 'Banco Itaú CorpBanca', pct: 6.4 },
        { nombre: 'Tesorería de Chile', pct: 5.4 },
        { nombre: 'BCI', pct: 5.0 },
        { nombre: 'Banco Internacional', pct: 4.5 },
        { nombre: 'Banco Santander Chile', pct: 4.3 },
        { nombre: 'Banco Central de Chile', pct: 3.5 },
        { nombre: 'Costanera Norte SA', pct: 2.0 },
        { nombre: 'Forum Servicios Finan. SA', pct: 1.8 },
      ],
    },
    rentabilidades_historicas: {
      '2022': { ene: 0.18, feb: 1.45, mar: 1.34, abr: 2.42, may: 0.70, jun: 1.11, jul: 1.56, ago: -0.90, sep: -1.19, oct: 0.72, nov: 2.26, dic: 0.89, anual: 10.99 },
      '2023': { ene: 0.59, feb: 0.56, mar: 0.93, abr: -0.58, may: -0.52, jun: 1.26, jul: 0.52, ago: 0.31, sep: -1.19, oct: -0.52, nov: 2.41, dic: 1.86, anual: 5.71 },
      '2024': { ene: 0.27, feb: 0.45, mar: 1.00, abr: 0.21, may: 0.99, jun: 0.62, jul: 1.36, ago: 1.28, sep: 1.33, oct: -0.99, nov: 1.14, dic: 0.09, anual: 8.01 },
      '2025': { ene: 0.85, feb: 0.85, mar: 0.49, abr: 0.88, may: -0.06, jun: 0.30, jul: 0.53, ago: 0.67, sep: 0.46, oct: 0.24, nov: 0.21, dic: 0.19, anual: 5.75 },
      '2026': { ene: 0.44, feb: 0.55, mar: 1.05, abr: null, may: null, jun: null, jul: null, ago: null, sep: null, oct: null, nov: null, dic: null, anual: 2.05 },
    },
    tributario: { apv: true, apvc: true, art57: true, art107: false, art108: true },
    objetivo:
      'Invertir en instrumentos de deuda de corto, mediano y largo plazo. Duración mínima 366 días, máxima 1460 días.',
  },
  'monetario': {
    _paleta: 'gris',
    identificacion: {
      nombre_completo: 'Fondo Mutuo LarrainVial Monetario',
      nombre_corto: 'Monetario',
      run: '8177',
      nemo_dcv: 'CFMLVCASHA',
      bloomberg: 'IVSXCSH CI Equity',
      tipo_vehiculo: 'Fondo Mutuo',
      moneda: 'CLP',
      benchmark: 'Duración máx 90 días',
      horizonte_minimo: 'Desde 1 día',
      rescate: 'T+1',
      monto_minimo: 'Sin mínimo',
      portfolio_manager: 'Iván Álvarez',
      auditores: 'KPMG',
      remuneracion: 'Hasta 3,00% anual IVA incluido',
      serie_referencia: 'A',
      vigente: true,
    },
    riesgo: { nivel: 1, escala_max: 7, descripcion: 'Muy Bajo' },
    datos_mensuales: {
      patrimonio_display: '$347.737 millones CLP',
      patrimonio_mm_clp: 347737,
      rentabilidades: { ytd: 0.91, '1m': 0.31, '3m': 0.91, '6m': 1.88, '12m': 3.98, '2y': 9.07, '3y': 18.37, '5y': 30.03 },
      estadisticas_cartera: {
        ytm_clf_pct: 3.7, duracion_anios: 0.2, volatilidad_pct: 0.0,
        rating_promedio: 'AAA', expo_uf_pct: 8.8, tac_pct: 1.07, tac_industria_pct: 1.35,
      },
      composicion: [
        { nombre: 'CLP', pct: 91.2 },
        { nombre: 'UF', pct: 8.8 },
      ],
      clasificacion_crediticia: [
        { rating: 'AAA', pct: 50 },
        { rating: 'Gobierno', pct: 20 },
        { rating: 'N-1', pct: 15 },
        { rating: 'AA', pct: 15 },
      ],
      principales_emisores: [
        { nombre: 'Banco Central de Chile', pct: 24.4 },
        { nombre: 'Banco Santander Chile', pct: 16.9 },
        { nombre: 'BCI', pct: 15.4 },
        { nombre: 'Banco Itaú CorpBanca', pct: 14.7 },
        { nombre: 'Banco de Chile', pct: 10.2 },
        { nombre: 'Banco Bice', pct: 4.3 },
        { nombre: 'Banco BTG Pactual SA', pct: 3.8 },
        { nombre: 'Scotiabank Chile', pct: 3.8 },
        { nombre: 'Banco Security', pct: 2.4 },
        { nombre: 'Banco Consorcio', pct: 1.4 },
      ],
    },
    rentabilidades_historicas: {
      '2022': { ene: 0.19, feb: 0.27, mar: 0.35, abr: 0.48, may: 0.54, jun: 0.59, jul: 0.64, ago: 0.70, sep: 0.70, oct: 0.77, nov: 0.79, dic: 0.80, anual: 7.03 },
      '2023': { ene: 0.78, feb: 0.70, mar: 0.78, abr: 0.75, may: 0.78, jun: 0.75, jul: 0.78, ago: 0.76, sep: 0.70, oct: 0.70, nov: 0.65, dic: 0.64, anual: 9.16 },
      '2024': { ene: 0.61, feb: 0.52, mar: 0.54, abr: 0.48, may: 0.48, jun: 0.42, jul: 0.42, ago: 0.41, sep: 0.39, oct: 0.39, nov: 0.36, dic: 0.37, anual: 5.53 },
      '2025': { ene: 0.36, feb: 0.33, mar: 0.37, abr: 0.35, may: 0.36, jun: 0.33, jul: 0.34, ago: 0.34, sep: 0.32, oct: 0.33, nov: 0.31, dic: 0.32, anual: 4.15 },
      '2026': { ene: 0.32, feb: 0.28, mar: 0.31, abr: null, may: null, jun: null, jul: null, ago: null, sep: null, oct: null, nov: null, dic: null, anual: 0.91 },
    },
    tributario: { apv: false, apvc: false, art57: false, art107: false, art108: false },
    objetivo:
      'Maximizar retorno en instrumentos de deuda de corto plazo con duración menor o igual a 90 días.',
  },
  'money-market': {
    _paleta: 'gris',
    identificacion: {
      nombre_completo: 'Fondo Mutuo LarrainVial Money Market',
      nombre_corto: 'Money Market',
      run: '8606',
      nemo_dcv: 'CFMLVMMAKA',
      bloomberg: 'LVMOMAA CI Equity',
      tipo_vehiculo: 'Fondo Mutuo',
      moneda: 'USD',
      benchmark: 'Duración máx 90 días en USD',
      horizonte_minimo: 'Desde 1 día',
      rescate: 'T+1',
      monto_minimo: 'Sin mínimo',
      portfolio_manager: 'Iván Álvarez',
      auditores: 'KPMG',
      remuneracion: 'Hasta 2,38% anual IVA incluido',
      serie_referencia: 'A',
      vigente: true,
    },
    riesgo: { nivel: 1, escala_max: 7, descripcion: 'Muy Bajo' },
    datos_mensuales: {
      patrimonio_display: 'USD $171 millones',
      patrimonio_mm_clp: null,
      rentabilidades: { ytd: 0.71, '1m': 0.23, '3m': 0.71, '6m': 1.47, '12m': 3.02, '2y': 6.81, '3y': 11.17, '5y': 13.63 },
      estadisticas_cartera: {
        ytm_clf_pct: 4.3, duracion_anios: 0.1, volatilidad_pct: 0.0,
        rating_promedio: 'A', expo_uf_pct: 0, tac_pct: 1.41, tac_industria_pct: 1.35,
      },
      composicion: [],
      clasificacion_crediticia: [{ rating: 'A', pct: 100 }],
      principales_emisores: [
        { nombre: 'HSBC Bank Chile', pct: 18.7 },
        { nombre: 'Banco Consorcio', pct: 11.8 },
        { nombre: 'Banco del Estado de Chile', pct: 10.8 },
        { nombre: 'Banco de Chile', pct: 9.7 },
        { nombre: 'Banco BTG Pactual SA', pct: 9.4 },
        { nombre: 'BCI', pct: 7.9 },
        { nombre: 'Banco Santander Chile', pct: 7.8 },
        { nombre: 'Scotiabank Chile', pct: 7.4 },
        { nombre: 'Banco Bice', pct: 7.0 },
        { nombre: 'Banco Itaú CorpBanca', pct: 5.7 },
      ],
    },
    rentabilidades_historicas: {
      '2022': { ene: 0.01, feb: 0.01, mar: 0.02, abr: 0.03, may: 0.05, jun: 0.07, jul: 0.09, ago: 0.13, sep: 0.14, oct: 0.18, nov: 0.22, dic: 0.28, anual: 1.25 },
      '2023': { ene: 0.32, feb: 0.29, mar: 0.32, abr: 0.36, may: 0.36, jun: 0.32, jul: 0.32, ago: 0.33, sep: 0.33, oct: 0.33, nov: 0.33, dic: 0.34, anual: 4.01 },
      '2024': { ene: 0.34, feb: 0.32, mar: 0.34, abr: 0.33, may: 0.34, jun: 0.33, jul: 0.34, ago: 0.34, sep: 0.32, oct: 0.29, nov: 0.30, dic: 0.27, anual: 3.94 },
      '2025': { ene: 0.27, feb: 0.23, mar: 0.25, abr: 0.24, may: 0.25, jun: 0.24, jul: 0.26, ago: 0.26, sep: 0.25, oct: 0.26, nov: 0.25, dic: 0.25, anual: 3.06 },
      '2026': { ene: 0.26, feb: 0.22, mar: 0.23, abr: null, may: null, jun: null, jul: null, ago: null, sep: null, oct: null, nov: null, dic: null, anual: 0.71 },
    },
    tributario: { apv: false, apvc: false, art57: false, art107: false, art108: false },
    objetivo:
      'Invertir en instrumentos de deuda de emisores extranjeros y nacionales en dólares y pesos, duración máx 90 días.',
  },
};

for (const [id, patch] of Object.entries(updates)) {
  const idx = data.fondos.findIndex((f) => f._id === id);
  if (idx === -1) {
    console.error('NOT FOUND:', id);
    continue;
  }
  const prev = data.fondos[idx];
  // Deep merge shallow per field
  data.fondos[idx] = {
    ...prev,
    _paleta: patch._paleta ?? prev._paleta,
    identificacion: { ...prev.identificacion, ...patch.identificacion },
    riesgo: { ...prev.riesgo, ...patch.riesgo },
    datos_mensuales: {
      ...prev.datos_mensuales,
      patrimonio_display: patch.datos_mensuales.patrimonio_display,
      patrimonio_mm_clp: patch.datos_mensuales.patrimonio_mm_clp,
      rentabilidades: { ...prev.datos_mensuales.rentabilidades, ...patch.datos_mensuales.rentabilidades },
      estadisticas_cartera: { ...prev.datos_mensuales.estadisticas_cartera, ...patch.datos_mensuales.estadisticas_cartera },
      composicion: patch.datos_mensuales.composicion,
      clasificacion_crediticia: patch.datos_mensuales.clasificacion_crediticia,
      principales_emisores: patch.datos_mensuales.principales_emisores,
    },
    rentabilidades_historicas: patch.rentabilidades_historicas,
    tributario: patch.tributario,
    objetivo: patch.objetivo,
  };
  console.log('updated:', id);
}

fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log('DONE. Size:', fs.statSync(file).size, 'bytes');
