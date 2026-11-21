import React, { useState } from 'react';
import { X, Share2, Copy, Check, Ban, Clock, Shield } from 'lucide-react';

interface LocationSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShares: any[];
  userLocation: { latitude: number; longitude: number } | null;
  onCreateShare: (recipientEmail: string, durationMinutes: number) => void;
  onRevokeShare: (id: string) => void;
}

export function LocationSharingModal({
  isOpen,
  onClose,
  activeShares,
  userLocation,
  onCreateShare,
  onRevokeShare,
}: LocationSharingModalProps) {
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState(60);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onCreateShare(email.trim(), duration);
    setEmail('');
  };

  const copyLink = (token: string) => {
    const url = `http://localhost:3002/shared/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Consented Time-Delimited Location Sharing</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>Opt-In, Revocable Sharing</span>
            </div>
            <p>
              Sharing is time-limited and only active while permitted. You can revoke access at any time with immediate effect.
            </p>
          </div>

          {/* New Share Form */}
          <form onSubmit={handleSubmit} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Create New Share Link
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Recipient Email</label>
                <input
                  type="email"
                  placeholder="companion@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={240}>4 Hours</option>
                  <option value={1440}>24 Hours</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md"
            >
              Generate Sharing Link
            </button>
          </form>

          {/* Active Shares List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Active Location Shares ({activeShares.length})
            </h4>
            {activeShares.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active location sharing sessions.</p>
            ) : (
              <div className="space-y-2">
                {activeShares.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{s.recipientEmail}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Expires {new Date(s.expiresAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyLink(s.token)}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] flex items-center gap-1"
                      >
                        {copiedToken === s.token ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Link</span>
                      </button>

                      <button
                        onClick={() => onRevokeShare(s.id)}
                        className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-300 rounded-lg text-[11px] flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
