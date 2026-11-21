import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Triply Travel Planner | Collaborative Itineraries & Budget',
  description: 'Multi-destination itinerary scheduling, precise minor-unit budget tracking, and real-time travel collaboration.',
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
