'use client';

import React from 'react';
import { MapPin, Navigation, Compass, Globe } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  sequence: number;
}

interface TripMapPanelProps {
  destinations: Destination[];
}

export const TripMapPanel: React.FC<TripMapPanelProps> = ({ destinations }) => {
  return (
    <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Route & Waypoint Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            WGS84 verified destinations & geocoded waypoints
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          <Navigation className="w-3.5 h-3.5" />
          {destinations.length} Hubs
        </div>
      </div>

      {/* Styled Interactive Spatial Projection Area */}
      <div className="mt-4 relative h-64 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#10B981 1px, transparent 1px), radial-gradient(#10B981 1px, #0B0F17 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* Connective Route Line SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polyline
            points="120,180 280,110 440,160"
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="opacity-70"
          />
        </svg>

        {/* Pin Overlays */}
        {destinations.map((dest, i) => {
          // Layout pins across the visual container
          const leftPct = 25 + i * 25;
          const topPct = i === 1 ? 35 : 60;

          return (
            <div
              key={dest.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transition transform group-hover:scale-110">
                {dest.sequence}
              </div>
              <div className="mt-2 bg-slate-900/90 border border-slate-700/80 rounded px-2 py-1 text-center shadow-md">
                <div className="text-xs font-bold text-white whitespace-nowrap">{dest.name}</div>
                <div className="text-[10px] font-mono text-emerald-400">
                  {dest.latitude.toFixed(2)}°, {dest.longitude.toFixed(2)}°
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Waypoint Coordinates List */}
      <div className="mt-4 space-y-2">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                {dest.sequence}
              </span>
              <span className="font-semibold text-white">{dest.name}</span>
              <span className="text-slate-500">({dest.countryCode})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400">
                {dest.latitude.toFixed(4)}, {dest.longitude.toFixed(4)}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                {dest.timezone}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
