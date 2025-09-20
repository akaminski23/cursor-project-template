import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI Tudor - Code Tutor',
  description: 'Solo-user AI-powered code tutoring application with voice support, interactive playground, and mock API',
  keywords: ['AI', 'code tutor', 'programming', 'voice', 'education', 'TypeScript', 'React'],
  authors: [{ name: 'AI Tudor Team' }],
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AI Tudor'
  },
  openGraph: {
    title: 'AI Tudor - Code Tutor',
    description: 'AI-powered code tutoring with voice support',
    type: 'website',
    locale: 'en_US'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-slate-950 text-slate-100">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
