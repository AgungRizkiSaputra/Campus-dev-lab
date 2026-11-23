import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll';

export const metadata: Metadata = {
  title: 'Jokiskripsiku — Konsultan Skripsi & Akademik Profesional',
  description: 'Solusi pengerjaan skripsi, sempro, makalah, dan kebutuhan digital mahasiswa dikerjakan langsung oleh tim ahli independen dengan garansi Turnitin & Rekber amanah.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-muted text-gray-900 antialiased selection:bg-forest-100 selection:text-forest-900 font-sans">
        <SmoothScrollProvider>
          <ToastProvider>{children}</ToastProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
