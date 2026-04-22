'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { checkPassword, isSessionValid, setSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión válida, redirige al índice
  useEffect(() => {
    if (isSessionValid()) router.replace('/');
  }, [router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (checkPassword(pwd)) {
      setSession();
      router.replace('/');
    } else {
      setError('Clave de acceso incorrecta.');
      setLoading(false);
    }
  };

  return (
    <div
      className="lv-login-shell"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--snow), var(--pale))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="lv-login-card"
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: '40px 32px',
          boxShadow: '0 12px 40px rgba(17, 24, 39, .08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              fontFamily: 'var(--font-display), serif',
              fontSize: 28,
              color: 'var(--forest)',
              fontWeight: 700,
              letterSpacing: '.02em',
            }}
          >
            LarrainVial
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '.18em',
              color: 'var(--mist)',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            Asset Management
          </div>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 18,
            color: 'var(--ink)',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Portal institucional FFMM
        </h1>
        <p
          style={{
            margin: '6px 0 28px',
            fontSize: 13,
            color: 'var(--mist)',
            textAlign: 'center',
          }}
        >
          Ingresa la clave de acceso para continuar
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="pwd"
            style={{
              display: 'block',
              fontSize: 11.5,
              color: 'var(--steel)',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Clave de acceso
          </label>
          <input
            id="pwd"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={pwd}
            onChange={(e) => {
              setPwd(e.target.value);
              if (error) setError(null);
            }}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: error ? '1px solid var(--red)' : '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 15,
              background: 'var(--white)',
              color: 'var(--ink)',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 10,
                padding: '8px 12px',
                background: 'var(--red-bg)',
                color: 'var(--red)',
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pwd}
            style={{
              marginTop: 18,
              width: '100%',
              padding: '12px 14px',
              background: 'var(--forest)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading || !pwd ? 'not-allowed' : 'pointer',
              opacity: loading || !pwd ? 0.6 : 1,
              fontFamily: 'inherit',
              letterSpacing: '.02em',
            }}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p
          style={{
            marginTop: 22,
            textAlign: 'center',
            fontSize: 11.5,
            color: 'var(--fog)',
          }}
        >
          Acceso restringido · Información institucional
        </p>
      </div>
    </div>
  );
}
