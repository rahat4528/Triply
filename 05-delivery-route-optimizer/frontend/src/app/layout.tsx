import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Triply Delivery Route Optimizer | VRP Logistics Control Tower',
  description: 'Multi-vehicle routing problem solver, capacity & time window optimization, live fleet dispatch tower.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F17] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
