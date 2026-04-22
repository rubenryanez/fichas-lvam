'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Chart, registerables, type ChartConfiguration } from 'chart.js';
import AuthGuard from '@/components/AuthGuard';
import TermometroMercado from '@/components/TermometroMercado';
import MobileTabMenu from '@/components/MobileTabMenu';
import {
  buildBase100,
  rentAcumuladaReal,
  type SerieMensual,
} from '@/lib/rentabilidadReal';

Chart.register(...registerables);

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;
const MESES_LABEL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

type TabKey = 'ficha' | 'rentabilidad' | 'comparador' | 'simulador' | 'tributario' | 'guia' | 'series';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'ficha', label: 'Ficha' },
  { key: 'rentabilidad', label: 'Rentabilidad' },
  { key: 'comparador', label: 'Comparador' },
  { key: 'simulador', label: 'Simulador' },
  { key: 'tributario', label: 'Tributario' },
  { key: 'guia', label: 'Guía' },
  { key: 'series', label: 'Series' },
];

// Fondos con termómetro de mercado (según spec del usuario)
const FONDOS_CON_TERMOMETRO = new Set(['ahorro-a-plazo', 'ahorro-capital', 'monetario']);

const FOREST_HEX: Record<string, string> = {
  verde: '#1A3D2B',
  azul: '#1A3D5C',
  indigo: '#2D1A5C',
  teal: '#1A3D3D',
  gris: '#2C3E50',
  ambar: '#78350F',
};
const MINT_HEX: Record<string, string> = {
  verde: '#74C69D',
  azul: '#7FB3D3',
  indigo: '#A89CC8',
  teal: '#74C6C3',
  gris: '#A0AEC0',
  ambar: '#D97706',
};

const nf = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

