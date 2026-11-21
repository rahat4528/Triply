import React, { useState } from 'react';
import { Shield, Navigation, AlertTriangle, Compass, CheckCircle } from 'lucide-react';

interface LocationConsentBannerProps {
  onGrantConsent: (source: 'DEVICE' | 'MANUAL' | 'SIMULATED', coords?: { lat: number; lon: number }) => void;
  currentSource: string | null;
  permissionState: 'PROMPT' | 'GRANTED' | 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT';
}

export function LocationConsentBanner({
  onGrantConsent,
  currentSource,
  permissionState,
}: LocationConsentBannerProps) {
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState('51.5045');
  const [manualLon, setManualLon] = useState('-0.1145');

  const requestDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation API not supported by browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onGrantConsent('DEVICE', {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('Geolocation prompt response:', err.message);
        // Fallback to manual selection
        setManualMode(true);
      },
      { timeout: 8000 }
    );
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    onGrantConsent('MANUAL', {
      lat: parseFloat(manualLat),
      lon: parseFloat(manualLon),
    });
    setManualMode(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Location Privacy & Consent Control</span>
              {currentSource && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  Active: {currentSource}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Location is accessed only on your explicit action. Foreground tracking only. No secret background tracking.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={requestDeviceLocation}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Use My Location</span>
          </button>

          <button
            onClick={() => setManualMode(!manualMode)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
          >
            Manual Coord
          </button>

          <button
            onClick={() => onGrantConsent('SIMULATED', { lat: 51.5045, lon: -0.1145 })}
            className="px-3 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-xs font-medium"
            title="Development simulation mode (clearly labeled)"
          >
            Simulate
          </button>
        </div>
      </div>

      {/* Manual Input Form */}
      {manualMode && (
        <form onSubmit={submitManual} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
          <div className="flex-1 flex items-center gap-2">
            <label className="text-slate-400">Lat:</label>
            <input
              type="text"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-white w-24"
            />
            <label className="text-slate-400">Lon:</label>
            <input
              type="text"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-white w-24"
            />
          </div>
          <button type="submit" className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium">
            Set Manual
          </button>
        </form>
      )}
    </div>
  );
}
