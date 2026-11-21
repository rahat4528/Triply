'use client';

import React, { useState } from 'react';
import { Calendar, Download, Users, DollarSign, MapPin, Sparkles } from 'lucide-react';
import { ItineraryTimeline } from '@/components/ItineraryTimeline';
import { BudgetTracker } from '@/components/BudgetTracker';
import { TripMapPanel } from '@/components/TripMapPanel';
import { ChecklistPanel } from '@/components/ChecklistPanel';
import { CompanionModal } from '@/components/CompanionModal';

// Initial state representing our Japan Alpine trip
const initialTrip = {
  id: 'trip-japan-alpine-2026',
  title: 'Alpine Japan & Coastal Kansai Expedition',
  description: 'An immersive 8-day journey through Tokyo, the Japanese Alps in Takayama, and historic Kyoto.',
  coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600',
  startDate: '2026-10-10',
  endDate: '2026-10-17',
  baseCurrency: 'USD',
  budgetLimitMinor: 450000,
  destinations: [
    { id: 'dest-01', name: 'Tokyo', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', sequence: 1 },
    { id: 'dest-02', name: 'Takayama (Gifu Alps)', countryCode: 'JP', latitude: 36.1461, longitude: 137.2522, timezone: 'Asia/Tokyo', sequence: 2 },
    { id: 'dest-03', name: 'Kyoto', countryCode: 'JP', latitude: 35.0116, longitude: 135.7681, timezone: 'Asia/Tokyo', sequence: 3 }
  ],
  members: [
    { id: 'mem-01', name: 'Elena Rostova', email: 'elena.rostova@example.com', role: 'OWNER' as const },
    { id: 'mem-02', name: 'Marcus Vance', email: 'marcus.vance@example.com', role: 'EDITOR' as const },
    { id: 'mem-03', name: 'Sophia Chen', email: 'sophia.chen@example.com', role: 'VIEWER' as const }
  ],
  days: [
    {
      id: 'day-01',
      dayNumber: 1,
      date: '2026-10-10T00:00:00.000Z',
      title: 'Arrival & Shinjuku Nightfall',
      items: [
        {
          id: 'item-01-01',
          title: 'Flight Arrival: SFO -> HND',
          itemType: 'TRANSPORT' as const,
          startTime: '2026-10-10T14:30:00.000Z',
          endTime: '2026-10-10T16:00:00.000Z',
          timezone: 'Asia/Tokyo',
          latitude: 35.5494,
          longitude: 139.7798,
          locationName: 'Haneda International Airport (HND)',
          costMinor: 112000,
          currency: 'USD',
          bookingReference: 'JL001-C7',
          notes: 'Clear customs and collect Pocket Wi-Fi router from terminal counter.'
        },
        {
          id: 'item-01-02',
          title: 'Hotel Check-In: Shinjuku Granbell',
          itemType: 'LODGING' as const,
          startTime: '2026-10-10T17:30:00.000Z',
          endTime: '2026-10-10T18:30:00.000Z',
          timezone: 'Asia/Tokyo',
          latitude: 35.6961,
          longitude: 139.7056,
          locationName: 'Shinjuku Granbell Hotel',
          costMinor: 48000,
          currency: 'USD',
          bookingReference: 'BK-GRAN-884'
        },
        {
          id: 'item-01-03',
          title: 'Omoide Yokocho Yakitori Dinner',
          itemType: 'DINING' as const,
          startTime: '2026-10-10T19:30:00.000Z',
          endTime: '2026-10-10T21:30:00.000Z',
          timezone: 'Asia/Tokyo',
          latitude: 35.6932,
          longitude: 139.6997,
          locationName: 'Omoide Yokocho Alleyway',
          costMinor: 6500,
          currency: 'JPY',
          notes: 'Cash only. Atmospheric traditional charcoal grill dining.'
        }
      ]
    },
    {
      id: 'day-02',
      dayNumber: 2,
      date: '2026-10-11T00:00:00.000Z',
      title: 'Cultural Heritage in Asakusa & Akihabara Tech',
      items: [
        {
          id: 'item-02-01',
          title: 'Senso-ji Temple Morning Walk',
          itemType: 'ACTIVITY' as const,
          startTime: '2026-10-11T08:30:00.000Z',
          endTime: '2026-10-11T11:00:00.000Z',
          timezone: 'Asia/Tokyo',
          latitude: 35.7148,
          longitude: 139.7967,
          locationName: 'Senso-ji Temple, Asakusa',
          costMinor: 0,
          currency: 'JPY',
          notes: 'Oldest Buddhist temple in Tokyo. Nakamise shopping street treats.'
        }
      ]
    },
    {
      id: 'day-03',
      dayNumber: 3,
      date: '2026-10-12T00:00:00.000Z',
      title: 'Limited Express Train to Hida-Takayama',
      items: [
        {
          id: 'item-03-01',
          title: 'JR Limited Express Hida Wide View',
          itemType: 'TRANSPORT' as const,
          startTime: '2026-10-12T08:00:00.000Z',
          endTime: '2026-10-12T12:30:00.000Z',
          timezone: 'Asia/Tokyo',
          latitude: 36.1413,
          longitude: 137.2514,
          locationName: 'Takayama Station',
          costMinor: 31000,
          currency: 'JPY',
          bookingReference: 'JR-HIDA-441',
          notes: 'Panoramic windows through the Hida river gorges.'
        }
      ]
    }
  ],
  expenses: [
    { id: 'exp-01', description: 'Return Flights SFO-HND (Elena & Marcus)', amountMinor: 224000, currency: 'USD', category: 'TRANSPORT', date: '2026-09-15T12:00:00.000Z', paidByUserId: 'usr-01', amountInBaseCurrencyMinor: 224000 },
    { id: 'exp-02', description: 'Shinjuku Granbell Lodging (2 nights)', amountMinor: 48000, currency: 'USD', category: 'ACCOMMODATION', date: '2026-10-10T18:00:00.000Z', paidByUserId: 'usr-01', amountInBaseCurrencyMinor: 48000 },
    { id: 'exp-03', description: 'JR Hokuriku Arch Shinkansen Passes (x2)', amountMinor: 60000, currency: 'JPY', category: 'TRANSPORT', date: '2026-10-01T09:00:00.000Z', paidByUserId: 'usr-02', amountInBaseCurrencyMinor: 40200 },
    { id: 'exp-04', description: 'Tokyo Welcome Banquet & Izakaya Feast', amountMinor: 15000, currency: 'JPY', category: 'MEALS', date: '2026-10-10T21:00:00.000Z', paidByUserId: 'usr-02', amountInBaseCurrencyMinor: 10050 }
  ],
  checklist: [
    { id: 'chk-01', title: 'Verify passport validity (min 6 months)', category: 'Documents', isCompleted: true },
    { id: 'chk-02', title: 'Submit Visit Japan Web immigration QR code', category: 'Documents', isCompleted: true },
    { id: 'chk-03', title: 'Reserve Pocket Wi-Fi device pickup', category: 'Electronics', isCompleted: true },
    { id: 'chk-04', title: 'Pack Type-A two-prong plug travel adapters', category: 'Electronics', isCompleted: false },
    { id: 'chk-05', title: 'Notify banks of overseas ATM card usage', category: 'Finance', isCompleted: false },
    { id: 'chk-06', title: 'Thermal layers & hiking shoes for Japanese Alps', category: 'Clothing', isCompleted: false }
  ]
};

export default function TravelPlannerPage() {
  const [activeTab, setActiveTab] = useState<'ITINERARY' | 'BUDGET' | 'MAP' | 'CHECKLIST'>('ITINERARY');
  const [trip, setTrip] = useState(initialTrip);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleAddItem = (dayId: string, item: any) => {
    setTrip((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? { ...d, items: [...d.items, { id: `item-${Date.now()}`, ...item }] } : d))
    }));
  };

  const handleAddExpense = (exp: any) => {
    setTrip((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { id: `exp-${Date.now()}`, ...exp }]
    }));
  };

  const handleToggleChecklist = (id: string) => {
    setTrip((prev) => ({
      ...prev,
      checklist: prev.checklist.map((c) => (c.id === id ? { ...c, isCompleted: !c.isCompleted } : c))
    }));
  };

  const handleAddChecklist = (title: string, category: string) => {
    setTrip((prev) => ({
      ...prev,
      checklist: [...prev.checklist, { id: `chk-${Date.now()}`, title, category, isCompleted: false }]
    }));
  };

  const handleInvite = (email: string, role: 'EDITOR' | 'VIEWER') => {
    setTrip((prev) => ({
      ...prev,
      members: [...prev.members, { id: `mem-${Date.now()}`, name: email.split('@')[0], email, role }]
    }));
    setShowInviteModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      {/* Hero Header with Trip Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-slate-800">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover object-center filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
                8 Days • 3 Hubs
              </span>
              <span className="text-xs text-slate-300 font-medium">Oct 10 – Oct 17, 2026</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">{trip.title}</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">{trip.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-semibold transition backdrop-blur shadow"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              {trip.members.length} Companions
            </button>
            <a
              href="/api/v1/trips/trip-japan-alpine-2026/calendar.ics"
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              Sync iCal (.ics)
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Header */}
      <div className="bg-[#151D2A] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('ITINERARY')}
            className={`py-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'ITINERARY'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Itinerary Schedule
          </button>
          <button
            onClick={() => setActiveTab('BUDGET')}
            className={`py-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'BUDGET'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Budget & Expenses
          </button>
          <button
            onClick={() => setActiveTab('MAP')}
            className={`py-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'MAP'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Route Map
          </button>
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`py-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'CHECKLIST'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Packing Checklist
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'ITINERARY' && (
          <ItineraryTimeline
            days={trip.days}
            baseCurrency={trip.baseCurrency}
            onAddItem={handleAddItem}
          />
        )}
        {activeTab === 'BUDGET' && (
          <BudgetTracker
            baseCurrency={trip.baseCurrency}
            budgetLimitMinor={trip.budgetLimitMinor}
            expenses={trip.expenses}
            companionCount={trip.members.length}
            onAddExpense={handleAddExpense}
          />
        )}
        {activeTab === 'MAP' && (
          <TripMapPanel destinations={trip.destinations} />
        )}
        {activeTab === 'CHECKLIST' && (
          <ChecklistPanel
            items={trip.checklist}
            onToggleItem={handleToggleChecklist}
            onAddItem={handleAddChecklist}
          />
        )}
      </main>

      {/* Companion Modal */}
      <CompanionModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        members={trip.members}
        onSendInvite={handleInvite}
      />
    </div>
  );
}
