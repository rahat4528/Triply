'use client';

import React, { useState, useEffect } from 'react';
import { LayerPanel } from '../components/LayerPanel';
import { MapViewport } from '../components/MapViewport';
import { FiltersAndChartsPanel } from '../components/FiltersAndChartsPanel';
import { TimeSliderBar } from '../components/TimeSliderBar';
import { DatasetTableView } from '../components/DatasetTableView';
import { DatasetIngestionModal } from '../components/DatasetIngestionModal';
import { Layers, UploadCloud, Table, Share2, Download, Box } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api/v1';

export default function MapStudioPage() {
  const [layers, setLayers] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  // Cross-filtering state
  const [pm25Threshold, setPm25Threshold] = useState(40);
  const [selectedAqi, setSelectedAqi] = useState<string | null>(null);

  // Time slider state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Modals & Panels
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  // Load initial dataset features & project
  useEffect(() => {
    fetch(`${API_BASE}/projects/proj-london-air-quality`)
      .then((r) => r.json())
      .then((data) => {
        if (data.layers) setLayers(data.layers);
      })
      .catch(() => {});

    fetch(`${API_BASE}/datasets/ds-air-quality/features`)
      .then((r) => r.json())
      .then((data) => {
        if (data.features) setFeatures(data.features);
      })
      .catch(() => {});
  }, []);

  // Time-series interval animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 10);
    }, 1000 / speedMultiplier);
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Apply cross-filtering
  const filteredFeatures = features.filter((f) => {
    const pm25 = f.properties?.pm25 ?? 0;
    if (pm25 > pm25Threshold) return false;
    if (selectedAqi && f.properties?.aqi !== selectedAqi) return false;
    return true;
  });

  const handleToggleVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l))
    );
  };

  const handleUpdateLayer = (id: string, updates: any) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const handleAddLayer = () => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      datasetId: 'ds-air-quality',
      name: 'Custom 3D Extrusion Layer',
      type: 'POLYGON',
      isVisible: true,
      config: { colorScale: 'magma', is3D: true, opacity: 0.8 },
    };
    setLayers((prev) => [...prev, newLayer]);
  };

  const handleDeleteLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-[#111827]/90 px-4 flex items-center justify-between shrink-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <Box className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">Triply Map Studio</span>
          <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">v1.0 Analytical Geospatial Workspace</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Dataset</span>
          </button>

          <button
            onClick={() => setIsTableOpen(!isTableOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Data Grid</span>
          </button>

          <a
            href={`${API_BASE}/exports/job-sample/download`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors"
            title="Download CSV / GeoJSON"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Center 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <LayerPanel
          layers={layers}
          onToggleVisibility={handleToggleVisibility}
          onUpdateLayer={handleUpdateLayer}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
        />

        <MapViewport
          features={filteredFeatures}
          layers={layers.filter((l) => l.isVisible)}
          selectedFeature={selectedFeature}
          onSelectFeature={(f) => setSelectedFeature(f)}
          centerCoords={{ lat: 51.5045, lon: -0.1145, zoom: 12.5 }}
        />

        <FiltersAndChartsPanel
          features={filteredFeatures}
          pm25Threshold={pm25Threshold}
          onChangePm25Threshold={(t) => setPm25Threshold(t)}
          selectedAqi={selectedAqi}
          onSelectAqi={(a) => setSelectedAqi(a)}
        />

        {/* Dataset Table Overlay */}
        <DatasetTableView
          isOpen={isTableOpen}
          onClose={() => setIsTableOpen(false)}
          features={filteredFeatures}
        />
      </div>

      {/* Bottom Time-Series Playback Bar */}
      <TimeSliderBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        currentStep={currentStep}
        totalSteps={10}
        onChangeStep={(s) => setCurrentStep(s)}
        speedMultiplier={speedMultiplier}
        onChangeSpeed={(spd) => setSpeedMultiplier(spd)}
      />

      {/* Dataset Ingestion Modal */}
      <DatasetIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        apiUrl={API_BASE}
        onDatasetIngested={(ds) => {
          if (ds.features) setFeatures(ds.features);
        }}
      />
    </div>
  );
}
