'use client';

import React, { useState } from 'react';
import { Package, Clock, MapPin, Plus, CheckCircle2 } from 'lucide-react';

export interface Job {
  id: string;
  trackingCode: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  demandKg: number;
  demandM3: number;
  demandPieces: number;
  timeWindowStartSec: number;
  timeWindowEndSec: number;
  serviceDurationSec: number;
  requiredSkills: string[];
  jobType: 'DELIVERY' | 'PICKUP';
  status: string;
}

interface JobsTableProps {
  jobs: Job[];
  onAddJob: (job: Partial<Job>) => void;
}

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, onAddJob }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [customer, setCustomer] = useState('');
  const [address, setAddress] = useState('');
  const [demandKg, setDemandKg] = useState('25');
  const [demandM3, setDemandM3] = useState('0.2');
  const [demandPieces, setDemandPieces] = useState('2');
  const [windowStart, setWindowStart] = useState('09:00');
  const [windowEnd, setWindowEnd] = useState('13:00');

  const formatSec = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !address.trim()) return;

    const [sh, sm] = windowStart.split(':').map(Number);
    const [eh, em] = windowEnd.split(':').map(Number);

    onAddJob({
      customerName: customer,
      address,
      latitude: 47.61 + (Math.random() - 0.5) * 0.05,
      longitude: -122.33 + (Math.random() - 0.5) * 0.05,
      demandKg: Number(demandKg) || 10,
      demandM3: Number(demandM3) || 0.1,
      demandPieces: Number(demandPieces) || 1,
      timeWindowStartSec: sh * 3600 + sm * 60,
      timeWindowEndSec: eh * 3600 + em * 60,
      serviceDurationSec: 300,
      jobType: 'DELIVERY'
    });

    setCustomer('');
    setAddress('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            Delivery Orders & Stops
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Orders pending optimization with hard time windows and physical demands
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <Plus className="w-4 h-4" />
          Add Order
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Tracking / Customer</th>
              <th className="py-2.5 px-3">Address</th>
              <th className="py-2.5 px-3">Time Window</th>
              <th className="py-2.5 px-3">Demand (kg / m³ / pcs)</th>
              <th className="py-2.5 px-3">Skills</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3">
                  <div className="font-mono text-emerald-400 text-[11px]">{job.trackingCode}</div>
                  <div className="font-semibold text-white">{job.customerName}</div>
                </td>
                <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{job.address}</td>
                <td className="py-2.5 px-3 font-mono text-slate-200">
                  {formatSec(job.timeWindowStartSec)} - {formatSec(job.timeWindowEndSec)}
                </td>
                <td className="py-2.5 px-3 font-mono">
                  {job.demandKg} kg | {job.demandM3} m³ | {job.demandPieces} pcs
                </td>
                <td className="py-2.5 px-3">
                  {job.requiredSkills.length > 0 ? (
                    job.requiredSkills.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold mr-1">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-600">Standard</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Delivery Order</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seattle Aquarium Cafe"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1483 Alaskan Way, Seattle, WA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={demandKg}
                    onChange={(e) => setDemandKg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Volume (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={demandM3}
                    onChange={(e) => setDemandM3(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Pieces</label>
                  <input
                    type="number"
                    value={demandPieces}
                    onChange={(e) => setDemandPieces(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Window Start</label>
                  <input
                    type="time"
                    value={windowStart}
                    onChange={(e) => setWindowStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Window End</label>
                  <input
                    type="time"
                    value={windowEnd}
                    onChange={(e) => setWindowEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
