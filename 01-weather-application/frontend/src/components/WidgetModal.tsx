import React, { useState } from 'react';
import { X, Code, Copy, Check, ExternalLink } from 'lucide-react';

interface WidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { name: string; latitude: number; longitude: number };
  apiUrl: string;
}

export function WidgetModal({ isOpen, onClose, location, apiUrl }: WidgetModalProps) {
  const [token, setToken] = useState('wgt_sample_london');
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe src="http://localhost:3001/widget/${token}" width="340" height="190" frameborder="0" style="border-radius:14px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-semibold text-white">Embeddable Weather Widget</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400">
            Embed live weather telemetry for <strong>{location.name}</strong> onto any web application using an isolated, rate-limited widget iframe snippet.
          </p>

          {/* Widget Preview Container */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center">
            <div className="w-[320px] bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg text-center">
              <span className="text-xs font-semibold text-sky-400 block">{location.name}</span>
              <div className="text-3xl font-extrabold text-white my-1">15.2°C</div>
              <span className="text-xs text-slate-300 capitalize">Partly cloudy</span>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>Wind: 16 km/h</span>
                <span>Humidity: 65%</span>
              </div>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              HTML Embed Code
            </label>
            <div className="relative">
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-teal-300 font-mono overflow-x-auto">
                {snippet}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy snippet"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
