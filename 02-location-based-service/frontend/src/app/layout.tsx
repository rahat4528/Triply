import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Triply Location Service | Privacy-First Geospatial Proximity',
  description: 'Consent-based geospatial proximity discovery, circular/polygon geofencing, and revocable location sharing.',
};

export const viewport: Viewport = {
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-100 bg-slate-950 min-h-screen">
        {children}
      </body>
    </html>
  );
}
