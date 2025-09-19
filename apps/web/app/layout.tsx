import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI 2DoR – AI Code Tutor',
  description: 'Conversational AI tutor for code walkthroughs with voice and progress tracking.'
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
