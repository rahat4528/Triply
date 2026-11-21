import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';

interface TimeSliderBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentStep: number;
  totalSteps: number;
  onChangeStep: (step: number) => void;
  speedMultiplier: number;
  onChangeSpeed: (spd: number) => void;
}

export function TimeSliderBar({
  isPlaying,
  onTogglePlay,
  currentStep,
  totalSteps,
  onChangeStep,
  speedMultiplier,
  onChangeSpeed,
}: TimeSliderBarProps) {
  return (
    <div className="h-14 bg-[#111827]/90 border-t border-slate-800 px-6 flex items-center justify-between gap-6 z-20 shadow-lg backdrop-blur-md">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors"
          title={isPlaying ? 'Pause Animation' : 'Play Time-Series Animation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={() => onChangeStep(0)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Reset Animation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Speed Selector */}
        <button
          onClick={() => onChangeSpeed(speedMultiplier === 1 ? 2 : speedMultiplier === 2 ? 5 : 1)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-cyan-400 border border-slate-700"
        >
          {speedMultiplier}x
        </button>
      </div>

      {/* Scrub Slider */}
      <div className="flex-1 flex items-center gap-3">
        <Clock className="w-4 h-4 text-slate-400" />
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStep}
          onChange={(e) => onChangeStep(Number(e.target.value))}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <span className="text-xs font-mono text-cyan-400 w-16 text-right">
          Step {currentStep + 1}/{totalSteps}
        </span>
      </div>
    </div>
  );
}
