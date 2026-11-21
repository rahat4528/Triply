import React from 'react';
import { Table, X } from 'lucide-react';

interface DatasetTableViewProps {
  isOpen: boolean;
  onClose: () => void;
  features: any[];
}

export function DatasetTableView({ isOpen, onClose, features }: DatasetTableViewProps) {
  if (!isOpen) return null;

  const headers = features[0]?.properties ? Object.keys(features[0].properties) : ['id', 'lat', 'lon'];

  return (
    <div className="absolute inset-x-0 bottom-14 z-30 bg-slate-900/95 border-t border-slate-800 h-72 flex flex-col shadow-2xl backdrop-blur-md">
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Dataset Features Table ({features.length} Rows)
          </h4>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="p-2">Latitude</th>
              <th className="p-2">Longitude</th>
              {headers.map((h) => (
                <th key={h} className="p-2 capitalize">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
            {features.map((feat, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40">
                <td className="p-2 text-cyan-400">{feat.latitude?.toFixed(4) || '—'}</td>
                <td className="p-2 text-cyan-400">{feat.longitude?.toFixed(4) || '—'}</td>
                {headers.map((h) => (
                  <td key={h} className="p-2 truncate max-w-[160px]">{String(feat.properties?.[h] ?? '—')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
