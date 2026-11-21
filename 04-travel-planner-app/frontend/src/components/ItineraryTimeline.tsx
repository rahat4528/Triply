'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, Plus, Plane, Hotel, Utensils, Compass, DollarSign } from 'lucide-react';

interface ItineraryItem {
  id: string;
  title: string;
  itemType: 'ACTIVITY' | 'LODGING' | 'TRANSPORT' | 'DINING' | 'CUSTOM';
  startTime: string;
  endTime: string;
  timezone: string;
  latitude: number;
  longitude: number;
  locationName: string;
  costMinor: number;
  currency: string;
  bookingReference?: string;
  notes?: string;
}

interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  items: ItineraryItem[];
}

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  baseCurrency: string;
  onAddItem: (dayId: string, item: Partial<ItineraryItem>) => void;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ days, baseCurrency, onAddItem }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'ACTIVITY' | 'LODGING' | 'TRANSPORT' | 'DINING'>('ACTIVITY');
  const [newLocation, setNewLocation] = useState('');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('12:00');
  const [newCost, setNewCost] = useState('0');

  const currentDay = days[selectedDayIndex] || days[0];

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'TRANSPORT': return <Plane className="w-4 h-4 text-sky-400" />;
      case 'LODGING': return <Hotel className="w-4 h-4 text-emerald-400" />;
      case 'DINING': return <Utensils className="w-4 h-4 text-amber-400" />;
      default: return <Compass className="w-4 h-4 text-indigo-400" />;
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentDay) return;

    const baseDateStr = currentDay.date.substring(0, 10);
    const startIso = new Date(`${baseDateStr}T${newStartTime}:00Z`).toISOString();
    const endIso = new Date(`${baseDateStr}T${newEndTime}:00Z`).toISOString();

    onAddItem(currentDay.id, {
      title: newTitle,
      itemType: newType,
      locationName: newLocation,
      startTime: startIso,
      endTime: endIso,
      costMinor: Math.round(parseFloat(newCost || '0') * 100),
      currency: baseCurrency
    });

    setNewTitle('');
    setNewLocation('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Day-by-Day Itinerary
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological sequencing with automatic timezone compensation
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow"
        >
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto py-4 border-b border-slate-800/80 no-scrollbar">
        {days.map((day, idx) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-4 py-2.5 rounded-lg text-left whitespace-nowrap transition flex-shrink-0 ${
              selectedDayIndex === idx
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <div className="text-xs uppercase tracking-wider opacity-75">Day {day.dayNumber}</div>
            <div className="text-sm font-medium">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </button>
        ))}
      </div>

      {/* Active Day Header */}
      {currentDay && (
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">{currentDay.title || `Day ${currentDay.dayNumber}`}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{currentDay.items.length} scheduled events</p>
          </div>

          {/* Timeline Items */}
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
            {currentDay.items.map((item) => (
              <div
                key={item.id}
                className="relative pl-9 group"
              >
                {/* Dot */}
                <div className="absolute left-1.5 top-4 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center -translate-x-1/2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>

                <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-lg p-4 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="p-1 rounded bg-slate-800">
                          {getItemIcon(item.itemType)}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                          {item.itemType}
                        </span>
                        {item.bookingReference && (
                          <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                            Ref: {item.bookingReference}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-semibold text-white">{item.title}</h4>
                      {item.notes && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.notes}</p>}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono text-emerald-400 flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.startTime).toISOString().substring(11, 16)} - {new Date(item.endTime).toISOString().substring(11, 16)}
                      </div>
                      {item.costMinor > 0 && (
                        <div className="text-xs font-medium text-slate-300 mt-1">
                          ${(item.costMinor / 100).toFixed(2)} {item.currency}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.locationName && (
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center text-xs text-slate-400 gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{item.locationName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151D2A] border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Activity to Day {currentDay?.dayNumber}</h3>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto Golden Pavilion Tour"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVITY">Activity</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="LODGING">Lodging</option>
                    <option value="DINING">Dining</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estimated Cost ({baseCurrency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Location Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kinkaku-ji, Kyoto"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
