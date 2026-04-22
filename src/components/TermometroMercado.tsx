'use client';

import { useEffect, useState } from 'react';

interface Mercado {
  tpm: number;
  tpm_tendencia: 'baja' | 'estable' | 'alza';
  uf_hoy: number;
  ipc_12m: number;
  fecha: string;
  fuente: string;
}

type Semaforo = { color: string; emoji: string; label: string; texto: string };

const nfUF = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function evaluarSemaforo(fondoId: string, d: Mercado): Semaforo {
  // Monetario: depende del nivel de TPM (alta = mejor rendimiento corto plazo)
  if (fondoId === 'monetario') {
    if (d.tpm < 3) {
      return {
        color: '#B91C1C',
        emoji: '🔴',
        label: 'DESAFIANTE',
        texto: 'TPM muy baja reduce el rendimiento esperado de los instrumentos de corto plazo.',
      };
    }
    if (d.tpm_tendencia === 'estable') {
      return {
        color: '#B45309',
        emoji: '🟡',
        label: 'NEUTRO',
        texto: 'TPM estable mantiene el retorno esperado en rangos normales para el tramo corto.',
      };
    }
    return {
      color: '#15803D',
      emoji: '🟢',
      label: 'FAVORABLE',
      texto: 'TPM elevada beneficia el retorno en instrumentos de corto plazo.',
    };
  }

  // Ahorro a Plazo / Ahorro Capital (RF UF/CLP)
  if (d.tpm_tendencia === 'alza' || d.ipc_12m > 5) {
    return {
      color: '#B91C1C',
      emoji: '🔴',
      label: 'DESAFIANTE',
      texto: 'Alza de tasas o inflación elevada puede presionar valorizaciones de bonos.',
    };
  }
  if (d.tpm_tendencia === 'baja' && d.ipc_12m < 4) {
    return {
      color: '#15803D',
      emoji: '🟢',
      label: 'FAVORABLE',
      texto: 'Entorno de baja de tasas favorece la valorización de bonos UF de mayor duración.',
    };
  }
  return {
    color: '#B45309',
    emoji: '🟡',
    label: 'NEUTRO',
    texto: 'Entorno estable. El devengo sigue siendo el principal motor del retorno.',
  };
}

export default function TermometroMercado({ fondoId }: { fondoId: string }) {
  const [data, setData] = useState<Mercado | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/mercado')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return null; // silencioso

  return (
    <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--line)' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '12px 28px',
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--mist)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Entorno de Mercado
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--mist)' }}>
            {data ? `Dato al ${data.fecha} · ${data.fuente}` : 'Cargando…'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {data ? (
            <>
              <Indicador
                icon="📊"
                label="TPM"
                value={`${data.tpm.toFixed(2)}%`}
                arrow={data.tpm_tendencia === 'baja' ? '↓' : data.tpm_tendencia === 'alza' ? '↑' : '→'}
                color={data.tpm_tendencia === 'baja' ? '#15803D' : data.tpm_tendencia === 'alza' ? '#B91C1C' : '#B45309'}
              />
              <Indicador icon="📈" label="UF hoy" value={nfUF.format(data.uf_hoy)} />
              <Indicador icon="🌡" label="IPC 12M" value={`${data.ipc_12m.toFixed(1)}%`} />
            </>
          ) : (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          )}
        </div>

        {data && <Semaforo sem={evaluarSemaforo(fondoId, data)} />}
      </div>

      {data && (
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 28px 10px',
            fontSize: 12,
            color: 'var(--mist)',
            lineHeight: 1.4,
          }}
        >
          {evaluarSemaforo(fondoId, data).texto}
        </div>
      )}
    </section>
  );
}

function Indicador({
  icon,
  label,
  value,
  arrow,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  arrow?: string;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </span>
      <span className="num" style={{ fontSize: 14, fontWeight: 700, color: color ?? 'var(--ink)' }}>
        {value}
        {arrow && <span style={{ marginLeft: 4 }}>{arrow}</span>}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div
      aria-hidden
      style={{
        width: 84,
        height: 20,
        background: 'linear-gradient(90deg, var(--line2), var(--line), var(--line2))',
        borderRadius: 4,
        animation: 'none',
      }}
    />
  );
}

function Semaforo({ sem }: { sem: { color: string; emoji: string; label: string; texto: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: sem.color,
          boxShadow: `0 0 0 4px ${sem.color}25`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}
      >
        {sem.emoji}
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: 'var(--mist)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
          Semáforo
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: sem.color }}>{sem.label}</div>
      </div>
    </div>
  );
}
