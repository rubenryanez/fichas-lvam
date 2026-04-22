// API route: indicadores macro Chile (TPM, UF, IPC) con cache 24h y fallback
import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24h

interface MercadoResponse {
  tpm: number;
  tpm_tendencia: 'baja' | 'estable' | 'alza';
  uf_hoy: number;
  ipc_12m: number;
  fecha: string;
  fuente: string;
}

const FALLBACK: MercadoResponse = {
  tpm: 5.0,
  tpm_tendencia: 'baja',
  uf_hoy: 38500,
  ipc_12m: 2.8,
  fecha: new Date().toISOString().slice(0, 10),
  fuente: 'Fallback (BCCh / INE no disponibles)',
};

const TPM_6M_AGO = 5.25; // Comparador fijo solicitado

async function fetchJson(url: string, signal?: AbortSignal): Promise<any> {
  const res = await fetch(url, { signal, next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function GET() {
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 4000);

  try {
    const [ufJson, ipcJson] = await Promise.all([
      fetchJson('https://mindicador.cl/api/uf', ac.signal),
      fetchJson('https://mindicador.cl/api/ipc', ac.signal),
    ]);
    clearTimeout(timeout);

    const ufHoy = Number(ufJson?.serie?.[0]?.valor);
    const ipc12mRaw = Array.isArray(ipcJson?.serie) ? ipcJson.serie.slice(0, 12) : [];
    const ipc12mAcum =
      ipc12mRaw.length === 12
        ? (ipc12mRaw.reduce((acc: number, r: any) => acc * (1 + Number(r.valor) / 100), 1) - 1) * 100
        : NaN;

    // TPM desde mindicador (endpoint similar); si falla usa fallback
    let tpm: number = FALLBACK.tpm;
    try {
      const tpmJson = await fetchJson('https://mindicador.cl/api/tpm', ac.signal);
      const t = Number(tpmJson?.serie?.[0]?.valor);
      if (!Number.isNaN(t)) tpm = t;
    } catch {
      // se usa fallback
    }

    const tendencia: 'baja' | 'estable' | 'alza' =
      tpm < TPM_6M_AGO ? 'baja' : tpm > TPM_6M_AGO ? 'alza' : 'estable';

    const body: MercadoResponse = {
      tpm: Number.isFinite(tpm) ? tpm : FALLBACK.tpm,
      tpm_tendencia: tendencia,
      uf_hoy: Number.isFinite(ufHoy) ? ufHoy : FALLBACK.uf_hoy,
      ipc_12m: Number.isFinite(ipc12mAcum) ? Math.round(ipc12mAcum * 10) / 10 : FALLBACK.ipc_12m,
      fecha: ufJson?.serie?.[0]?.fecha?.slice(0, 10) ?? FALLBACK.fecha,
      fuente: 'BCCh / INE / mindicador.cl',
    };

    return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=86400' } });
  } catch {
    clearTimeout(timeout);
    return NextResponse.json(FALLBACK, { headers: { 'Cache-Control': 'public, s-maxage=3600' } });
  }
}
