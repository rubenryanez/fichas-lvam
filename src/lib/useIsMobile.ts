'use client';

import { useEffect, useState } from 'react';

/**
 * Devuelve true si el viewport es <= 768px.
 * SSR-safe: durante el primer render del cliente devuelve false;
 * después de montar escucha resize y actualiza.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    // addEventListener is the modern API (addListener está deprecated pero lo usan algunos Safari antiguos)
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, [breakpoint]);

  return isMobile;
}
