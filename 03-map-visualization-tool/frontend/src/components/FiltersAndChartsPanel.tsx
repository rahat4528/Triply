import React from 'react';
import { Filter, BarChart3, Sliders, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FiltersAndChartsPanelProps {
  features: any[];
  pm25Threshold: number;
  onChangePm25Threshold: (val: number) => void;
  selectedAqi: string | null;
  onSelectAqi: (cat: string | null) => void;
}

export function FiltersAndChartsPanel({
  features,
  pm25Threshold,
  onChangePm25Threshold,
  selectedAqi,
  onSelectAqi,
}: FiltersAndChartsPanelProps) {
  // Compute chart histogram from features
  const chartData = [
    { range: '0-10', count: features.filter((f) => (f.properties?.pm25 || 0) < 10).length },
    { range: '10-20', count: features.filter((f) => (f.properties?.pm25 || 0) >= 10 && (f.properties?.pm25 || 0) < 20).length },
    { range: '20-30', count: features.filter((f) => (f.properties?.pm25 || 0) >= 20 && (f.properties?.pm25 || 0) < 30).length },
    { range: '30+', count: features.filter((f) => (f.properties?.pm25 || 0) >= 30).length },
  ];

  return (
    <div className="w-80 h-full bg-[#111827]/95 border-l border-slate-800 flex flex-col justify-between shrink-0 z-20 shadow-xl backdrop-blur-md">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Cross-Filtering</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Metric Slider Filter */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Max PM2.5 Exposure:</span>
            <span className="text-cyan-400 font-bold font-mono">{pm25Threshold} µg/m³</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={pm25Threshold}
            onChange={(e) => onChangePm25Threshold(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <span className="text-[10px] text-slate-400 block">Filters points with PM2.5 concentration &le; threshold</span>
        </div>

        {/* Categorical Filter Chips */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            AQI Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Good', 'Moderate', 'Unhealthy'].map((cat) => {
              const isSelected = (cat === 'All' && selectedAqi === null) || selectedAqi === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectAqi(cat === 'All' ? null : cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Linked Recharts Distribution Chart */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>PM2.5 Frequency Distribution</span>
          </div>

          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
