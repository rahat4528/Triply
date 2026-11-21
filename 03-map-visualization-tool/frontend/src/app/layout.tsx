import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Triply Map Studio | Geospatial Data Visualization & Analytics',
  description: 'Interactive geospatial analytics workspace with layer styling, deck.gl rendering, cross-filtering, and temporal playback.',
};

export const viewport: Viewport = {
  themeColor: '#06b6d4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-100 bg-[#0b0f19] min-h-screen">
        {children}
      </body>
    </html>
  );
}
