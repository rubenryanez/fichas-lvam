'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Chart, registerables, type ChartConfiguration } from 'chart.js';
import fondosData from '@/data/FONDOS_LVAM.json';
import AuthGuard from '@/components/AuthGuard';
import { buildBase100, type SerieMensual } from '@/lib/rentabilidadReal';

Chart.register(...registerables);

const FOREST_HEX: Record<string, string> = {
  verde: '#1A3D2B',
  azul: '#1A3D5C',
  indigo: '#2D1A5C',
  teal: '#1A3D3D',
  gris: '#2C3E50',
  ambar: '#78350F',
};

const nf = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${nf.format(v)}%`;
}

export default function ComparadorPage() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <ComparadorInner />
      </Suspense>
    </AuthGuard>
  );
}

function ComparadorInner() {
  const fondos = (fondosData as any).fondos as any[];
  const ipcMensual = ((fondosData as any)._meta?.ipc_mensual?.datos ?? {}) as SerieMensual;
  const sp = useSearchParams();
  const initial = useMemo(() => {
    const q = sp.get('fondos');
    if (!q) return [] as string[];
    return q
      .split(',')
      .map((s) => s.trim())
      .filter((s) => fondos.some((f) => f._id === s))
      .slice(0, 3);
  }, [sp, fondos]);

  const [selected, setSelected] = useState<string[]>(initial);
  const [modo, setModo] = useState<'nominal' | 'real'>('nominal');

  useEffect(() => {
    if (initial.length && selected.length === 0) setSelected(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };
  const clear = () => setSelected([]);

  const selectedFondos = selected.map((id) => fondos.find((f) => f._id === id)).filter(Boolean);

  return (
    <div style={{ background: 'var(--snow)', minHeight: '100vh' }}>
      <header style={{ background: 'var(--white)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ flex: 1 }} />
          <strong style={{ letterSpacing: '.08em', color: '#1A3D2B' }}>LARRAINVIAL</strong>
          <span style={{ color: 'var(--mist)', fontSize: 13 }}>Asset Management</span>
        </div>
      </header>

      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px 28px' }}>
          <BackToFondoButton initialIds={initial} fondos={fondos} />
          <h1 className="display" style={{ margin: '12px 0 0', fontSize: 36, color: 'var(--ink)' }}>
            Comparador de Fondos
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--mist)', fontSize: 14 }}>
            Selecciona hasta 3 fondos para comparar lado a lado.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px 64px' }}>
        {/* Selector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 14,
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--steel)' }}>
            Seleccionados: <strong>{selected.length}</strong> / 3
          </div>
          <button
            onClick={clear}
            disabled={selected.length === 0}
            style={{
              padding: '8px 14px',
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--steel)',
              cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selected.length === 0 ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            Limpiar selección
          </button>
        </div>

        <div
          className="lv-cmp-selector"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 10,
            marginBottom: 32,
          }}
        >
          {fondos.map((f: any) => {
            const on = selected.includes(f._id);
            const disabled = !on && selected.length >= 3;
            const forest = FOREST_HEX[f._paleta] ?? '#1A3D2B';
            return (
              <button
                key={f._id}
                onClick={() => toggle(f._id)}
                disabled={disabled}
                style={{
                  textAlign: 'left',
                  padding: 12,
                  background: on ? 'var(--pale)' : 'var(--white)',
                  border: on ? `2px solid ${forest}` : '1px solid var(--line)',
                  borderRadius: 8,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  fontFamily: 'inherit',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `2px solid ${forest}`,
                    background: on ? forest : 'transparent',
                    color: 'var(--white)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {on ? '✓' : ''}
                </span>
                <span style={{ width: 4, height: 30, background: forest, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.identificacion.nombre_corto}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mist)' }}>{f._categoria_display}</div>
                </div>
              </button>
            );
          })}
        </div>

        {selected.length < 2 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--mist)',
              background: 'var(--white)',
              borderRadius: 10,
              border: '1px solid var(--line)',
            }}
          >
            Selecciona al menos 2 fondos para ver la comparación.
          </div>
        ) : (
          <>
            <SeccionRentabilidad fondos={selectedFondos} ipcMensual={ipcMensual} modo={modo} setModo={setModo} />
            <TablaComparativa fondos={selectedFondos} />
            <SeccionRadar fondos={selectedFondos} />
          </>
        )}

        <p style={{ marginTop: 32, fontSize: 11.5, color: 'var(--mist)', textAlign: 'center' }}>
          Datos al 31/03/2026. La rentabilidad pasada no garantiza resultados futuros.
        </p>
      </main>
    </div>
  );
}

// --- Botón "Volver al fondo" dinámico ---
function BackToFondoButton({ initialIds, fondos }: { initialIds: string[]; fondos: any[] }) {
  const router = useRouter();
  const firstId = initialIds[0];
  const firstFondo = firstId ? fondos.find((f) => f._id === firstId) : null;
  const label = firstFondo ? `Volver a ${firstFondo.identificacion.nombre_corto}` : 'Volver al inicio';
  const href = firstFondo ? `/fondo/${firstFondo._id}` : '/';
  return (
    <button
      onClick={() => router.push(href)}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        color: 'var(--forest)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      ← {label}
    </button>
  );
}

// --- Sección rentabilidad ---
function SeccionRentabilidad({
  fondos,
  ipcMensual,
  modo,
  setModo,
}: {
  fondos: any[];
  ipcMensual: SerieMensual;
  modo: 'nominal' | 'real';
  setModo: (m: 'nominal' | 'real') => void;
}) {
  const series = useMemo(
    () =>
      fondos.map((f) => {
        const base = buildBase100(f.rentabilidades_historicas as SerieMensual, ipcMensual);
        return { id: f._id, nombre: f.identificacion.nombre_corto, paleta: f._paleta, base };
      }),
    [fondos, ipcMensual]
  );

  // Usar la misma cantidad de puntos (cortar al mínimo común)
  const minLen = Math.min(...series.map((s) => s.base.labels.length));
  const labels = series[0]?.base.labels.slice(0, minLen) ?? [];
  const datasets = series.map((s) => ({
    label: s.nombre,
    data: (modo === 'nominal' ? s.base.nominal : s.base.real).slice(0, minLen),
    color: FOREST_HEX[s.paleta] ?? '#1A3D2B',
  }));

  return (
    <section
      style={{
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <h3 style={secTitle()}>Rentabilidad acumulada base 100</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['nominal', 'real'] as const).map((k) => {
            const on = modo === k;
            return (
              <button
                key={k}
                onClick={() => setModo(k)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #1A3D2B',
                  background: on ? '#1A3D2B' : 'var(--white)',
                  color: on ? 'var(--white)' : '#1A3D2B',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {k === 'nominal' ? 'Nominal' : 'Real (IPC)'}
              </button>
            );
          })}
        </div>
      </div>
      <LineChart labels={labels} datasets={datasets} height={320} />
    </section>
  );
}

// --- Tabla comparativa ---
function TablaComparativa({ fondos }: { fondos: any[] }) {
  const sections: { title: string; rows: [string, (f: any) => string | number | null | undefined][] }[] = [
    {
      title: 'Perfil',
      rows: [
        ['Categoría', (f) => f._categoria_display],
        ['Riesgo', (f) => `${f.riesgo.nivel}/${f.riesgo.escala_max} · ${f.riesgo.descripcion}`],
        ['Horizonte mínimo', (f) => f.identificacion.horizonte_minimo],
        ['Rescate', (f) => f.identificacion.rescate],
        ['Moneda', (f) => f.identificacion.moneda],
        ['Benchmark', (f) => f.identificacion.benchmark ?? '—'],
      ],
    },
    {
      title: 'Rentabilidad',
      rows: [
        ['YTD 2026', (f) => f.datos_mensuales.rentabilidades.ytd],
        ['1 Mes', (f) => f.datos_mensuales.rentabilidades['1m']],
        ['3 Meses', (f) => f.datos_mensuales.rentabilidades['3m']],
        ['6 Meses', (f) => f.datos_mensuales.rentabilidades['6m']],
        ['12 Meses', (f) => f.datos_mensuales.rentabilidades['12m']],
        ['2 Años', (f) => f.datos_mensuales.rentabilidades['2y']],
      ],
    },
    {
      title: 'Cartera',
      rows: [
        ['YTM', (f) => f.datos_mensuales.estadisticas_cartera.ytm_clf_pct],
        ['Duración (años)', (f) => f.datos_mensuales.estadisticas_cartera.duracion_anios],
        ['Volatilidad', (f) => f.datos_mensuales.estadisticas_cartera.volatilidad_pct],
        ['Rating promedio', (f) => f.datos_mensuales.estadisticas_cartera.rating_promedio ?? '—'],
        ['Exposición UF', (f) => f.datos_mensuales.estadisticas_cartera.expo_uf_pct],
      ],
    },
    {
      title: 'Costos',
      rows: [
        ['Remuneración', (f) => f.identificacion.remuneracion ?? '—'],
        ['TAC', (f) => f.datos_mensuales.estadisticas_cartera.tac_pct],
        [
          'TAC vs industria',
          (f) => {
            const tac = f.datos_mensuales.estadisticas_cartera.tac_pct;
            const ind = f.datos_mensuales.estadisticas_cartera.tac_industria_pct;
            if (tac === null || ind === null) return '—';
            const diff = tac - ind;
            return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} pp`;
          },
        ],
      ],
    },
    {
      title: 'Tributario',
      rows: [
        ['APV', (f) => (f.tributario.apv ? '✓' : '—')],
        ['APVC', (f) => (f.tributario.apvc ? '✓' : '—')],
        ['Art. 57', (f) => (f.tributario.art57 ? '✓' : '—')],
        ['Art. 108', (f) => (f.tributario.art108 ? '✓' : '—')],
      ],
    },
  ];

  const formatVal = (val: unknown, isRentabilidad: boolean, isNumeric: boolean): string => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'number') return isRentabilidad ? fmtPct(val) : nf.format(val);
    return String(val);
  };

  return (
    <section
      style={{
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <h3 style={secTitle()}>Comparación lado a lado</h3>
      <div className="lv-cmp-tabla" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--mist)' }}></th>
              {fondos.map((f) => {
                const forest = FOREST_HEX[f._paleta] ?? '#1A3D2B';
                return (
                  <th
                    key={f._id}
                    style={{ padding: '10px 12px', background: forest, color: 'var(--white)', textAlign: 'right' }}
                  >
                    {f.identificacion.nombre_corto}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sections.map((sec) => (
              <FragmentSec key={sec.title} sec={sec} fondos={fondos} formatVal={formatVal} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FragmentSec({
  sec,
  fondos,
  formatVal,
}: {
  sec: { title: string; rows: [string, (f: any) => string | number | null | undefined][] };
  fondos: any[];
  formatVal: (v: unknown, isRent: boolean, isNum: boolean) => string;
}) {
  return (
    <>
      <tr style={{ background: 'var(--snow)' }}>
        <td
          colSpan={1 + fondos.length}
          style={{
            padding: '8px 12px',
            fontSize: 10.5,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: 'var(--mist)',
            fontWeight: 700,
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          {sec.title}
        </td>
      </tr>
      {sec.rows.map(([label, accessor]) => {
        const isRent = sec.title === 'Rentabilidad' || label === 'Volatilidad' || label === 'YTM' || label === 'Exposición UF' || label === 'TAC';
        const vals = fondos.map((f) => accessor(f));
        // Detectar mejor valor en rentabilidad (mayor = mejor)
        const numericVals = vals.map((v) => (typeof v === 'number' ? v : NaN));
        const hasNumeric = numericVals.some((n) => !Number.isNaN(n));
        const best = sec.title === 'Rentabilidad' && hasNumeric ? Math.max(...numericVals.filter((n) => !Number.isNaN(n))) : null;
        return (
          <tr key={label} style={{ borderBottom: '1px solid var(--line2)' }}>
            <td style={{ padding: '8px 12px', color: 'var(--steel)' }}>{label}</td>
            {vals.map((v, i) => {
              const isBest = best !== null && typeof v === 'number' && v === best && vals.length > 1;
              return (
                <td
                  key={i}
                  style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontFamily: typeof v === 'number' ? 'var(--font-num), system-ui, sans-serif' : undefined,
                    fontWeight: isBest ? 700 : 500,
                    color: isBest ? '#15803D' : 'var(--ink)',
                  }}
                >
                  {formatVal(v, isRent, typeof v === 'number')}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

// --- Radar ---
function SeccionRadar({ fondos }: { fondos: any[] }) {
  const ejes = ['Liquidez', 'Retorno 12M', 'Riesgo Bajo', 'Cobertura IPC', 'Rescate rápido', 'Costo TAC'];
  const datasets = fondos.map((f) => {
    const r = f.datos_mensuales.rentabilidades;
    const est = f.datos_mensuales.estadisticas_cartera;
    return {
      label: f.identificacion.nombre_corto,
      data: [
        80,
        r['12m'] ?? 0,
        (7 - f.riesgo.nivel) * 14,
        est.expo_uf_pct ?? 30,
        80,
        100 - (est.tac_pct ?? 1) * 20,
      ],
      color: FOREST_HEX[f._paleta] ?? '#1A3D2B',
    };
  });

  return (
    <section
      style={{
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: 20,
      }}
    >
      <h3 style={secTitle()}>Perfil multifactor</h3>
      <RadarChart labels={ejes} datasets={datasets} height={380} />
    </section>
  );
}

function secTitle(): CSSProperties {
  return {
    margin: 0,
    marginBottom: 14,
    fontSize: 13,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    color: 'var(--forest)',
    fontWeight: 700,
  };
}

// --- Charts ---
function LineChart({
  labels,
  datasets,
  height,
}: {
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
  height: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((d) => ({
          label: d.label,
          data: d.data,
          borderColor: d.color,
          backgroundColor: d.color + '20',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.15,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Nunito Sans' }, boxWidth: 12 } },
          tooltip: { backgroundColor: '#1A2535', titleColor: '#7FB3D3', bodyColor: '#fff' },
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { family: 'Nunito Sans' } } },
          y: { grid: { color: '#F3F4F6' }, ticks: { font: { family: 'Nunito' } } },
        },
      },
    };
    chartRef.current = new Chart(ref.current, config);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, datasets]);
  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

function RadarChart({
  labels,
  datasets,
  height,
}: {
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
  height: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const config: ChartConfiguration = {
      type: 'radar',
      data: {
        labels,
        datasets: datasets.map((d) => ({
          label: d.label,
          data: d.data,
          borderColor: d.color,
          backgroundColor: d.color + '33',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: d.color,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Nunito Sans' } } },
          tooltip: { backgroundColor: '#1A2535', titleColor: '#7FB3D3', bodyColor: '#fff' },
        },
        scales: {
          r: {
            angleLines: { color: '#E5E7EB' },
            grid: { color: '#F3F4F6' },
            pointLabels: { font: { family: 'Nunito Sans', size: 11 } },
            ticks: { display: false, backdropColor: 'transparent' },
          },
        },
      },
    };
    chartRef.current = new Chart(ref.current, config);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, datasets]);
  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}
