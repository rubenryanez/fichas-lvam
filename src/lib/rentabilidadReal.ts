// Utilidades para convertir rentabilidades nominales a reales descontando IPC.
// IPC fuente: INE Chile (ver _meta.ipc_mensual en FONDOS_LVAM.json).

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

export type SerieMensual = Record<string, Record<string, number | null>>;

// (1 + rNominal/100) / (1 + ipc/100) - 1, resultado en %
export function nominalToReal(nominal: number, ipc: number): number {
  return ((1 + nominal / 100) / (1 + ipc / 100) - 1) * 100;
}

interface IterMes {
  year: string;
  mes: (typeof MESES)[number];
  nominal: number;
}

function iterateMesesHistoricos(historicas: SerieMensual): IterMes[] {
  const years = Object.keys(historicas).sort();
  const out: IterMes[] = [];
  for (const y of years) {
    for (const m of MESES) {
      const v = historicas[y]?.[m];
      if (v === null || v === undefined) continue;
      out.push({ year: y, mes: m, nominal: v });
    }
  }
  return out;
}

// Estimador de IPC faltante: promedio de los últimos 3 meses conocidos.
function estimateIpc(
  ipcMensual: SerieMensual,
  knownHistory: number[]
): number {
  if (knownHistory.length >= 3) {
    const last3 = knownHistory.slice(-3);
    return last3.reduce((a, b) => a + b, 0) / 3;
  }
  if (knownHistory.length > 0) {
    return knownHistory.reduce((a, b) => a + b, 0) / knownHistory.length;
  }
  // Fallback: primer IPC no-null disponible
  for (const y of Object.keys(ipcMensual).sort()) {
    for (const m of MESES) {
      const v = ipcMensual[y]?.[m];
      if (v !== null && v !== undefined) return v;
    }
  }
  return 0;
}

/**
 * Construye serie base 100 nominal y real desde rentabilidades históricas.
 * Para meses donde el IPC no está disponible (futuro), usa el promedio
 * de los últimos 3 meses conocidos como estimación.
 */
export function buildBase100(
  historicas: SerieMensual,
  ipcMensual: SerieMensual
): { labels: string[]; nominal: number[]; real: number[] } {
  const iter = iterateMesesHistoricos(historicas);
  const labels: string[] = ['Inicio'];
  const nominal: number[] = [100];
  const real: number[] = [100];
  let valNominal = 100;
  let valReal = 100;
  const ipcKnownHistory: number[] = [];

  for (const { year, mes, nominal: rNom } of iter) {
    let ipc = ipcMensual[year]?.[mes];
    if (ipc === null || ipc === undefined) {
      ipc = estimateIpc(ipcMensual, ipcKnownHistory);
    } else {
      ipcKnownHistory.push(ipc);
    }
    const rReal = nominalToReal(rNom, ipc);

    valNominal = valNominal * (1 + rNom / 100);
    valReal = valReal * (1 + rReal / 100);

    labels.push(`${mes} ${year.slice(2)}`);
    nominal.push(Math.round(valNominal * 100) / 100);
    real.push(Math.round(valReal * 100) / 100);
  }

  return { labels, nominal, real };
}

/**
 * Rentabilidad acumulada real para los últimos `meses` meses.
 * Recorre la serie histórica de atrás hacia adelante.
 */
export function rentAcumuladaReal(
  meses: number,
  historicas: SerieMensual,
  ipcMensual: SerieMensual
): number {
  const iter = iterateMesesHistoricos(historicas);
  const tail = iter.slice(-meses);
  // Historial conocido de IPC hasta el inicio del tramo
  const knownIpc: number[] = [];
  const iterBefore = iter.slice(0, iter.length - tail.length);
  for (const { year, mes } of iterBefore) {
    const v = ipcMensual[year]?.[mes];
    if (v !== null && v !== undefined) knownIpc.push(v);
  }

  let acc = 1;
  for (const { year, mes, nominal: rNom } of tail) {
    let ipc = ipcMensual[year]?.[mes];
    if (ipc === null || ipc === undefined) {
      ipc = estimateIpc(ipcMensual, knownIpc);
    } else {
      knownIpc.push(ipc);
    }
    const rReal = nominalToReal(rNom, ipc);
    acc *= 1 + rReal / 100;
  }
  return (acc - 1) * 100;
}
