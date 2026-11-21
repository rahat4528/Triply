'use client';

import React from 'react';
import { Smartphone, CheckCircle, Navigation, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

interface Stop {
  sequence: number;
  stopType: string;
  trackingCode?: string;
  customerName?: string;
  address?: string;
  deliveryStatus?: string;
  arrivalSec?: number;
}

interface DriverMobileViewProps {
  vehicleCode: string;
  driverName: string;
  stops: Stop[];
  onUpdateStatus: (seq: number, status: string) => void;
}

export const DriverMobileView: React.FC<DriverMobileViewProps> = ({
  vehicleCode,
  driverName,
  stops,
  onUpdateStatus
}) => {
  return (
    <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 shadow-xl max-w-xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            Driver Manifest View
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mobile-optimized sequential stop workflow for active vehicle: <span className="text-emerald-400 font-mono font-semibold">{vehicleCode}</span> ({driverName})
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {stops.map((stop) => (
          <div
            key={stop.sequence}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                  {stop.sequence}
                </span>
                <div>
                  <div className="text-xs font-mono text-slate-500">{stop.trackingCode || 'DEPOT TERMINAL'}</div>
                  <h4 className="text-sm font-bold text-white">{stop.customerName || stop.address}</h4>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                stop.deliveryStatus === 'DELIVERED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : stop.deliveryStatus === 'EN_ROUTE'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {stop.deliveryStatus || 'SCHEDULED'}
              </span>
            </div>

            {stop.stopType === 'JOB' && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[200px]">{stop.address}</span>
                </div>

                <div className="flex gap-2">
                  {stop.deliveryStatus !== 'DELIVERED' ? (
                    <button
                      onClick={() => onUpdateStatus(stop.sequence, 'DELIVERED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Delivered
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
