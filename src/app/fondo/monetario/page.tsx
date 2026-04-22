import type { Metadata } from 'next';
import fondosData from '@/data/FONDOS_LVAM.json';
import FondoFicha from '@/components/FondoFicha';

const ID = 'monetario';

export function generateMetadata(): Metadata {
  const f = (fondosData as any).fondos.find((x: any) => x._id === ID);
  return {
    title: `${f?.identificacion?.nombre_corto ?? 'Ficha'} | LVAM`,
    description: f?.objetivo,
  };
}

export default function Page() {
  const fondo = (fondosData as any).fondos.find((f: any) => f._id === ID);
  const ipc = (fondosData as any)._meta?.ipc_mensual?.datos ?? {};
  return (
    <div style={{ overflowX: 'hidden' }}>
      <FondoFicha fondo={fondo} ipcMensual={ipc} />
    </div>
  );
}
