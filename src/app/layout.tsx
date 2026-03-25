import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LOC DnD - Staff Dashboard',
  description: 'Leagues of Code Summer Camp 5 - DnD Activity Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {children}
      </body>
    </html>
  );
}
