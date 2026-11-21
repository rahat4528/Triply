import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X, AlertTriangle, ShieldCheck, Play } from 'lucide-react';

interface AlertRule {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  metric: string;
  comparator: string;
  thresholdValue: number;
  cooldownMinutes: number;
  isActive: boolean;
}

interface AlertRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: { name: string; latitude: number; longitude: number };
  apiUrl: string;
}

export function AlertRulesModal({ isOpen, onClose, currentLocation, apiUrl }: AlertRulesModalProps) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [metric, setMetric] = useState('TEMPERATURE_HIGH');
  const [comparator, setComparator] = useState('GT');
  const [thresholdValue, setThresholdValue] = useState(30);
  const [cooldownMinutes, setCooldownMinutes] = useState(180);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [rulesRes, notifRes] = await Promise.all([
        fetch(`${apiUrl}/alerts/rules`).then((r) => r.json()),
        fetch(`${apiUrl}/alerts/notifications`).then((r) => r.json()),
      ]);
      if (Array.isArray(rulesRes)) setRules(rulesRes);
      if (Array.isArray(notifRes)) setNotifications(notifRes);
    } catch {}
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/alerts/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: currentLocation.name,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          metric,
          comparator,
          thresholdValue: Number(thresholdValue),
          cooldownMinutes: Number(cooldownMinutes),
        }),
      });
      if (res.ok) {
        loadData();
      }
    } catch {}
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await fetch(`${apiUrl}/alerts/rules/${id}`, { method: 'DELETE' });
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      await fetch(`${apiUrl}/alerts/evaluate`, { method: 'POST' });
      await loadData();
    } finally {
      setEvaluating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Threshold Alerts & Severe Warnings</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {/* Official Alerts Disclosure Notice */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Alert Integrity & Source Transparency</span>
            </div>
            <p>
              Threshold alerts are computed automatically from forecast data. Official meteorological severe-weather warnings are displayed only if an official meteorological agency adapter is configured for your region. Triply never fabricates official warnings.
            </p>
          </div>

          {/* Create Alert Form */}
          <form onSubmit={handleCreateRule} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Add New Alert Rule for {currentLocation.name}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Metric</label>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="TEMPERATURE_HIGH">High Temperature (°C)</option>
                  <option value="TEMPERATURE_LOW">Low Temperature (°C)</option>
                  <option value="WIND_SPEED">Wind Speed (km/h)</option>
                  <option value="RAIN_PROBABILITY">Rain Probability (%)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Condition</label>
                <select
                  value={comparator}
                  onChange={(e) => setComparator(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="GT">Greater than (&gt;)</option>
                  <option value="GTE">Greater or equal (&gt;=)</option>
                  <option value="LT">Less than (&lt;)</option>
                  <option value="LTE">Less or equal (&lt;=)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Threshold Value</label>
                <input
                  type="number"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cooldown (Minutes)</label>
                <input
                  type="number"
                  value={cooldownMinutes}
                  onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Alert Rule</span>
            </button>
          </form>

          {/* Active Rules List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Configured Rules ({rules.length})
              </span>
              <button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
              >
                <Play className="w-3 h-3" />
                <span>{evaluating ? 'Evaluating...' : 'Evaluate Rules Now'}</span>
              </button>
            </div>

            {rules.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No alert rules configured yet.</p>
            ) : (
              <div className="space-y-2">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {r.locationName}: {r.metric} {r.comparator} {r.thresholdValue}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cooldown: {r.cooldownMinutes} mins • Status: Active
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification History Feed */}
          {notifications.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Fired Notification History
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-200"
                  >
                    <div className="font-medium">{n.message}</div>
                    <div className="text-[10px] text-amber-400/80 mt-1">
                      {new Date(n.timestamp).toLocaleTimeString()} via {n.channel}
                    </div>
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
