'use client';

import React from 'react';
import { MapPin, Shield, Radio, Navigation } from 'lucide-react';

interface MapInteractiveProps {
  userLocation: { latitude: number; longitude: number; accuracy: number; source: string } | null;
  places: any[];
  geofences: any[];
  onSelectPlace: (place: any) => void;
  selectedPlace: any | null;
}

export function MapInteractive({
  userLocation,
  places,
  geofences,
  onSelectPlace,
  selectedPlace,
}: MapInteractiveProps) {
  return (
    <div className="relative w-full h-[400px] lg:h-[480px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
      {/* Background Grid simulating Map Canvas */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#38bdf8 1px, #0f172a 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Map Control Badge */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-medium text-slate-300 flex items-center gap-2 shadow-lg">
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>Map Coordinates: {userLocation ? `${userLocation.latitude.toFixed(4)}°, ${userLocation.longitude.toFixed(4)}°` : 'Awaiting Consent'}</span>
      </div>

      {/* Center Simulated Visualization Area */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Geofence Overlay Circles */}
        {geofences.map((fence) => (
          <div
            key={fence.id}
            className="absolute rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center pointer-events-none transition-all"
            style={{
              width: `${Math.min(320, fence.radiusMeters / 3)}px`,
              height: `${Math.min(320, fence.radiusMeters / 3)}px`,
            }}
          >
            <span className="text-[10px] font-semibold text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {fence.name}
            </span>
          </div>
        ))}

        {/* User Location Marker with Accuracy Circle */}
        {userLocation && (
          <div className="relative z-20 flex flex-col items-center">
            {/* Accuracy Circle */}
            <div
              className="absolute -inset-6 rounded-full bg-sky-500/20 border border-sky-400/40 animate-ping pointer-events-none"
              style={{
                width: `${Math.max(48, userLocation.accuracy * 1.5)}px`,
                height: `${Math.max(48, userLocation.accuracy * 1.5)}px`,
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
              }}
            />

            {/* Position Pin */}
            <div className="p-2.5 bg-sky-500 text-white rounded-full shadow-lg ring-4 ring-sky-400/30 flex items-center justify-center">
              <Navigation className="w-5 h-5 -rotate-45" />
            </div>

            <div className="mt-2 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-lg text-center shadow-md">
              <span className="text-[11px] font-bold text-white block">You are here</span>
              <span className="text-[9px] text-sky-400 font-mono">
                Source: {userLocation.source} (±{userLocation.accuracy}m)
              </span>
            </div>
          </div>
        )}

        {/* Places Markers */}
        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          return (
            <button
              key={place.id}
              onClick={() => onSelectPlace(place)}
              className={`absolute p-1.5 rounded-full transition-transform transform hover:scale-125 z-10 ${
                isSelected ? 'bg-amber-500 ring-4 ring-amber-400/40 scale-125' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
              style={{
                top: `${45 + (place.latitude - 51.503) * 600}%`,
                left: `${50 + (place.longitude - (-0.114)) * 600}%`,
              }}
              title={place.name}
            >
              <MapPin className="w-4 h-4 text-white" />
            </button>
          );
        })}
      </div>

      {/* Map Legend / Bottom Attribution */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> WGS84 Geodesic Projection
        </span>
        <span className="italic">OpenStreetMap contributors • Configurable Tile Fallback</span>
      </div>
    </div>
  );
}
