import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SENTINEL — Plateforme de Surveillance et Détection',
  description: 'Plateforme de renseignement et surveillance de données pour la détection d\'anomalies financières et la surveillance géospatiale en temps réel.',
  keywords: ['surveillance', 'détection', 'anomalies', 'géospatial', 'renseignement', 'SENTINEL'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-[Inter] antialiased">
        {children}
      </body>
    </html>
  );
}
