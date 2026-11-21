import React, { useState } from 'react';
import { X, Calendar, Search, AlertCircle, Loader2 } from 'lucide-react';

interface HistoricalModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { name: string; latitude: number; longitude: number };
  apiUrl: string;
}

export function HistoricalModal({ isOpen, onClose, location, apiUrl }: HistoricalModalProps) {
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-01-07');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resp = await fetch(
        `${apiUrl}/weather/historical?lat=${location.latitude}&lon=${location.longitude}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!resp.ok) {
        throw new Error(`Historical request failed with status ${resp.status}`);
      }
      const json = await resp.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch historical reanalysis data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Historical Weather Reanalysis Archive</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Strict Reanalysis Transparency Notice */}
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong>Reanalysis Archive Data Notice:</strong> Historical data is retrieved from meteorological reanalysis archives (ERA5 reanalysis models). It represents past reanalysis models and is strictly separated from current observations or live forecasts.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            onClick={handleFetch}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Query Reanalysis for {location.name}</span>
          </button>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span>Date Range: {data.startDate} to {data.endDate}</span>
                <span className="font-mono text-indigo-400">{data.dataType}</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {data.daily?.map((d: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-white">{d.date}</span>
                    <div className="flex items-center gap-4 text-slate-300">
                      <span>Mean: <strong className="text-white">{d.temperatureMean.toFixed(1)}°C</strong></span>
                      <span>Max: <strong className="text-amber-400">{d.temperatureMax.toFixed(1)}°C</strong></span>
                      <span>Min: <strong className="text-cyan-400">{d.temperatureMin.toFixed(1)}°C</strong></span>
                      <span>Rain: <strong className="text-blue-400">{d.precipitationSum}mm</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-slate-400 italic text-right">
                {data.attribution}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
