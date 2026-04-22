import type { Metadata } from 'next';
import { Nunito_Sans, Nunito, Playfair_Display } from 'next/font/google';
import './globals.css';

const bodyFont = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

const numFont = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-num',
  weight: ['400', '500', '600', '700'],
});

const displayFont = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Portal FFMM | LarrainVial Asset Management',
  description:
    'Fichas institucionales de los fondos mutuos de LarrainVial Asset Management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${bodyFont.variable} ${numFont.variable} ${displayFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
