import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Navigation, History, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface GeocodingItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone: string;
}

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: { name: string; latitude: number; longitude: number; timezone: string }) => void;
  apiUrl: string;
}

export function LocationSearchModal({ isOpen, onClose, onSelectLocation, apiUrl }: LocationSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`${apiUrl}/locations/recent`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setRecentSearches(data);
        })
        .catch(() => {});
    }
  }, [isOpen, apiUrl]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${apiUrl}/locations/search?q=${encodeURIComponent(query)}`);
        const json = await resp.json();
        setResults(Array.isArray(json) ? json : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, apiUrl]);

  const handleSelect = (item: GeocodingItem) => {
    // Record recent search
    fetch(`${apiUrl}/locations/recent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        resolvedName: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country,
      }),
    }).catch(() => {});

    onSelectLocation({
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
    });
    onClose();
  };

  const handleClearRecent = async () => {
    try {
      await fetch(`${apiUrl}/locations/recent`, { method: 'DELETE' });
      setRecentSearches([]);
    } catch {}
  };

  const handleUseMyLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        onSelectLocation({
          name: 'My Device Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        });
        onClose();
      },
      (err) => {
        setGeoLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please allow location access or select manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location information is currently unavailable.');
            break;
          case err.TIMEOUT:
            setGeoError('Location request timed out. Please retry.');
            break;
          default:
            setGeoError('Failed to retrieve location.');
        }
      },
      { timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-400" />
            <span>Search & Choose Location</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* User initiated geolocation */}
          <button
            onClick={handleUseMyLocation}
            disabled={geoLocating}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 font-medium text-sm transition-colors"
          >
            {geoLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            ) : (
              <Navigation className="w-4 h-4 text-sky-400" />
            )}
            <span>Use My Exact Location (Consent-based)</span>
          </button>

          {geoError && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, town, or administrative region..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              autoFocus
            />
            {loading && (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Ambiguity Resolution Results */}
          {results.length > 0 && (
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Resolved Locations
              </span>
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-sky-300">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {results.length === 0 && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Recent Searches
                </span>
                <button
                  onClick={handleClearRecent}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() =>
                      onSelectLocation({
                        name: rec.resolvedName,
                        latitude: rec.latitude,
                        longitude: rec.longitude,
                        timezone: 'UTC',
                      })
                    }
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span>{rec.resolvedName} {rec.country ? `(${rec.country})` : ''}</span>
                    <span className="text-[10px] text-slate-400">{new Date(rec.timestamp).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
