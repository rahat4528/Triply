'use client';

import React from 'react';
import { Compass, Maximize2, ShieldCheck, MapPin } from 'lucide-react';

interface MapViewportProps {
  features: any[];
  layers: any[];
  selectedFeature: any | null;
  onSelectFeature: (f: any) => void;
  centerCoords: { lat: number; lon: number; zoom: number };
}

export function MapViewport({
  features,
  layers,
  selectedFeature,
  onSelectFeature,
  centerCoords,
}: MapViewportProps) {
  return (
    <div className="relative flex-1 h-full bg-[#0b0f19] overflow-hidden flex items-center justify-center">
      {/* Visual Canvas Backdrop */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Viewport Info Pill */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
        <span>Center: {centerCoords.lat.toFixed(4)}°, {centerCoords.lon.toFixed(4)}° • Zoom: {centerCoords.zoom.toFixed(1)}</span>
      </div>

      {/* Feature Visual Points Simulation on Deck.gl/MapLibre Stage */}
      <div className="relative w-full h-full flex items-center justify-center">
        {features.map((feat) => {
          const lat = feat.latitude || feat.coordinates?.[1] || 51.5;
          const lon = feat.longitude || feat.coordinates?.[0] || -0.12;
          const isSelected = selectedFeature?.id === feat.id;

          // Normalized relative offset
          const offsetY = (51.504 - lat) * 900;
          const offsetX = (lon - (-0.114)) * 900;

          return (
            <div
              key={feat.id}
              onClick={() => onSelectFeature(feat)}
              className={`absolute cursor-pointer transition-transform transform hover:scale-150 z-10 ${
                isSelected ? 'ring-4 ring-cyan-400 scale-150' : ''
              }`}
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px)`,
              }}
            >
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </div>
            </div>
          );
        })}

        {/* Selected Feature Inspector Card */}
        {selectedFeature && (
          <div className="absolute bottom-6 left-6 z-20 bg-slate-900/95 border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl max-w-xs text-xs space-y-1.5 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedFeature.properties?.station || selectedFeature.properties?.name || 'Feature Details'}</span>
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Coordinates: {selectedFeature.latitude?.toFixed(4) || '—'}°, {selectedFeature.longitude?.toFixed(4) || '—'}°
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
              {Object.entries(selectedFeature.properties || {})
                .filter(([k]) => !k.startsWith('_'))
                .slice(0, 4)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-400 capitalize">{k}:</span>
                    <strong className="text-white">{String(v)}</strong>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Attribution */}
      <div className="absolute bottom-3 right-4 z-10 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-slate-400 border border-slate-800">
        deck.gl & MapLibre GL JS • OpenStreetMap contributors
      </div>
    </div>
  );
}
