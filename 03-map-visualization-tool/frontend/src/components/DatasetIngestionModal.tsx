import React, { useState } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface DatasetIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onDatasetIngested: (dataset: any) => void;
}

export function DatasetIngestionModal({
  isOpen,
  onClose,
  apiUrl,
  onDatasetIngested,
}: DatasetIngestionModalProps) {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [format, setFormat] = useState<'CSV' | 'GEOJSON'>('CSV');
  const [preview, setPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleCSV = `station_name,latitude,longitude,pm25,no2\nCamden High St,51.5390,-0.1426,16.4,35.2\nGreenwich Park,51.4769,-0.0005,8.1,19.4\nKensington High,51.5010,-0.1920,21.5,42.0`;

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${apiUrl}/datasets/parse-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format }),
      });
      if (!resp.ok) throw new Error('Preview parsing failed.');
      const json = await resp.json();
      setPreview(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!name.trim()) {
      setError('Dataset name is required.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${apiUrl}/datasets/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, format }),
      });
      const json = await resp.json();
      onDatasetIngested(json);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Spatial Dataset Ingestion</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Dataset Name</label>
            <input
              type="text"
              placeholder="e.g. Urban Heat Telemetry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-semibold">Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('CSV')}
                className={`px-3 py-1 rounded-lg font-bold ${format === 'CSV' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                CSV
              </button>
              <button
                onClick={() => setFormat('GEOJSON')}
                className={`px-3 py-1 rounded-lg font-bold ${format === 'GEOJSON' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                GeoJSON
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Raw Data Content</label>
              <button
                onClick={() => setContent(sampleCSV)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Load Sample CSV
              </button>
            </div>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw CSV or GeoJSON text here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-mono text-[11px] text-slate-200"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              disabled={loading || !content.trim()}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Validate & Preview</span>
            </button>

            {preview && (
              <button
                onClick={handleIngest}
                disabled={loading}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Confirm Ingestion</span>
              </button>
            )}
          </div>

          {error && <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300">{error}</div>}

          {preview && (
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span>Validation Success: {preview.validRowsCount || preview.featuresCount} rows</span>
                {preview.invalidRowsCount > 0 && (
                  <span className="text-amber-400">{preview.invalidRowsCount} flagged rows</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {preview.columns?.map((c: any) => (
                  <span key={c.name} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 font-mono">
                    {c.name}: {c.type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