function fmtPct(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${v.toFixed(digits)}%`;
}
function fmtNum(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return nf.format(v);
}
function fmtText(v: string | null | undefined): string {
  if (!v) return 'Por informar';
  return v;
}
function colorByValue(v: number | null | undefined): string {
  if (v === null || v === undefined) return 'var(--mist)';
  return v < 0 ? 'var(--red)' : 'var(--forest)';
}

// Extrae el número destacado del patrimonio_display para el hero
function patrimonioHeroDisplay(raw: string | null | undefined): { big: string; small: string } {
  if (!raw) return { big: 'Por informar', small: '' };
  // "$137.838 millones CLP" -> big "$137.838M", small "CLP"
  // "USD $171 millones"     -> big "USD $171M", small "USD"
  const m = raw.match(/(USD\s*)?\$\s*([\d\.]+)\s*(millones?|M)?\s*(CLP|USD)?/i);
  if (m) {
    const usdPrefix = m[1] ? 'USD ' : '';
    const num = m[2];
    const cur = m[4] ?? (m[1] ? 'USD' : 'CLP');
    return { big: `${usdPrefix}$${num}M`, small: cur };
  }
  return { big: raw, small: '' };
}

export default function FondoFicha({
  fondo,
  ipcMensual,
}: {
  fondo: any;
  ipcMensual: SerieMensual;
}) {
  const [tab, setTab] = useState<TabKey>('ficha');
  const paletaClass = `paleta-${fondo._paleta ?? 'verde'}`;
  const forest = FOREST_HEX[fondo._paleta] ?? '#1A3D2B';
  const mint = MINT_HEX[fondo._paleta] ?? '#74C69D';
  const showTermometro = FONDOS_CON_TERMOMETRO.has(fondo._id);

  return (
    <AuthGuard>
      <div className={`${paletaClass} lv-ficha`} style={{ minHeight: '100vh', background: 'var(--snow)', overflowX: 'hidden' }}>
        <Topbar fondo={fondo} />
        <Hero fondo={fondo} />
        <MetricStrip fondo={fondo} />
        {showTermometro && <TermometroMercado fondoId={fondo._id} />}
        <NavTabs active={tab} onChange={setTab} />
        <MobileTabMenu tabs={TABS} active={tab} onChange={setTab} />
        <main className="lv-main" style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 28px 32px', overflowX: 'hidden' }}>
          {tab === 'ficha' && <TabFicha fondo={fondo} />}
          {tab === 'rentabilidad' && (
            <TabRentabilidad fondo={fondo} ipcMensual={ipcMensual} forestHex={forest} mintHex={mint} />
          )}
          {tab === 'comparador' && <TabComparador fondo={fondo} forestHex={forest} />}
          {tab === 'simulador' && <TabSimulador fondo={fondo} forestHex={forest} ipcMensual={ipcMensual} />}
          {tab === 'tributario' && <TabTributario fondo={fondo} />}
          {tab === 'guia' && <TabGuia fondo={fondo} />}
          {tab === 'series' && <TabSeries fondo={fondo} />}
        </main>
        <Footer fondo={fondo} />
      </div>
    </AuthGuard>
  );
}

// ---------- 1. TOPBAR ----------
function Topbar({ fondo }: { fondo: any }) {
  const id = fondo.identificacion;
  const periodo = fondo.datos_mensuales?.periodo;
  return (
    <div
      style={{
        height: 44,
        background: 'var(--forest)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        color: 'rgba(255,255,255,.85)',
      }}
    >
      <div
        className="lv-topbar-inner"
        style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <Link
          href="/"
          className="lv-btn-touch"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'rgba(255,255,255,.9)',
            fontSize: 12.5,
            fontWeight: 600,
            padding: '6px 10px',
            border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 6,
            background: 'rgba(255,255,255,.06)',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Volver al índice de fondos"
        >
          <span aria-hidden>←</span> Fondos
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
            <path d="M16 2 L30 16 L16 30 L2 16 Z" fill="#D6EAF8" opacity=".9" />
            <path d="M16 8 L24 16 L16 24 L8 16 Z" fill="#1A3D5C" />
          </svg>
          <strong style={{ fontSize: 13, letterSpacing: '.1em', color: '#fff' }}>LARRAINVIAL</strong>
        </Link>
        <span className="lv-topbar-desktop-only" style={{ color: 'rgba(255,255,255,.25)' }}>│</span>
        <span className="lv-topbar-desktop-only" style={{ fontSize: 12, letterSpacing: '.04em' }}>Asset Management</span>
        <span style={{ flex: 1 }} />
        <span className="lv-topbar-desktop-only" style={{ display: 'inline-flex' }}>
          <TopPill>RUN {id.run}</TopPill>
        </span>
        {id.nemo_dcv && (
          <span className="lv-topbar-desktop-only" style={{ display: 'inline-flex' }}>
            <TopPill>Nemo {id.nemo_dcv}</TopPill>
          </span>
        )}
        {id.bloomberg && (
          <span className="lv-topbar-desktop-only" style={{ display: 'inline-flex' }}>
            <TopPill mint>{id.bloomberg}</TopPill>
          </span>
        )}
        {periodo && <TopPill>{periodo}</TopPill>}
      </div>
    </div>
  );
}

function TopPill({ children, mint }: { children: React.ReactNode; mint?: boolean }) {
  return (
    <span
      style={{
        padding: '4px 10px',
        background: mint ? 'rgba(127,179,211,.2)' : 'rgba(255,255,255,.1)',
        border: `1px solid ${mint ? 'var(--mint)' : 'rgba(255,255,255,.2)'}`,
        color: mint ? 'var(--mint)' : 'rgba(255,255,255,.85)',
        borderRadius: 4,
        fontSize: 11.5,
        fontWeight: mint ? 600 : 500,
        letterSpacing: '.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// ---------- 2. HERO ----------
function Hero({ fondo }: { fondo: any }) {
  const id = fondo.identificacion;
  const dm = fondo.datos_mensuales;
  const riesgo = fondo.riesgo;
  const patri = patrimonioHeroDisplay(dm.patrimonio_display);

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, var(--white) 0%, var(--pale) 100%)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div
        className="lv-hero-grid"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '36px 28px',
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {/* Izquierda */}
        <div>
          <div
            className="hero-eye"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 11,
              color: 'var(--grove)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            <span style={{ display: 'inline-block', width: 32, height: 1, background: 'var(--grove)' }} />
            {fondo._categoria_display}
          </div>
          <h1
            className="display lv-hero-title"
            style={{ margin: 0, fontSize: 40, color: 'var(--ink)', fontWeight: 400, lineHeight: 1.1 }}
          >
            Fondo Mutuo
            <br />
            <em style={{ color: 'var(--forest)', fontStyle: 'italic', fontWeight: 700 }}>{id.nombre_corto}</em>
          </h1>
          <div className="lv-hero-chips" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <HeroChip variant="g">Riesgo {riesgo.nivel}/{riesgo.escala_max}</HeroChip>
            <HeroChip variant="g">Serie {id.serie_referencia}</HeroChip>
            <HeroChip>{id.horizonte_minimo}</HeroChip>
            <HeroChip>Rescate {id.rescate}</HeroChip>
            {id.benchmark && <HeroChip variant="a">{id.benchmark}</HeroChip>}
          </div>
        </div>

        {/* Derecha: Patrimonio */}
        <div className="lv-hero-right" style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--mist)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Patrimonio del Fondo
          </div>
          <div
            className="display lv-hero-patrimonio"
            style={{
              fontSize: 48,
              color: 'var(--forest)',
              fontWeight: 700,
              lineHeight: 1.05,
              margin: '4px 0 4px',
            }}
          >
            {patri.big}
          </div>
          <div style={{ fontSize: 12, color: 'var(--steel)' }}>
            {id.moneda} · Valor cuota diario · Auditores {fmtText(id.auditores)}
          </div>
          <div className="lv-hero-tags" style={{ marginTop: 12, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <HeroChip variant="g" small>
              AMP-1 S&P Global
            </HeroChip>
            <HeroChip small>PRI Signatory</HeroChip>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroChip({
  children,
  variant,
  small,
}: {
  children: React.ReactNode;
  variant?: 'g' | 'a';
  small?: boolean;
}) {
  const base: CSSProperties = {
    fontSize: small ? 10.5 : 12,
    padding: small ? '3px 8px' : '5px 12px',
    borderRadius: 999,
    fontWeight: 600,
    letterSpacing: '.02em',
    border: '1px solid',
  };
  if (variant === 'g') {
    return (
      <span style={{ ...base, background: 'var(--pale)', color: 'var(--forest)', borderColor: 'rgba(26,61,92,.2)' }}>
        {children}
      </span>
    );
  }
  if (variant === 'a') {
    return (
      <span style={{ ...base, background: 'var(--amber-bg)', color: 'var(--amber)', borderColor: '#FDE68A' }}>
        {children}
      </span>
    );
  }
  return (
    <span style={{ ...base, background: 'var(--white)', color: 'var(--steel)', borderColor: 'var(--line)' }}>
      {children}
    </span>
  );
}

// ---------- 3. METRIC STRIP ----------
function MetricStrip({ fondo }: { fondo: any }) {
  const r = fondo.datos_mensuales.rentabilidades;
  const est = fondo.datos_mensuales.estadisticas_cartera;
  const isUSD = fondo.identificacion.moneda === 'USD';

  const metricasCartera: { label: string; value: string; help: string }[] = isUSD
    ? [
        { label: 'YTM', value: fmtPct(est.ytm_clf_pct, 1), help: 'Yield to Maturity: tasa de retorno anual esperada si mantienes los instrumentos al vencimiento.' },
        { label: 'Duration', value: `${fmtNum(est.duracion_anios)} años`, help: 'Duración modificada: sensibilidad del valor cuota ante cambios en las tasas de interés.' },
        { label: 'Volatilidad', value: fmtPct(est.volatilidad_pct, 1), help: 'Desviación estándar anualizada de la rentabilidad diaria.' },
        { label: 'Rating', value: fmtText(est.rating_promedio), help: 'Rating crediticio promedio ponderado de la cartera.' },
      ]
    : [
        { label: 'YTM', value: fmtPct(est.ytm_clf_pct, 1), help: 'Yield to Maturity en CLF: tasa real esperada si mantienes los instrumentos al vencimiento.' },
        { label: 'Volatilidad', value: fmtPct(est.volatilidad_pct, 1), help: 'Desviación estándar anualizada de la rentabilidad diaria.' },
        { label: 'Duration', value: `${fmtNum(est.duracion_anios)} años`, help: 'Duración modificada: sensibilidad del valor cuota ante cambios en las tasas de interés.' },
        { label: 'Expos. UF', value: fmtPct(est.expo_uf_pct, 1), help: 'Porcentaje de la cartera expuesto a variación de la UF (indexación a inflación).' },
      ];

  return (
    <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--line)' }}>
      <div
        className="lv-metric-strip"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
        }}
      >
        <MetricCell label="YTD 2026" value={fmtPct(r.ytd)} highlight help="Rentabilidad acumulada en lo que va del año." />
        <MetricCell label="12 Meses" value={fmtPct(r['12m'])} highlight help="Rentabilidad acumulada últimos 12 meses móviles." />
        <MetricCell label="2 Años" value={fmtPct(r['2y'])} highlight help="Rentabilidad acumulada últimos 24 meses." />
        <HintCell />
        {metricasCartera.map((m) => (
          <MetricCell key={m.label} label={m.label} value={m.value} help={m.help} />
        ))}
      </div>
    </section>
  );
}

function MetricCell({
  label,
  value,
  highlight,
  help,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  help?: string;
}) {
  return (
    <div
      className="metric-cell"
      style={{
        padding: '16px 14px',
        borderLeft: '1px solid var(--line)',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          color: 'var(--mist)',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {label}
        {help && <HelpIcon text={help} />}
      </div>
      <div
        className="num"
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: highlight ? 'var(--forest)' : 'var(--ink)',
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function HintCell() {
  return (
    <div
      className="lv-hint-cell"
      style={{
        padding: '16px 14px',
        background: 'var(--snow)',
        borderLeft: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 10.5, color: 'var(--mist)', lineHeight: 1.4 }}>
        Pasa el cursor sobre los <strong style={{ color: 'var(--forest)' }}>?</strong> para más info
      </span>
    </div>
  );
}

function HelpIcon({ text, title }: { text: string; title?: string }) {
  return (
    <span className="help-wrap" tabIndex={0}>
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'var(--forest)',
          color: 'var(--white)',
          fontSize: 9,
          fontWeight: 700,
          cursor: 'help',
          letterSpacing: 0,
        }}
      >
        ?
      </span>
      <span className="tooltip-bubble" role="tooltip">
        {title && <span className="tooltip-title">{title}</span>}
        {text}
      </span>
    </span>
  );
}

// ---------- 4. NAV TABS ----------
function NavTabs({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav
      className="lv-navtabs-desktop"
      style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--line)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {TABS.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              style={{
                padding: '14px 18px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: on ? 700 : 500,
                color: on ? 'var(--forest)' : 'var(--steel)',
                borderBottom: on ? '2px solid var(--forest)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ---------- CARD ----------
function Card({ title, children, dense }: { title?: string; children: React.ReactNode; dense?: boolean }) {
  return (
    <section
      style={{
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        boxShadow: '0 1px 2px rgba(0,0,0,.03)',
        padding: dense ? 16 : 20,
      }}
    >
      {title && (
        <h3
          style={{
            margin: 0,
            marginBottom: 14,
            fontSize: 13,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: 'var(--forest)',
            fontWeight: 700,
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

// ---------- TAB FICHA ----------
function TabFicha({ fondo }: { fondo: any }) {
  const id = fondo.identificacion;
  const dm = fondo.datos_mensuales;
  const est = dm.estadisticas_cartera;

  return (
    <div className="lv-tab-ficha-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr', gap: 16 }}>
      {/* Columna 1 */}
      <div style={{ display: 'grid', gap: 16 }}>
        <Card>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--grove)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Objetivo
          </div>
          <p style={{ margin: '0 0 14px', lineHeight: 1.6, color: 'var(--steel)', fontSize: 14 }}>{fondo.objetivo}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <HeroChip>{id.tipo_vehiculo}</HeroChip>
            <HeroChip variant="a">{id.benchmark ?? 'Sin benchmark'}</HeroChip>
            <HeroChip>Plazo {id.horizonte_minimo}</HeroChip>
            <HeroChip>Rescate {id.rescate}</HeroChip>
          </div>
        </Card>

        <Card title="Composición y estadísticas">
          <div className="lv-composicion-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              {dm.composicion?.length ? (
                <PctList data={dm.composicion} />
              ) : (
                <Placeholder>Composición por informar</Placeholder>
              )}
            </div>
            <div>
              <StatRow label="YTM" value={fmtPct(est.ytm_clf_pct, 1)} help="Tasa esperada al mantener los instrumentos al vencimiento." />
              <StatRow label="Duración" value={fmtNum(est.duracion_anios) + ' años'} help="Sensibilidad del valor cuota a movimientos de tasa." />
              <StatRow label="Volatilidad" value={fmtPct(est.volatilidad_pct, 2)} help="Desviación estándar anualizada de la rentabilidad." />
              <StatRow label="Rating promedio" value={fmtText(est.rating_promedio)} help="Rating crediticio ponderado de la cartera." />
              <StatRow label="Exposición UF" value={fmtPct(est.expo_uf_pct, 1)} help="% de la cartera indexado a UF." />
              <StatRow label="TAC" value={fmtPct(est.tac_pct, 2)} help="Costo Total Anualizado (remuneración + gastos operacionales)." />
            </div>
          </div>
        </Card>

        <Card title="Clasificación crediticia">
          {dm.clasificacion_crediticia?.length ? (
            <PctList data={dm.clasificacion_crediticia.map((c: any) => ({ nombre: c.rating, pct: c.pct }))} />
          ) : (
            <Placeholder>Clasificación crediticia por informar</Placeholder>
          )}
        </Card>
      </div>

      {/* Columna 2 */}
      <div style={{ display: 'grid', gap: 16 }}>
        <Card title="Nivel de riesgo">
          <RiesgoEscala nivel={fondo.riesgo.nivel} max={fondo.riesgo.escala_max} descripcion={fondo.riesgo.descripcion} />
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--steel)' }}>
            Plazo recomendado: <strong>{id.horizonte_minimo}</strong>
          </div>
        </Card>

        <Card title="Antecedentes">
          <DataList
            items={[
              ['Portfolio Manager', fmtText(id.portfolio_manager)],
              ['Moneda', id.moneda],
              ['RUN', id.run],
              ['Nemo DCV', fmtText(id.nemo_dcv)],
              ['Bloomberg', fmtText(id.bloomberg)],
              ['Patrimonio', fmtText(dm.patrimonio_display)],
              ['Monto mínimo', id.monto_minimo],
              ['Remuneración', fmtText(id.remuneracion)],
              ['TAC / Industria', `${fmtPct(est.tac_pct, 2)} / ${fmtPct(est.tac_industria_pct, 2)}`],
              ['Auditores', fmtText(id.auditores)],
            ]}
          />
        </Card>
      </div>

      {/* Columna 3 */}
      <div style={{ display: 'grid', gap: 16 }}>
        <Card title="Principales emisores">
          {dm.principales_emisores?.length ? (
            <PctList data={dm.principales_emisores} compact />
          ) : (
            <Placeholder>Principales emisores por informar</Placeholder>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatRow({ label, value, help }: { label: string; value: string; help?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid var(--line2)',
        fontSize: 13,
      }}
    >
      <span style={{ color: 'var(--steel)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {label}
        {help && <HelpIcon text={help} />}
      </span>
      <span className="num" style={{ fontWeight: 700, color: 'var(--forest)' }}>
        {value}
      </span>
    </div>
  );
}

function RiesgoEscala({ nivel, max, descripcion }: { nivel: number; max: number; descripcion: string }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {Array.from({ length: max }).map((_, i) => {
          const n = i + 1;
          const on = n <= nivel;
          const current = n === nivel;
          return (
            <div
              key={n}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 4,
                position: 'relative',
                background: current ? 'var(--forest)' : on ? 'var(--grove)' : 'var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: current ? '0 0 0 3px rgba(26,61,92,.15)' : 'none',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: current || on ? 'var(--white)' : 'var(--mist)',
                }}
              >
                {n}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--mist)' }}>
        <span>Menor riesgo</span>
        <span style={{ color: 'var(--forest)', fontWeight: 700 }}>
          {descripcion}
        </span>
        <span>Mayor riesgo</span>
      </div>
    </div>
  );
}

function DataList({ items }: { items: [string, string | number | null | undefined][] }) {
  return (
    <dl style={{ margin: 0, display: 'grid', rowGap: 8 }}>
      {items.map(([k, v]) => (
        <div
          key={k}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--line2)',
            paddingBottom: 6,
            fontSize: 12.5,
            gap: 10,
          }}
        >
          <dt style={{ color: 'var(--mist)', letterSpacing: '.02em' }}>{k}</dt>
          <dd
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontWeight: 600,
              textAlign: 'right',
              maxWidth: '70%',
              fontFamily: typeof v === 'number' ? 'var(--font-num), system-ui, sans-serif' : undefined,
            }}
          >
            {v === null || v === undefined || v === '' ? '—' : String(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PctList({
  data,
  compact,
}: {
  data: { nombre: string; pct: number }[];
  compact?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.pct), 1);
  return (
    <div style={{ display: 'grid', rowGap: compact ? 8 : 10 }}>
      {data.map((d) => (
        <div key={d.nombre}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: compact ? 12 : 13, marginBottom: 4 }}>
            <span style={{ color: 'var(--steel)' }}>{d.nombre}</span>
            <span className="num" style={{ fontWeight: 700, color: 'var(--forest)' }}>
              {fmtPct(d.pct)}
            </span>
          </div>
          <div style={{ height: compact ? 5 : 7, background: 'var(--line2)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(d.pct / max) * 100}%`,
                background: 'linear-gradient(90deg, var(--leaf), var(--grove))',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 20,
        textAlign: 'center',
        color: 'var(--mist)',
        background: 'var(--line2)',
        borderRadius: 8,
        fontSize: 12.5,
      }}
    >
      {children}
    </div>
  );
}

