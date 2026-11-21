'use client';

import React, { useState, useEffect } from 'react';
import { MapInteractive } from '../components/MapInteractive';
import { NearbyPlacesList } from '../components/NearbyPlacesList';
import { LocationConsentBanner } from '../components/LocationConsentBanner';
import { GeofenceManagerModal } from '../components/GeofenceManagerModal';
import { LocationSharingModal } from '../components/LocationSharingModal';
import { PrivacyCenterModal } from '../components/PrivacyCenterModal';
import { Radio, Share2, Shield, MapPin, Play, Square } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';

export default function LocationServicePage() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    source: 'DEVICE' | 'MANUAL' | 'SIMULATED';
  } | null>(null);

  const [places, setPlaces] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  const [geofences, setGeofences] = useState<any[]>([]);
  const [geofenceEvents, setGeofenceEvents] = useState<any[]>([]);
  const [activeShares, setActiveShares] = useState<any[]>([]);
  const [liveSessionActive, setLiveSessionActive] = useState(false);

  // Modals
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Load categories and initial geofences
  useEffect(() => {
    fetch(`${API_BASE}/places/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});

    fetch(`${API_BASE}/geofences`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGeofences(data);
      })
      .catch(() => {});

    fetch(`${API_BASE}/shares/active`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setActiveShares(data);
      })
      .catch(() => {});
  }, []);

  // Fetch nearby places when location or filters change
  useEffect(() => {
    const lat = userLocation?.latitude || 51.5045;
    const lon = userLocation?.longitude || -0.1145;

    let url = `${API_BASE}/places/nearby?lat=${lat}&lon=${lon}&radius=${radiusMeters}`;
    if (selectedCategory) url += `&category=${selectedCategory}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.places) setPlaces(data.places);
      })
      .catch(() => {});
  }, [userLocation, selectedCategory, radiusMeters]);

  // Handle granting consent / setting coordinates
  const handleGrantConsent = async (source: 'DEVICE' | 'MANUAL' | 'SIMULATED', coords?: { lat: number; lon: number }) => {
    const lat = coords?.lat || 51.5045;
    const lon = coords?.lon || -0.1145;

    setUserLocation({
      latitude: lat,
      longitude: lon,
      accuracy: source === 'DEVICE' ? 15 : source === 'SIMULATED' ? 10 : 25,
      source,
    });

    // Send ping to backend
    try {
      const resp = await fetch(`${API_BASE}/locations/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          accuracy: source === 'DEVICE' ? 15 : 10,
          source,
          clientUpdateId: `ping-${Date.now()}`,
        }),
      });
      const json = await resp.json();
      if (json.events && json.events.length > 0) {
        setGeofenceEvents((prev) => [...json.events, ...prev]);
      }
    } catch {}
  };

  const toggleLiveSession = async () => {
    if (liveSessionActive) {
      await fetch(`${API_BASE}/locations/session/stop`, { method: 'POST' });
      setLiveSessionActive(false);
    } else {
      await fetch(`${API_BASE}/locations/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: userLocation?.source || 'DEVICE' }),
      });
      setLiveSessionActive(true);
    }
  };

  const handleAddGeofence = async (fence: any) => {
    try {
      const resp = await fetch(`${API_BASE}/geofences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fence),
      });
      const created = await resp.json();
      setGeofences((prev) => [...prev, created]);
    } catch {}
  };

  const handleDeleteGeofence = async (id: string) => {
    try {
      await fetch(`${API_BASE}/geofences/${id}`, { method: 'DELETE' });
      setGeofences((prev) => prev.filter((g) => g.id !== id));
    } catch {}
  };

  const handleCreateShare = async (recipientEmail: string, durationMinutes: number) => {
    if (!userLocation) return;
    try {
      const resp = await fetch(`${API_BASE}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          durationMinutes,
        }),
      });
      const json = await resp.json();
      if (json.share) setActiveShares((prev) => [...prev, json.share]);
    } catch {}
  };

  const handleRevokeShare = async (id: string) => {
    try {
      await fetch(`${API_BASE}/shares/${id}/revoke`, { method: 'DELETE' });
      setActiveShares((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">Triply Location Service</span>
              <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2 font-mono">v1.0</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live session indicator & toggle */}
            <button
              onClick={toggleLiveSession}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm ${
                liveSessionActive
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
              }`}
            >
              {liveSessionActive ? (
                <>
                  <Square className="w-3 h-3 text-red-400" />
                  <span>Stop Live Session</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>Start Live Session</span>
                </>
              )}
            </button>

            {/* Geofence modal toggle */}
            <button
              onClick={() => setIsGeofenceModalOpen(true)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
              title="Geofence Manager"
            >
              <Radio className="w-4 h-4" />
            </button>

            {/* Sharing modal toggle */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
              title="Location Sharing"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Privacy center toggle */}
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
              title="Privacy Center"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 flex-1">
        {/* Privacy & Consent Banner */}
        <LocationConsentBanner
          onGrantConsent={handleGrantConsent}
          currentSource={userLocation?.source || null}
          permissionState={userLocation ? 'GRANTED' : 'PROMPT'}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Section */}
          <div className="lg:col-span-7">
            <MapInteractive
              userLocation={userLocation}
              places={places}
              geofences={geofences}
              onSelectPlace={(p) => setSelectedPlace(p)}
              selectedPlace={selectedPlace}
            />
          </div>

          {/* Nearby Discovery Section */}
          <div className="lg:col-span-5">
            <NearbyPlacesList
              places={places}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(c) => setSelectedCategory(c)}
              radiusMeters={radiusMeters}
              onChangeRadius={(r) => setRadiusMeters(r)}
              onSelectPlace={(p) => setSelectedPlace(p)}
              selectedPlaceId={selectedPlace?.id}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/40 py-6 text-center text-xs text-slate-400 space-y-1">
        <p>Triply Location-Based Service • Consented Geospatial Proximity & Geofencing</p>
        <p className="text-[11px] text-slate-400">
          Geodesic calculations in canonical WGS84 • PostGIS geography indexing • Privacy-first design
        </p>
      </footer>

      {/* Modals */}
      <GeofenceManagerModal
        isOpen={isGeofenceModalOpen}
        onClose={() => setIsGeofenceModalOpen(false)}
        geofences={geofences}
        events={geofenceEvents}
        userLocation={userLocation}
        onAddGeofence={handleAddGeofence}
        onDeleteGeofence={handleDeleteGeofence}
      />

      <LocationSharingModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeShares={activeShares}
        userLocation={userLocation}
        onCreateShare={handleCreateShare}
        onRevokeShare={handleRevokeShare}
      />

      <PrivacyCenterModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        apiUrl={API_BASE}
      />
    </div>
  );
}
