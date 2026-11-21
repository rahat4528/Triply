import React from 'react';
import { Layers, Eye, EyeOff, Plus, Sliders, Box, Flame, CircleDot, Trash2 } from 'lucide-react';

interface LayerPanelProps {
  layers: any[];
  onToggleVisibility: (id: string) => void;
  onUpdateLayer: (id: string, updates: any) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string) => void;
}

export function LayerPanel({
  layers,
  onToggleVisibility,
  onUpdateLayer,
  onAddLayer,
  onDeleteLayer,
}: LayerPanelProps) {
  return (
    <div className="w-80 h-full bg-[#111827]/95 border-r border-slate-800 flex flex-col justify-between shrink-0 z-20 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Map Layers</h3>
        </div>
        <button
          onClick={onAddLayer}
          className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {layers.map((layer) => {
          return (
            <div
              key={layer.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {layer.type === 'POINT' && <CircleDot className="w-4 h-4 text-cyan-400" />}
                  {layer.type === 'HEATMAP' && <Flame className="w-4 h-4 text-amber-400" />}
                  {layer.type === 'POLYGON' && <Box className="w-4 h-4 text-emerald-400" />}
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">{layer.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleVisibility(layer.id)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    {layer.isVisible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDeleteLayer(layer.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Layer Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Opacity: {Math.round((layer.config?.opacity || 0.8) * 100)}%</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={Math.round((layer.config?.opacity || 0.8) * 100)}
                    onChange={(e) =>
                      onUpdateLayer(layer.id, {
                        config: { ...layer.config, opacity: Number(e.target.value) / 100 },
                      })
                    }
                    className="w-24 accent-cyan-400"
                  />
                </div>

                {layer.type === 'POINT' && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Radius Scale:</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={layer.config?.radiusScale || 2}
                      onChange={(e) =>
                        onUpdateLayer(layer.id, {
                          config: { ...layer.config, radiusScale: Number(e.target.value) },
                        })
                      }
                      className="w-24 accent-cyan-400"
                    />
                  </div>
                )}

                {layer.type === 'POLYGON' && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>3D Extrusion:</span>
                    <button
                      onClick={() =>
                        onUpdateLayer(layer.id, {
                          config: { ...layer.config, is3D: !layer.config?.is3D },
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        layer.config?.is3D ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {layer.config?.is3D ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