// ---------- TAB RENTABILIDAD ----------
type ModoRent = 'nominal' | 'real' | 'comparacion';

function TabRentabilidad({
  fondo,
  ipcMensual,
  forestHex,
  mintHex,
}: {
  fondo: any;
  ipcMensual: SerieMensual;
  forestHex: string;
  mintHex: string;
}) {
  const hist = fondo.rentabilidades_historicas as SerieMensual;
  const years = Object.keys(hist).sort();
  const [modo, setModo] = useState<ModoRent>('nominal');
  const isUSD = fondo.identificacion.moneda === 'USD';

  const base = useMemo(() => buildBase100(hist, ipcMensual), [hist, ipcMensual]);
  const rentReal12m = useMemo(() => rentAcumuladaReal(12, hist, ipcMensual), [hist, ipcMensual]);
  const rentNominal12m = fondo.datos_mensuales.rentabilidades['12m'];
  const r = fondo.datos_mensuales.rentabilidades;

  const datasets = useMemo(() => {
    if (modo === 'nominal')
      return [{ label: `${fondo.identificacion.nombre_corto} (nominal)`, data: base.nominal, color: forestHex }];
    if (modo === 'real')
      return [
        { label: `${fondo.identificacion.nombre_corto} (nominal)`, data: base.nominal, color: forestHex },
        { label: `Real (desc. IPC)`, data: base.real, color: mintHex, dashed: true },
      ];
    // comparación
    return [
      { label: `Nominal`, data: base.nominal, color: forestHex },
      { label: `Real (desc. IPC)`, data: base.real, color: mintHex },
    ];
  }, [modo, base, forestHex, mintHex, fondo.identificacion.nombre_corto]);

  const flatMonths = useMemo(() => {
    const arr: { label: string; v: number }[] = [];
    for (const y of years) {
      for (const m of MESES) {
        const v = hist[y]?.[m];
        if (v !== null && v !== undefined) arr.push({ label: `${m} ${y.slice(2)}`, v });
      }
    }
    return arr;
  }, [hist, years]);
  const best = [...flatMonths].sort((a, b) => b.v - a.v).slice(0, 5);
  const worst = [...flatMonths].sort((a, b) => a.v - b.v).slice(0, 5);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* KPIs */}
      <div className="lv-rent-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        <KpiBig highlight label="YTD" value={fmtPct(r.ytd)} />
        <Kpi label="1 Mes" value={fmtPct(r['1m'])} />
        <Kpi label="3 Meses" value={fmtPct(r['3m'])} />
        <Kpi label="6 Meses" value={fmtPct(r['6m'])} />
        <Kpi label="12 Meses" value={fmtPct(r['12m'])} />
        <Kpi label="2 Años" value={fmtPct(r['2y'])} />
      </div>

      {/* Gráficos */}
      <div className="lv-rent-charts" style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: 16 }}>
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 13,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'var(--forest)',
                fontWeight: 700,
              }}
            >
              Evolución base 100
            </h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {(
                [
                  { k: 'nominal', l: 'Nominal' },
                  { k: 'real', l: 'Real (IPC)' },
                  { k: 'comparacion', l: 'Comparación fondos' },
                ] as { k: ModoRent; l: string }[]
              ).map(({ k, l }) => {
                const on = modo === k;
                return (
                  <button
                    key={k}
                    onClick={() => setModo(k)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--forest)',
                      background: on ? 'var(--forest)' : 'var(--white)',
                      color: on ? 'var(--white)' : 'var(--forest)',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {isUSD && modo === 'real' && (
            <div
              style={{
                padding: 10,
                background: 'var(--amber-bg)',
                border: '1px solid #FDE68A',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--amber)',
                marginBottom: 10,
              }}
            >
              Fondo USD. La rentabilidad real referencial usa IPC chileno; para análisis dollar-neutral debe usar CPI EE.UU.
            </div>
          )}

          <LineChart labels={base.labels} datasets={datasets} height={280} className="chart-base100" />

          {modo !== 'nominal' && (
            <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--mist)', lineHeight: 1.5 }}>
              Fórmula: rReal = (1 + rNominal) / (1 + IPCmes) − 1. Fuente IPC: INE Chile. 12M nominal:{' '}
              <strong style={{ color: colorByValue(rentNominal12m) }}>{fmtPct(rentNominal12m)}</strong> · 12M real:{' '}
              <strong style={{ color: colorByValue(rentReal12m) }}>{fmtPct(rentReal12m)}</strong>
            </div>
          )}
        </Card>

        <Card title="Mejores y peores meses">
          <BarBestWorst best={best} worst={worst} />
        </Card>
      </div>

      <Card title="Rentabilidad mensual histórica (%)">
        <TablaMensual hist={hist} years={years} />
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        padding: '10px 12px',
      }}
    >
      <div
        style={{ fontSize: 10.5, color: 'var(--mist)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}
      >
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
        {value}
      </div>
    </div>
  );
}

