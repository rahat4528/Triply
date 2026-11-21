import React, { useState } from 'react';
import { X, Radio, Plus, Trash2, BellRing, ShieldCheck } from 'lucide-react';

interface GeofenceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  geofences: any[];
  events: any[];
  userLocation: { latitude: number; longitude: number } | null;
  onAddGeofence: (fence: any) => void;
  onDeleteGeofence: (id: string) => void;
}

export function GeofenceManagerModal({
  isOpen,
  onClose,
  geofences,
  events,
  userLocation,
  onAddGeofence,
  onDeleteGeofence,
}: GeofenceManagerModalProps) {
  const [name, setName] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [dwellMinutes, setDwellMinutes] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddGeofence({
      name: name.trim(),
      type: 'CIRCLE',
      latitude: userLocation?.latitude || 51.5045,
      longitude: userLocation?.longitude || -0.1145,
      radiusMeters: Number(radiusMeters),
      dwellMinutes: Number(dwellMinutes),
    });

    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Geofence Boundaries & Live Event Feed</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {/* Honest Tracking Notice */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Foreground-Only Geofencing Transparency</span>
            </div>
            <p>
              Web applications detect boundary transitions only while open in the foreground. Background geofencing requires native OS APIs not supported in web environments.
            </p>
          </div>

          {/* Create Geofence Form */}
          <form onSubmit={handleSubmit} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Add Circular Geofence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Boundary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Workspace Zone"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Radius (Meters)</label>
                <input
                  type="number"
                  min="50"
                  max="10000"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Dwell Confirmation (Mins)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={dwellMinutes}
                  onChange={(e) => setDwellMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Geofence</span>
            </button>
          </form>

          {/* Configured Geofences List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Active Geofences ({geofences.length})
            </h4>
            <div className="space-y-2">
              {geofences.map((fence) => (
                <div
                  key={fence.id}
                  className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{fence.name}</span>
                    <span className="text-[10px] text-slate-400">
                      Type: {fence.type} • Radius: {fence.radiusMeters}m • Center: {fence.latitude.toFixed(4)}°, {fence.longitude.toFixed(4)}°
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteGeofence(fence.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Event Feed */}
          {events.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                <span>Geofence Event Audit Log</span>
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className={`font-bold mr-2 ${ev.eventType === 'ENTER' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {ev.eventType}
                      </span>
                      <span className="text-slate-200">{ev.geofenceName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ev.timestamp).toLocaleTimeString()} ({ev.source})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
