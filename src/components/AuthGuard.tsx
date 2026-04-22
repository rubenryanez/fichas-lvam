'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, isSessionValid } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSessionValid()) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--snow)',
          color: 'var(--mist)',
          fontSize: 14,
        }}
      >
        Verificando sesión…
      </div>
    );
  }

  return (
    <>
      {children}
      <LogoutButton />
    </>
  );
}

function LogoutButton() {
  const router = useRouter();
  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };
  return (
    <button
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        padding: '8px 14px',
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 999,
        fontSize: 12,
        color: 'var(--mist)',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,.06)',
        fontFamily: 'inherit',
        zIndex: 100,
      }}
    >
      Cerrar sesión
    </button>
  );
}