function KpiBig({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? 'var(--forest)' : 'var(--white)',
        border: '1px solid var(--forest)',
        borderRadius: 8,
        padding: '10px 12px',
        color: highlight ? 'var(--white)' : 'var(--ink)',
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          color: highlight ? 'rgba(255,255,255,.8)' : 'var(--mist)',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

function BarBestWorst({
  best,
  worst,
}: {
  best: { label: string; v: number }[];
  worst: { label: string; v: number }[];
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const labels = [...best.map((b) => b.label), ...worst.map((b) => b.label)];
    const values = [...best.map((b) => b.v), ...worst.map((b) => b.v)];
    const colors = values.map((v) => (v >= 0 ? '#15803D' : '#B91C1C'));
    const config: ChartConfiguration = {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Rent. %', data: values, backgroundColor: colors, borderRadius: 4 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1C2333', titleColor: '#7FB3D3', bodyColor: '#fff' },
        },
        scales: {
          x: { grid: { color: '#F3F4F6' }, ticks: { font: { family: 'Nunito' }, callback: (v) => `${v}%` } },
          y: { grid: { display: false }, ticks: { font: { family: 'Nunito Sans', size: 10 } } },
        },
      },
    };
    chartRef.current = new Chart(ref.current, config);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [best, worst]);
  return (
    <div className="chart-bestworst" style={{ position: 'relative', height: 280 }}>
      <canvas ref={ref} />
    </div>
  );
}

