'use client';

import React from 'react';
import { Map, Navigation, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RouteMapPanelProps {
  routes: any[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
}

export const RouteMapPanel: React.FC<RouteMapPanelProps> = ({
  routes,
  totalDistanceMeters,
  totalDurationSeconds
}) => {
  const routeColors = ['#10B981', '#38BDF8', '#F59E0B'];

  return (
    <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-emerald-400" />
            Dispatch Map & Tour Visualizer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Optimized vehicle tours with color coding and stop sequence numbering
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-400">Total Distance: </span>
            <span className="text-emerald-400 font-bold">{(totalDistanceMeters / 1000).toFixed(1)} km</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-400">Drive Time: </span>
            <span className="text-sky-400 font-bold">{(totalDurationSeconds / 3600).toFixed(1)} hrs</span>
          </div>
        </div>
      </div>

      {/* Styled Interactive Tour Map Container */}
      <div className="mt-4 relative h-80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Subtle Map Grid Coordinate Matrix */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Central Distribution Depot Marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
          <div className="w-7 h-7 rounded-lg bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-xs">
            D
          </div>
          <span className="mt-1 bg-slate-900/90 text-[10px] font-bold text-white px-2 py-0.5 rounded border border-slate-700 shadow">
            Central Depot
          </span>
        </div>

        {/* SVG Route Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Tour 1 Path (Sprinter) */}
          <path
            d="M 380,160 Q 250,90 200,110 T 160,200 T 380,160"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeDasharray="6 3"
            className="opacity-80"
          />
          {/* Tour 2 Path (Reefer) */}
          <path
            d="M 380,160 Q 480,80 540,120 T 500,240 T 380,160"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeDasharray="6 3"
            className="opacity-80"
          />
        </svg>

        {/* Visual Waypoint Nodes */}
        <div className="absolute left-[26%] top-[34%] flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-lg border border-white">
            1
          </div>
          <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-white mt-1 border border-slate-800">
            Pike Place Market
          </span>
        </div>

        <div className="absolute left-[70%] top-[38%] flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-sky-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-lg border border-white">
            1
          </div>
          <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-white mt-1 border border-slate-800">
            Capitol Hill Roasters
          </span>
        </div>
      </div>

      {/* Tour Summary Chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {routes.map((r, i) => (
          <div
            key={r.id || i}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: routeColors[i % routeColors.length] }}
              />
              <div>
                <div className="text-xs font-bold text-white">{r.vehicleName || `Vehicle ${i + 1}`}</div>
                <div className="text-[10px] text-slate-400">{r.stops?.length || 0} stops assigned</div>
              </div>
            </div>
            <div className="text-right text-xs font-mono text-emerald-400 font-semibold">
              {((r.totalDistanceMeters || 12000) / 1000).toFixed(1)} km
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
