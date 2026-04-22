'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import fondosData from '@/data/FONDOS_LVAM.json';
import AuthGuard from '@/components/AuthGuard';

type Fondo = (typeof fondosData.fondos)[number];

const CATEGORIAS: { key: string; label: string; match: (c: string) => boolean }[] = [
  { key: 'todos', label: 'Todos', match: () => true },
  { key: 'rf_uf', label: 'RF UF', match: (c) => c === 'FM_RF_UF' },
  { key: 'rf_clp', label: 'RF CLP', match: (c) => c === 'FM_RF_CLP' },
  { key: 'rf_otros', label: 'RF Internacional', match: (c) => c === 'FM_RF_USD' || c === 'FM_RF_INTL' },
  { key: 'balanceados', label: 'Balanceados', match: (c) => c === 'FM_BAL' || c === 'FM_CAD' || c === 'FM_CON' },
  { key: 'rv', label: 'Renta Variable', match: (c) => c.startsWith('FM_RV') },
  { key: 'mm', label: 'Money Market', match: (c) => c === 'FM_MM' },
  { key: 'fi', label: 'FI Alternativos', match: (c) => c.startsWith('FI_') },
];

type OrdenKey = 'rent12m' | 'riesgo' | 'patrimonio' | 'nombre';

const nf = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${nf.format(v)}%`;
}

export default function HomePage() {
  const fondos = (fondosData as any).fondos as Fondo[];
  const [catKey, setCatKey] = useState<string>('todos');
  const [query, setQuery] = useState('');
  const [orden, setOrden] = useState<OrdenKey>('rent12m');

  const filtered = useMemo(() => {
    const cat = CATEGORIAS.find((c) => c.key === catKey) ?? CATEGORIAS[0];
    const q = query.trim().toLowerCase();

    let list = fondos.filter((f) => {
      if (!cat.match((f as any)._categoria)) return false;
      if (!q) return true;
      const id = (f as any).identificacion;
      return (
        id.nombre_completo.toLowerCase().includes(q) ||
        id.nombre_corto.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      const A: any = a;
      const B: any = b;
      if (orden === 'nombre') return A.identificacion.nombre_corto.localeCompare(B.identificacion.nombre_corto);
      if (orden === 'riesgo') return (A.riesgo?.nivel ?? 0) - (B.riesgo?.nivel ?? 0);
      if (orden === 'patrimonio')
        return (B.datos_mensuales?.patrimonio_mm_clp ?? 0) - (A.datos_mensuales?.patrimonio_mm_clp ?? 0);
      // rent12m
      return (
        (B.datos_mensuales?.rentabilidades?.['12m'] ?? -Infinity) -
        (A.datos_mensuales?.rentabilidades?.['12m'] ?? -Infinity)
      );
    });

    return list;
  }, [fondos, catKey, query, orden]);

  const countByCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of CATEGORIAS) {
      m[c.key] = fondos.filter((f) => c.match((f as any)._categoria)).length;
    }
    return m;
  }, [fondos]);

  return (
    <AuthGuard>
      <header style={{ background: 'var(--white)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <strong style={{ letterSpacing: '.08em', color: '#1A3D2B' }}>LARRAINVIAL</strong>
          <span style={{ color: 'var(--mist)', fontSize: 13 }}>Asset Management · Portal FFMM</span>
        </div>
      </header>

      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          <h1 className="display" style={{ margin: 0, fontSize: 40, color: 'var(--ink)' }}>
            Fondos Mutuos LarrainVial
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--mist)', fontSize: 15 }}>
            {fondos.length} fondos · fichas institucionales con datos al {(fondosData as any)._meta?.periodo_datos ?? '—'}
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {/* Buscador + orden */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Buscar por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: '1 1 280px',
              padding: '10px 14px',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 14,
              background: 'var(--white)',
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          />
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as OrdenKey)}
            style={{
              padding: '10px 14px',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 14,
              background: 'var(--white)',
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          >
            <option value="rent12m">Ordenar: Rent. 12M</option>
            <option value="riesgo">Ordenar: Riesgo</option>
            <option value="patrimonio">Ordenar: Patrimonio</option>
            <option value="nombre">Ordenar: Nombre</option>
          </select>
        </div>

        {/* Chips de categoría */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {CATEGORIAS.map((c) => {
            const on = catKey === c.key;
            const count = countByCat[c.key] ?? 0;
            return (
              <button
                key={c.key}
                onClick={() => setCatKey(c.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: on ? '1px solid #1A3D2B' : '1px solid var(--line)',
                  background: on ? '#1A3D2B' : 'var(--white)',
                  color: on ? 'var(--white)' : 'var(--steel)',
                  fontSize: 13,
                  fontWeight: on ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {c.label}
                <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 12 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Grid de fondos */}
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--mist)' }}>
            Sin resultados para esta búsqueda.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {filtered.map((f) => (
              <FondoCard key={(f as any)._id} fondo={f} />
            ))}
          </div>
        )}
      </main>

      <footer
        style={{
          marginTop: 48,
          padding: '24px',
          borderTop: '1px solid var(--line)',
          background: 'var(--white)',
          textAlign: 'center',
          color: 'var(--mist)',
          fontSize: 12.5,
        }}
      >
        Datos a {(fondosData as any)._meta?.periodo_datos ?? '—'} · LarrainVial Asset Management
      </footer>
    </AuthGuard>
  );
}

function FondoCard({ fondo }: { fondo: Fondo }) {
  const f: any = fondo;
  const paleta = f._paleta as string;
  const r = f.datos_mensuales.rentabilidades;
  const id = f.identificacion;

  const paletaClass = `paleta-${paleta}`;

  return (
    <Link
      href={`/fondo/${f._id}`}
      className={paletaClass}
      style={{
        display: 'block',
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: 18,
        boxShadow: '0 1px 2px rgba(0,0,0,.03)',
        borderTop: '3px solid var(--forest)',
        transition: 'transform .15s ease, box-shadow .15s ease',
      }}
    >
      <div style={{ fontSize: 11.5, letterSpacing: '.06em', color: 'var(--forest)', textTransform: 'uppercase' }}>
        {f._categoria_display}
      </div>
      <h3 style={{ margin: '6px 0 4px', fontSize: 18, color: 'var(--ink)' }}>{id.nombre_corto}</h3>
      <div style={{ fontSize: 12.5, color: 'var(--mist)', minHeight: 32 }}>{id.nombre_completo}</div>

      <div style={{ display: 'flex', gap: 14, margin: '14px 0 10px' }}>
        <Metric label="YTD" value={fmtPct(r.ytd)} tint={tintByVal(r.ytd)} />
        <Metric label="12M" value={fmtPct(r['12m'])} tint={tintByVal(r['12m'])} />
      </div>

      <RiesgoBar nivel={f.riesgo.nivel} max={f.riesgo.escala_max} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5, color: 'var(--mist)' }}>
        <span>
          Riesgo {f.riesgo.nivel}/{f.riesgo.escala_max} · {f.riesgo.descripcion}
        </span>
        <span>{id.moneda}</span>
      </div>
    </Link>
  );
}

function tintByVal(v: number | null | undefined) {
  if (v === null || v === undefined) return 'var(--mist)';
  return v < 0 ? 'var(--red)' : 'var(--forest)';
}

function Metric({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--mist)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 20, fontWeight: 700, color: tint }}>
        {value}
      </div>
    </div>
  );
}

function RiesgoBar({ nivel, max }: { nivel: number; max: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const on = n <= nivel;
        const current = n === nivel;
        return (
          <div
            key={n}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 2,
              background: current ? 'var(--forest)' : on ? 'var(--grove)' : 'var(--line)',
            }}
          />
        );
      })}
    </div>
  );
}
