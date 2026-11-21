'use client';

import React, { useState } from 'react';
import { Truck, Map, Package, Play, Smartphone, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { FleetPanel, Vehicle } from '@/components/FleetPanel';
import { JobsTable, Job } from '@/components/JobsTable';
import { RouteMapPanel } from '@/components/RouteMapPanel';
import { DriverMobileView } from '@/components/DriverMobileView';

const initialVehicles: Vehicle[] = [
  { id: 'veh-01', code: 'FLEET-VAN-01', name: 'Mercedes Sprinter High-Roof', vehicleType: 'VAN', capacityKg: 1400, capacityM3: 11.5, capacityPieces: 65, status: 'AVAILABLE', driverName: 'Arthur Pendelton', driverSkills: ['REFRIGERATED', 'HAZMAT'] },
  { id: 'veh-02', code: 'FLEET-REEFER-02', name: 'Isuzu Thermo-King Reefer 16ft', vehicleType: 'TRUCK_REFRIGERATED', capacityKg: 2800, capacityM3: 18.0, capacityPieces: 120, status: 'AVAILABLE', driverName: 'Kendra Morales', driverSkills: ['WHITE_GLOVE', 'HEAVY_LIFT'] },
  { id: 'veh-03', code: 'FLEET-EVAN-03', name: 'Rivian Commercial Delivery EDV', vehicleType: 'ELECTRIC_VAN', capacityKg: 950, capacityM3: 8.5, capacityPieces: 45, status: 'AVAILABLE', driverName: 'Tariq Al-Mansoor', driverSkills: ['EXPRESS'] }
];

const initialJobs: Job[] = [
  { id: 'job-01', trackingCode: 'TRK-SEA-1001', customerName: 'Pike Place Organic Market', address: '1531 Western Ave, Seattle, WA', latitude: 47.6085, longitude: -122.3412, demandKg: 120, demandM3: 1.2, demandPieces: 8, timeWindowStartSec: 28800, timeWindowEndSec: 36000, serviceDurationSec: 600, requiredSkills: ['REFRIGERATED'], jobType: 'DELIVERY', status: 'PENDING' },
  { id: 'job-02', trackingCode: 'TRK-SEA-1002', customerName: 'Capitol Hill Artisan Roasters', address: '1122 E Pike St, Seattle, WA', latitude: 47.6142, longitude: -122.3168, demandKg: 85, demandM3: 0.8, demandPieces: 5, timeWindowStartSec: 32400, timeWindowEndSec: 46800, serviceDurationSec: 450, requiredSkills: [], jobType: 'DELIVERY', status: 'PENDING' },
  { id: 'job-03', trackingCode: 'TRK-SEA-1003', customerName: 'South Lake Union Biotech Labs', address: '500 Fairview Ave N, Seattle, WA', latitude: 47.6231, longitude: -122.3338, demandKg: 40, demandM3: 0.4, demandPieces: 2, timeWindowStartSec: 36000, timeWindowEndSec: 50400, serviceDurationSec: 300, requiredSkills: ['HAZMAT'], jobType: 'DELIVERY', status: 'PENDING' },
  { id: 'job-04', trackingCode: 'TRK-SEA-1004', customerName: 'Ballard Marine Hardware', address: '5300 Ballard Ave NW, Seattle, WA', latitude: 47.6664, longitude: -122.3831, demandKg: 240, demandM3: 2.1, demandPieces: 12, timeWindowStartSec: 39600, timeWindowEndSec: 57600, serviceDurationSec: 900, requiredSkills: ['HEAVY_LIFT'], jobType: 'DELIVERY', status: 'PENDING' },
  { id: 'job-05', trackingCode: 'TRK-SEA-1005', customerName: 'Fremont Craft Brewery Depot', address: '1050 N 34th St, Seattle, WA', latitude: 47.6493, longitude: -122.3444, demandKg: 180, demandM3: 1.5, demandPieces: 6, timeWindowStartSec: 43200, timeWindowEndSec: 61200, serviceDurationSec: 600, requiredSkills: [], jobType: 'DELIVERY', status: 'PENDING' },
  { id: 'job-06', trackingCode: 'TRK-SEA-1006', customerName: 'University Village Retailer', address: '2623 NE University Village St, Seattle, WA', latitude: 47.6628, longitude: -122.2989, demandKg: 95, demandM3: 0.9, demandPieces: 7, timeWindowStartSec: 46800, timeWindowEndSec: 64800, serviceDurationSec: 480, requiredSkills: ['WHITE_GLOVE'], jobType: 'DELIVERY', status: 'PENDING' }
];

export default function DeliveryOptimizerPage() {
  const [activeTab, setActiveTab] = useState<'DISPATCH' | 'FLEET' | 'ORDERS' | 'DRIVER'>('DISPATCH');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [jobs, setJobs] = useState(initialJobs);
  const [isSolving, setIsSolving] = useState(false);
  const [solved, setSolved] = useState(true);

  // Active tour mock state
  const [routes, setRoutes] = useState<any[]>([
    {
      id: 'route-01',
      vehicleName: 'Mercedes Sprinter High-Roof',
      totalDistanceMeters: 24800,
      totalDurationSeconds: 8400,
      stops: [
        { sequence: 1, stopType: 'START', address: '100 Logistics Way' },
        { sequence: 2, stopType: 'JOB', trackingCode: 'TRK-SEA-1001', customerName: 'Pike Place Organic Market', address: '1531 Western Ave', deliveryStatus: 'SCHEDULED' },
        { sequence: 3, stopType: 'JOB', trackingCode: 'TRK-SEA-1003', customerName: 'South Lake Union Biotech Labs', address: '500 Fairview Ave N', deliveryStatus: 'SCHEDULED' },
        { sequence: 4, stopType: 'END', address: '100 Logistics Way' }
      ]
    },
    {
      id: 'route-02',
      vehicleName: 'Isuzu Thermo-King Reefer 16ft',
      totalDistanceMeters: 31200,
      totalDurationSeconds: 10200,
      stops: [
        { sequence: 1, stopType: 'START', address: '100 Logistics Way' },
        { sequence: 2, stopType: 'JOB', trackingCode: 'TRK-SEA-1002', customerName: 'Capitol Hill Artisan Roasters', address: '1122 E Pike St', deliveryStatus: 'SCHEDULED' },
        { sequence: 3, stopType: 'JOB', trackingCode: 'TRK-SEA-1004', customerName: 'Ballard Marine Hardware', address: '5300 Ballard Ave NW', deliveryStatus: 'SCHEDULED' },
        { sequence: 4, stopType: 'END', address: '100 Logistics Way' }
      ]
    }
  ]);

  const handleRunOptimization = () => {
    setIsSolving(true);
    setTimeout(() => {
      setIsSolving(false);
      setSolved(true);
    }, 800);
  };

  const handleAddJob = (newJob: Partial<Job>) => {
    setJobs((prev) => [
      ...prev,
      {
        id: `job-${Date.now()}`,
        trackingCode: `TRK-SEA-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'PENDING',
        requiredSkills: [],
        ...newJob
      } as Job
    ]);
  };

  const handleUpdateStopStatus = (seq: number, status: string) => {
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        stops: r.stops.map((s: any) => (s.sequence === seq ? { ...s, deliveryStatus: status } : s))
      }))
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      {/* Dispatch Control Tower Header */}
      <header className="bg-[#151D2A] border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Triply Logistics Control Tower</h1>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  VROOM Solver v1.14
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Vehicle VRP with Pickups, Deliveries & Strict Time Windows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunOptimization}
              disabled={isSolving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow"
            >
              {isSolving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {isSolving ? 'Solving VRP Problem...' : 'Solve & Optimize Routes'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('DISPATCH')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'DISPATCH'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-4 h-4" />
            Dispatch Map & Routes
          </button>
          <button
            onClick={() => setActiveTab('FLEET')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'FLEET'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            Fleet & Drivers ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'ORDERS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Delivery Orders ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('DRIVER')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'DRIVER'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Driver Manifest
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'DISPATCH' && (
          <RouteMapPanel
            routes={routes}
            totalDistanceMeters={routes.reduce((acc, r) => acc + r.totalDistanceMeters, 0)}
            totalDurationSeconds={routes.reduce((acc, r) => acc + r.totalDurationSeconds, 0)}
          />
        )}
        {activeTab === 'FLEET' && (
          <FleetPanel vehicles={vehicles} />
        )}
        {activeTab === 'ORDERS' && (
          <JobsTable jobs={jobs} onAddJob={handleAddJob} />
        )}
        {activeTab === 'DRIVER' && (
          <DriverMobileView
            vehicleCode="FLEET-VAN-01"
            driverName="Arthur Pendelton"
            stops={routes[0]?.stops || []}
            onUpdateStatus={handleUpdateStopStatus}
          />
        )}
      </main>
    </div>
  );
}
