import React, { useState } from 'react';
import { X, Layers, Plus, Loader2 } from 'lucide-react';
import { WeatherIcon } from './WeatherIcons';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
}

export function ComparisonModal({ isOpen, onClose, apiUrl }: ComparisonModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const defaultLocations = [
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'New York', lat: 40.7128, lon: -74.006 },
    { name: 'Reykjavik', lat: 64.1466, lon: -21.9426 },
  ];

  const handleCompare = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${apiUrl}/weather/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: defaultLocations }),
      });
      const json = await resp.json();
      if (Array.isArray(json)) setData(json);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-semibold text-white">Multi-Location Atmospheric Comparison</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Compare synchronous telemetry across multiple global coordinates.
            </p>
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Load Global Comparison</span>
            </button>
          </div>

          {data.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-base font-bold text-white mb-0.5">{item.location.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mb-3">
                      {item.location.latitude.toFixed(2)}°, {item.location.longitude.toFixed(2)}°
                    </p>

                    <div className="flex items-center gap-3 my-2">
                      <WeatherIcon code={item.current.weatherCode} className="w-10 h-10" />
                      <div>
                        <div className="text-2xl font-bold text-white">{item.current.temperature.toFixed(1)}°C</div>
                        <div className="text-xs text-slate-300 capitalize">{item.current.conditionText}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Humidity:</span>
                      <strong className="text-slate-200">{item.current.humidity}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Wind Speed:</span>
                      <strong className="text-slate-200">{item.current.windSpeed.toFixed(1)} km/h</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Surface Pressure:</span>
                      <strong className="text-slate-200">{Math.round(item.current.pressure)} hPa</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
