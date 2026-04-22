import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import fondosData from '@/data/FONDOS_LVAM.json';
import FondoFicha from '@/components/FondoFicha';

export function generateStaticParams() {
  return (fondosData as any).fondos.map((f: any) => ({ id: f._id as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const f = (fondosData as any).fondos.find((x: any) => x._id === id);
  if (!f) return { title: 'Fondo no encontrado | LVAM' };
  return {
    title: `${f.identificacion.nombre_corto} | LVAM`,
    description: f.objetivo,
  };
}

export default async function FondoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fondo = (fondosData as any).fondos.find((f: any) => f._id === id);
  if (!fondo) notFound();
  const ipc = (fondosData as any)._meta?.ipc_mensual?.datos ?? {};
  return <FondoFicha fondo={fondo} ipcMensual={ipc} />;
}
