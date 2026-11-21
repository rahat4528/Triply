import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Download, Trash2, CheckCircle2, AlertOctagon } from 'lucide-react';

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
}

export function PrivacyCenterModal({ isOpen, onClose, apiUrl }: PrivacyCenterModalProps) {
  const [consents, setConsents] = useState<any[]>([]);
  const [purgedMessage, setPurgedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch(`${apiUrl}/privacy/consent`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setConsents(data);
        })
        .catch(() => {});
    }
  }, [isOpen, apiUrl]);

  const handleExport = async () => {
    try {
      const resp = await fetch(`${apiUrl}/privacy/export`);
      const data = await resp.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `triply-location-privacy-export-${Date.now()}.json`;
      a.click();
    } catch {}
  };

  const handlePurge = async () => {
    if (!confirm('Are you certain? This permanently purges all saved locations, geofence events, and consent records.')) {
      return;
    }
    try {
      const resp = await fetch(`${apiUrl}/privacy/purge`, { method: 'DELETE' });
      const json = await resp.json();
      setPurgedMessage(json.message);
      setConsents([]);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Location Privacy Center</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <p className="text-xs text-slate-400">
            Triply enforces strict data minimization. Review active permissions, download your data export, or invoke permanent deletion below.
          </p>

          {purgedMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{purgedMessage}</span>
            </div>
          )}

          {/* Consent Ledger */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Recorded Consent Ledger
            </h4>
            <div className="space-y-2">
              {consents.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white block">{c.purpose}</span>
                    <span className="text-[10px] text-slate-400">
                      Granted: {new Date(c.grantedAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {c.permissionState}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleExport}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Location Data (JSON)</span>
            </button>

            <button
              onClick={handlePurge}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-xs font-semibold text-red-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Purge All Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
