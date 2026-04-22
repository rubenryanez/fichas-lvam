'use client';

import { useEffect, useRef, useState } from 'react';

export interface TabOption<K extends string = string> {
  key: K;
  label: string;
}

export default function MobileTabMenu<K extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: TabOption<K>[];
  active: K;
  onChange: (k: K) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const activeLabel = tabs.find((t) => t.key === active)?.label ?? '';

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: Event) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="mobile-tab-menu"
      style={{
        position: 'sticky',
        top: 52,
        zIndex: 89,
        background: 'var(--white)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          height: 48,
          padding: '0 16px',
          background: 'var(--white)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--forest)',
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span aria-hidden style={{ fontSize: 16 }}>☰</span>
          <span>{activeLabel}</span>
        </span>
        <span
          aria-hidden
          style={{
            fontSize: 14,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            color: 'var(--forest)',
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="mobile-tab-menu-dropdown"
          style={{
            position: 'absolute',
            top: 48,
            left: 0,
            right: 0,
            background: 'var(--white)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxHeight: '70vh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            animation: 'slideDown 0.15s ease',
          }}
        >
          {tabs.map((t) => {
            const on = t.key === active;
            return (
              <button
                key={t.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(t.key);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  height: 48,
                  padding: '0 16px',
                  background: on ? 'var(--pale)' : 'var(--white)',
                  color: on ? 'var(--forest)' : 'var(--steel)',
                  border: 'none',
                  borderBottom: '1px solid var(--line2)',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: on ? 700 : 500,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