function TablaMensual({ hist, years }: { hist: SerieMensual; years: string[] }) {
  const lastYear = years[years.length - 1];
  return (
    <div className="lv-rent-tabla" style={{ overflowX: 'auto' }}>
      <table className="num" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: 'var(--forest)', color: 'var(--white)' }}>
            <th style={{ padding: '10px 8px', textAlign: 'left' }}>Año</th>
            {MESES_LABEL.map((m) => (
              <th key={m} style={{ padding: '10px 6px' }}>
                {m}
              </th>
            ))}
            <th style={{ padding: '10px 8px', borderLeft: '1px solid rgba(255,255,255,.25)' }}>Anual</th>
          </tr>
        </thead>
        <tbody>
          {years.map((y) => {
            const highlight = y === lastYear;
            return (
              <tr key={y} style={{ background: highlight ? 'var(--pale)' : 'transparent' }}>
                <td
                  style={{
                    padding: '8px',
                    fontWeight: 700,
                    color: 'var(--forest)',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  {y}
                </td>
                {MESES.map((m) => {
                  const v = hist[y]?.[m];
                  const c = v === null || v === undefined ? 'var(--mist)' : v < 0 ? 'var(--red)' : '#15803D';
                  return (
                    <td
                      key={m}
                      style={{ padding: '8px 6px', textAlign: 'right', color: c, borderBottom: '1px solid var(--line)' }}
                    >
                      {fmtNum(v)}
                    </td>
                  );
                })}
                <td
                  style={{
                    padding: '8px',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: colorByValue(hist[y]?.anual),
                    borderBottom: '1px solid var(--line)',
                    borderLeft: '1px solid var(--line)',
                  }}
                >
                  {fmtNum(hist[y]?.anual)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------- TAB COMPARADOR ----------
function TabComparador({ fondo, forestHex }: { fondo: any; forestHex: string }) {
  const r = fondo.datos_mensuales.rentabilidades;
  const comps = (fondo.comparadores_simulador ?? []) as { nombre: string; rent_anual_ref_pct: number; color: string }[];

  const ejes = ['Liquidez', 'Retorno 12M', 'Riesgo Bajo', 'Cobertura IPC', 'Rescate', 'Costo TAC'];
  const datasetFondo = [
    90,
    r['12m'] ?? 0,
    (7 - fondo.riesgo.nivel) * 14,
    fondo.datos_mensuales.estadisticas_cartera?.expo_uf_pct ?? 40,
    80,
    100 - (fondo.datos_mensuales.estadisticas_cartera?.tac_pct ?? 1) * 20,
  ];
  const datasetsComps = comps.map((c) => ({
    label: c.nombre,
    data: [70, c.rent_anual_ref_pct, 60, 30, 70, 60],
    color: c.color,
  }));

  const comparadorHref = `/comparador?fondos=${[fondo._id, ...comps.map((c) => c.nombre.toLowerCase().replace(/\s+/g, '-'))]
    .slice(0, 3)
    .join(',')}`;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div
        style={{
          background: 'var(--pale)',
          border: '1px solid rgba(26,61,92,.18)',
          borderRadius: 8,
          padding: 14,
          fontSize: 13,
          color: 'var(--forest)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 16 }}>ℹ</span>
        El perfil multifactor compara este fondo con sus pares habituales. Datos referenciales a modo de posicionamiento.
      </div>

      <div className="lv-comp-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Perfil por dimensión">
          <RadarChart
            labels={ejes}
            datasets={[
              { label: fondo.identificacion.nombre_corto, data: datasetFondo, color: forestHex },
              ...datasetsComps,
            ]}
            height={320}
            className="chart-radar"
          />
        </Card>

        <Card title="Rentabilidad acumulada (ref)">
          <LineChart
            labels={['0', '6M', '12M', '24M']}
            datasets={[
              {
                label: fondo.identificacion.nombre_corto,
                data: [100, 100 + (r['6m'] ?? 0), 100 + (r['12m'] ?? 0), 100 + (r['2y'] ?? 0)],
                color: forestHex,
              },
              ...comps.map((c) => ({
                label: c.nombre,
                data: [
                  100,
                  100 + c.rent_anual_ref_pct * 0.5,
                  100 + c.rent_anual_ref_pct,
                  100 + c.rent_anual_ref_pct * 2,
                ],
                color: c.color,
              })),
            ]}
            height={320}
            className="chart-cmp-line"
          />
        </Card>
      </div>

      <Card title="Comparativa lado a lado">
        <div className="lv-comp-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--mist)', fontSize: 11 }}></th>
                <th style={{ padding: '10px 12px', background: 'var(--forest)', color: 'var(--white)', textAlign: 'right' }}>
                  {fondo.identificacion.nombre_corto}
                </th>
                {comps.map((c, i) => (
                  <th
                    key={c.nombre}
                    style={{
                      padding: '10px 12px',
                      background: i === 0 ? '#374151' : '#1C2333',
                      color: 'var(--white)',
                      textAlign: 'right',
                    }}
                  >
                    {c.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SectionRow label="Perfil" span={1 + comps.length} />
              <RowComp label="Categoría">
                <td style={cellStyle()}>{fondo._categoria_display}</td>
                {comps.map((c) => (
                  <td key={c.nombre} style={cellStyle()}>
                    —
                  </td>
                ))}
              </RowComp>
              <RowComp label="Riesgo">
                <td style={cellStyle()}>
                  {fondo.riesgo.nivel}/{fondo.riesgo.escala_max} · {fondo.riesgo.descripcion}
                </td>
                {comps.map((c) => (
                  <td key={c.nombre} style={cellStyle()}>
                    —
                  </td>
                ))}
              </RowComp>
              <RowComp label="Moneda">
                <td style={cellStyle()}>{fondo.identificacion.moneda}</td>
                {comps.map((c) => (
                  <td key={c.nombre} style={cellStyle()}>
                    —
                  </td>
                ))}
              </RowComp>

              <SectionRow label="Rentabilidad" span={1 + comps.length} />
              <RowComp label="12 Meses">
                <td style={cellStyle()}>{fmtPct(r['12m'])}</td>
                {comps.map((c) => (
                  <td key={c.nombre} style={cellStyle()}>
                    {fmtPct(c.rent_anual_ref_pct)}
                  </td>
                ))}
              </RowComp>

              <SectionRow label="Costos y riesgo" span={1 + comps.length} />
              <RowComp label="TAC">
                <td style={cellStyle()}>{fmtPct(fondo.datos_mensuales.estadisticas_cartera.tac_pct, 2)}</td>
                {comps.map((c) => (
                  <td key={c.nombre} style={cellStyle()}>
                    —
                  </td>
                ))}
              </RowComp>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, textAlign: 'right' }}>
          <Link
            href={comparadorHref}
            style={{
              display: 'inline-block',
              padding: '10px 18px',
              background: 'var(--forest)',
              color: 'var(--white)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Comparar en dashboard →
          </Link>
        </div>
      </Card>
    </div>
  );
}

function SectionRow({ label, span }: { label: string; span: number }) {
  return (
    <tr style={{ background: 'var(--snow)' }}>
      <td
        colSpan={span + 1}
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
        {label}
      </td>
    </tr>
  );
}

function RowComp({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--line2)' }}>
      <td style={{ padding: '8px 12px', color: 'var(--steel)', fontWeight: 500 }}>{label}</td>
      {children}
    </tr>
  );
}
function cellStyle(): CSSProperties {
  return {
    padding: '8px 12px',
    textAlign: 'right',
    fontFamily: 'var(--font-num), system-ui, sans-serif',
    fontWeight: 600,
    color: 'var(--ink)',
  };
}

// ---------- TAB SIMULADOR ----------
function TabSimulador({
  fondo,
  forestHex,
  ipcMensual,
}: {
  fondo: any;
  forestHex: string;
  ipcMensual: SerieMensual;
}) {
  const ref12 = fondo.datos_mensuales.rentabilidades['12m'] ?? 0;
  // IPC 12M se lee directamente del JSON (_meta.ipc_mensual.datos[anio].ultimos_12m).
  // Fuente: SII Chile / INE. Valor oficial marzo 2026: 2.8%.
  const ipc12 = useMemo(() => {
    const years = Object.keys(ipcMensual).sort();
    const latestYear = years[years.length - 1];
    const latest = ipcMensual[latestYear] as any;
    const fromJson = latest?.ultimos_12m;
    if (typeof fromJson === 'number') return fromJson;
    return 2.8;
  }, [ipcMensual]);

  const [monto, setMonto] = useState(1_000_000);
  const [horizonte, setHorizonte] = useState(12);
  const [tasa, setTasa] = useState(Number(ref12.toFixed(2)));
  const [ipcInput, setIpcInput] = useState(Number(ipc12.toFixed(1)));

  const proyeccion = useMemo(() => {
    const labels: string[] = [];
    const serie: number[] = [];
    const comps = (fondo.comparadores_simulador ?? []).map((c: any) => ({ ...c, data: [] as number[] }));
    for (let mo = 0; mo <= horizonte; mo++) {
      labels.push(`M${mo}`);
      const factor = Math.pow(1 + tasa / 100, mo / 12);
      serie.push(Math.round(monto * factor));
      for (const c of comps) {
        const f2 = Math.pow(1 + c.rent_anual_ref_pct / 100, mo / 12);
        c.data.push(Math.round(monto * f2));
      }
    }
    return { labels, serie, comps };
  }, [monto, horizonte, tasa, fondo]);

  const final = proyeccion.serie[proyeccion.serie.length - 1] ?? monto;
  const gananciaNominal = final - monto;
  const finalReal = monto * Math.pow((1 + tasa / 100) / (1 + ipcInput / 100), horizonte / 12);
  const gananciaReal = finalReal - monto;
  const simbolo = fondo.identificacion.moneda === 'USD' ? 'USD ' : '$';

  return (
    <div className="lv-sim-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
      <Card title="Parámetros">
        <label style={{ display: 'block', fontSize: 11, color: 'var(--mist)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
          Monto inicial
        </label>
        <input
          type="text"
          value={nf0.format(monto)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/\D/g, ''));
            if (!Number.isNaN(n)) setMonto(n);
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--line)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'var(--font-num), system-ui, sans-serif',
            marginBottom: 14,
          }}
        />
        <SliderField
          label="Horizonte (meses)"
          value={horizonte}
          min={3}
          max={36}
          step={1}
          onChange={setHorizonte}
          display={`${horizonte} meses`}
        />
        <SliderField
          label="Rent. anual esperada"
          value={tasa}
          min={0}
          max={20}
          step={0.1}
          onChange={setTasa}
          display={`${tasa.toFixed(1)}%`}
        />
        <SliderField
          label="IPC estimado anual"
          value={ipcInput}
          min={0}
          max={10}
          step={0.1}
          onChange={setIpcInput}
          display={`${ipcInput.toFixed(1)}%`}
        />
        <button
          onClick={() => {
            /* recompute is automatic */
          }}
          className="lv-sim-calcular lv-btn-touch"
          style={{
            marginTop: 8,
            width: '100%',
            padding: '10px 14px',
            background: 'var(--forest)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Calcular proyección
        </button>
      </Card>

      <div style={{ display: 'grid', gap: 16 }}>
        <Card>
          <div className="lv-sim-resultados" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <ResultadoBox
              label="Capital final"
              value={`${simbolo}${nf0.format(final)}`}
              color="var(--forest)"
              bg="var(--pale)"
            />
            <ResultadoBox
              label="Ganancia nominal"
              value={`${gananciaNominal >= 0 ? '+' : ''}${simbolo}${nf0.format(gananciaNominal)}`}
              color={colorByValue(gananciaNominal)}
              bg="var(--snow)"
            />
            <ResultadoBox
              label="Ganancia real (desc. IPC)"
              value={`${gananciaReal >= 0 ? '+' : ''}${simbolo}${nf0.format(Math.round(gananciaReal))}`}
              color={colorByValue(gananciaReal)}
              bg="var(--snow)"
            />
          </div>

          <div style={{ marginTop: 14, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: 'var(--line2)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Vehículo</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rent. anual ref.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Capital final</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Ganancia</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'var(--pale)', fontWeight: 700 }}>
                  <td style={{ padding: '8px 10px', color: 'var(--forest)' }}>{fondo.identificacion.nombre_corto}</td>
                  <td style={cellStyle()}>{fmtPct(tasa, 1)}</td>
                  <td style={cellStyle()}>
                    {simbolo}
                    {nf0.format(final)}
                  </td>
                  <td style={cellStyle()}>
                    {simbolo}
                    {nf0.format(gananciaNominal)}
                  </td>
                </tr>
                {proyeccion.comps.map((c: any) => {
                  const cap = c.data[c.data.length - 1];
                  return (
                    <tr key={c.nombre} style={{ borderBottom: '1px solid var(--line2)' }}>
                      <td style={{ padding: '8px 10px', color: c.color, fontWeight: 600 }}>{c.nombre}</td>
                      <td style={cellStyle()}>{fmtPct(c.rent_anual_ref_pct, 1)}</td>
                      <td style={cellStyle()}>
                        {simbolo}
                        {nf0.format(cap)}
                      </td>
                      <td style={cellStyle()}>
                        {simbolo}
                        {nf0.format(cap - monto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Proyección">
          <LineChart
            labels={proyeccion.labels}
            datasets={[
              { label: fondo.identificacion.nombre_corto, data: proyeccion.serie, color: forestHex },
              ...proyeccion.comps.map((c: any) => ({ label: c.nombre, data: c.data, color: c.color })),
            ]}
            height={260}
            moneyFormat
            currencySymbol={simbolo}
            className="chart-sim-proj"
          />
        </Card>
      </div>
    </div>
  );
}

function ResultadoBox({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div style={{ padding: 14, background: bg, borderRadius: 10, border: '1px solid var(--line)' }}>
      <div style={{ fontSize: 11, color: 'var(--mist)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 20, fontWeight: 700, color, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  display: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--mist)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </span>
        <span className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--forest)' }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--grove)' }}
      />
    </div>
  );
}

// ---------- TAB TRIBUTARIO ----------
function TabTributario({ fondo }: { fondo: any }) {
  const t = fondo.tributario;
  const badges: { k: string; label: string }[] = [
    { k: 'apv', label: 'APV' },
    { k: 'apvc', label: 'APVC' },
    { k: 'art57', label: 'Art. 57' },
    { k: 'art107', label: 'Art. 107' },
    { k: 'art108', label: 'Art. 108' },
  ];

  const arts: { k: 'art57' | 'art107' | 'art108'; title: string; desc: string }[] = [
    { k: 'art57', title: 'Artículo 57 bis', desc: 'Beneficio tributario transitorio para rentas del fondo (régimen de impuesto a la renta).' },
    { k: 'art107', title: 'Artículo 107 LIR', desc: 'Exención al mayor valor en enajenación de cuotas con presencia bursátil.' },
    { k: 'art108', title: 'Artículo 108 LIR', desc: 'Liberación del impuesto a los dividendos recibidos desde fondos chilenos.' },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card title="Beneficios tributarios disponibles">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {badges.map((b) => {
            const active = !!t[b.k];
            return (
              <span
                key={b.k}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  background: active ? 'var(--forest)' : 'var(--white)',
                  color: active ? 'var(--white)' : 'var(--mist)',
                  border: active ? '1px solid var(--forest)' : '1px dashed var(--line)',
                }}
              >
                {active ? '✓' : '—'} {b.label}
              </span>
            );
          })}
        </div>
      </Card>

      <div className="lv-trib-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {arts.map((a) => {
          const active = !!t[a.k];
          return (
            <div
              key={a.k}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: active ? 'var(--forest)' : 'var(--line2)',
                  color: active ? 'var(--white)' : 'var(--mist)',
                  padding: '10px 14px',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '.04em',
                }}
              >
                {a.title} · {active ? 'Aplica' : 'No aplica'}
              </div>
              <div style={{ padding: 14, fontSize: 13, color: 'var(--steel)', lineHeight: 1.5 }}>{a.desc}</div>
            </div>
          );
        })}
      </div>

      <Card title="APV / APVC">
        <p style={{ margin: 0, fontSize: 13, color: 'var(--steel)', lineHeight: 1.6 }}>
          {t.apv
            ? 'Este fondo es elegible para APV (Régimen A: beneficio tributario al momento del retiro; Régimen B: rebaja inmediata de impuesto sobre el ingreso aportado).'
            : 'Este fondo NO está calificado para APV actualmente.'}{' '}
          {t.apvc
            ? 'También es elegible para APV Colectivo (APVC) a través del empleador.'
            : 'No cuenta con APVC.'}
        </p>
      </Card>

      <p style={{ fontSize: 11.5, color: 'var(--mist)', textAlign: 'center', marginTop: 4 }}>
        Nota legal: La información tributaria es referencial. Consulte con su asesor para su situación particular.
      </p>
    </div>
  );
}

// ---------- TAB GUIA ----------
function TabGuia({ fondo }: { fondo: any }) {
  type Horiz = 'corto' | 'mediano' | 'largo' | 'mixto';
  const [h, setH] = useState<Horiz>('corto');
  const forest = FOREST_HEX[fondo._paleta] ?? '#1A3D2B';
  const allocations: Record<Horiz, { label: string; pct: number; color: string }[]> = {
    corto: [
      { label: fondo.identificacion.nombre_corto, pct: 70, color: forest },
      { label: 'Money Market', pct: 20, color: '#4A5568' },
      { label: 'Liquidez', pct: 10, color: '#9CA3AF' },
    ],
    mediano: [
      { label: fondo.identificacion.nombre_corto, pct: 40, color: forest },
      { label: 'Renta Fija UF', pct: 40, color: '#1A3D2B' },
      { label: 'RV Global', pct: 20, color: '#2D1A5C' },
    ],
    largo: [
      { label: fondo.identificacion.nombre_corto, pct: 15, color: forest },
      { label: 'Renta Fija UF', pct: 35, color: '#1A3D2B' },
      { label: 'RV Global', pct: 50, color: '#2D1A5C' },
    ],
    mixto: [
      { label: fondo.identificacion.nombre_corto, pct: 30, color: forest },
      { label: 'RF UF', pct: 30, color: '#1A3D2B' },
      { label: 'RV Chile', pct: 20, color: '#B91C1C' },
      { label: 'RV Global', pct: 20, color: '#2D1A5C' },
    ],
  };

  const mensajesPorTipo = (() => {
    const base = [
      { icon: '🛡', title: 'Preservación', text: 'Protege capital ante volatilidad; ideal para fondo de reserva.' },
      { icon: '📈', title: 'Devengo', text: 'Genera retorno por carry de cupones, no dependiendo de movimientos de mercado.' },
      { icon: '💧', title: 'Liquidez', text: `Rescate ${fondo.identificacion.rescate}: acceso rápido en caso de necesidad.` },
      { icon: '⚖️', title: 'Diversificación', text: 'Múltiples emisores bancarios/corporativos con rating promedio alto.' },
    ];
    return base;
  })();

  const horBtns: { k: Horiz; label: string; icon: string }[] = [
    { k: 'corto', label: 'Corto plazo', icon: '🛡' },
    { k: 'mediano', label: 'Mediano plazo', icon: '⚖' },
    { k: 'largo', label: 'Largo plazo', icon: '🚀' },
    { k: 'mixto', label: 'Mixto', icon: '💡' },
  ];

  return (
    <div className="lv-guia-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
      <Card title="Selecciona tu horizonte">
        <div className="lv-guia-horiz" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {horBtns.map((b) => {
            const on = h === b.k;
            return (
              <button
                key={b.k}
                onClick={() => setH(b.k)}
                style={{
                  padding: '14px 12px',
                  background: on ? 'var(--forest)' : 'var(--white)',
                  color: on ? 'var(--white)' : 'var(--forest)',
                  border: '1px solid var(--forest)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 22 }}>{b.icon}</span>
                {b.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', height: 36, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
          {allocations[h].map((a) => (
            <div key={a.label} title={`${a.label}: ${a.pct}%`} style={{ width: `${a.pct}%`, background: a.color }} />
          ))}
        </div>
        <div style={{ display: 'grid', rowGap: 6 }}>
          {allocations[h].map((a) => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ width: 12, height: 12, background: a.color, borderRadius: 3 }} />
              <span style={{ flex: 1 }}>{a.label}</span>
              <span className="num" style={{ fontWeight: 700, color: 'var(--forest)' }}>
                {a.pct}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gap: 12 }}>
        {mensajesPorTipo.map((m) => (
          <div
            key={m.title}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ fontSize: 26, lineHeight: 1 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--forest)', marginBottom: 2 }}>{m.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--steel)', lineHeight: 1.5 }}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- TAB SERIES ----------
function TabSeries({ fondo }: { fondo: any }) {
  const series = (fondo.series ?? []) as {
    serie: string;
    remuneracion_pct: number | null;
    tac_pct: number | null;
    apv: boolean;
    monto_minimo?: string;
  }[];
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card title="Series disponibles">
        <div className="lv-series-tabla" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--forest)', color: 'var(--white)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Serie</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Remuneración</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>TAC</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>APV</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monto mínimo</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>IVA</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Rescate</th>
              </tr>
            </thead>
            <tbody>
              {series.map((s) => (
                <tr key={s.serie} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--forest)' }}>{s.serie}</td>
                  <td style={cellStyle()}>{fmtPct(s.remuneracion_pct)}</td>
                  <td style={cellStyle()}>{fmtPct(s.tac_pct)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{s.apv ? '✓' : '—'}</td>
                  <td style={cellStyle()}>{s.monto_minimo ?? fondo.identificacion.monto_minimo}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--steel)' }}>Incluido</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--steel)' }}>
                    {fondo.identificacion.rescate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p style={{ fontSize: 12, color: 'var(--mist)', textAlign: 'center' }}>
        Las series se diferencian por monto mínimo, comisión de administración y elegibilidad tributaria. La serie de
        referencia es <strong>{fondo.identificacion.serie_referencia}</strong>.
      </p>
    </div>
  );
}

// ---------- FOOTER ----------
function Footer({ fondo }: { fondo: any }) {
  return (
    <footer style={{ background: 'var(--snow)', borderTop: '1px solid var(--line)' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 11.5,
          color: 'var(--mist)',
        }}
      >
        <div style={{ maxWidth: 720, lineHeight: 1.5 }}>
          Rentabilidad pasada no garantiza resultados futuros. Datos a {fondo.datos_mensuales.periodo}. Información
          institucional sujeta al reglamento interno del fondo.
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <Link href="/" style={{ color: 'var(--forest)' }}>
            Índice
          </Link>
          <Link href="/comparador" style={{ color: 'var(--forest)' }}>
            Comparador
          </Link>
          <span style={{ color: 'var(--mist)' }}>LarrainVial AM</span>
        </div>
      </div>
    </footer>
  );
}

// ---------- Chart.js wrappers ----------
function LineChart({
  labels,
  datasets,
  height,
  moneyFormat,
  currencySymbol,
  className,
}: {
  labels: string[];
  datasets: { label: string; data: number[]; color: string; dashed?: boolean }[];
  height: number;
  moneyFormat?: boolean;
  currencySymbol?: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const sym = currencySymbol ?? '$';

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
          borderDash: d.dashed ? [6, 6] : undefined,
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
          tooltip: {
            backgroundColor: '#1A2535',
            titleColor: '#7FB3D3',
            bodyColor: '#fff',
            borderColor: '#7FB3D3',
            borderWidth: 1,
            callbacks: moneyFormat
              ? { label: (ctx) => ` ${ctx.dataset.label}: ${sym}${nf0.format(Number(ctx.parsed.y))}` }
              : undefined,
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { family: 'Nunito Sans' } } },
          y: {
            grid: { color: '#F3F4F6' },
            ticks: {
              font: { family: 'Nunito' },
              callback: (v) => (moneyFormat ? `${sym}${nf0.format(Number(v))}` : String(v)),
            },
          },
        },
      },
    };
    chartRef.current = new Chart(ref.current, config);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, datasets, moneyFormat, sym]);

  return (
    <div className={className} style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

function RadarChart({
  labels,
  datasets,
  height,
  className,
}: {
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
  height: number;
  className?: string;
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
    <div className={className} style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}
