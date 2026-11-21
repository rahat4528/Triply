'use client';

import React from 'react';
import { Truck, ShieldCheck, BatteryCharging, AlertCircle } from 'lucide-react';

export interface Vehicle {
  id: string;
  code: string;
  name: string;
  vehicleType: string;
  capacityKg: number;
  capacityM3: number;
  capacityPieces: number;
  status: string;
  driverName?: string;
  driverPhone?: string;
  driverSkills?: string[];
}

interface FleetPanelProps {
  vehicles: Vehicle[];
}

export const FleetPanel: React.FC<FleetPanelProps> = ({ vehicles }) => {
  return (
    <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            Active Fleet Roster
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Heterogeneous capacities, driver skills & vehicle readiness
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          {vehicles.length} Units Ready
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  {v.code}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{v.name}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                v.status === 'AVAILABLE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {v.status}
              </span>
            </div>

            {/* Capacity Multi-Dimensional Metric Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
              <div className="bg-slate-950/60 rounded p-1.5">
                <div className="text-[9px] uppercase tracking-wider text-slate-500">Payload</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">{v.capacityKg} kg</div>
              </div>
              <div className="bg-slate-950/60 rounded p-1.5">
                <div className="text-[9px] uppercase tracking-wider text-slate-500">Volume</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">{v.capacityM3} m³</div>
              </div>
              <div className="bg-slate-950/60 rounded p-1.5">
                <div className="text-[9px] uppercase tracking-wider text-slate-500">Pieces</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">{v.capacityPieces} max</div>
              </div>
            </div>

            {/* Driver & Skills */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="text-slate-400">
                <span className="block text-[10px] text-slate-500 uppercase">Driver</span>
                <span className="font-medium text-slate-200">{v.driverName || 'Unassigned'}</span>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {(v.driverSkills || []).map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
