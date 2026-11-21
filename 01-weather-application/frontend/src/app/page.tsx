'use client';

import React, { useState, useEffect } from 'react';
import { CurrentConditionsCard } from '../components/CurrentConditionsCard';
import { HourlyForecastChart } from '../components/HourlyForecastChart';
import { DailyForecastCards } from '../components/DailyForecastCards';
import { FavoritesBar, SavedLocation } from '../components/FavoritesBar';
import { LocationSearchModal } from '../components/LocationSearchModal';
import { AlertRulesModal } from '../components/AlertRulesModal';
import { ComparisonModal } from '../components/ComparisonModal';
import { HistoricalModal } from '../components/HistoricalModal';
import { WidgetModal } from '../components/WidgetModal';
import { Search, Bell, Layers, Calendar, Code, CloudLightning, RefreshCw, WifiOff } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

export default function WeatherDashboardPage() {
  const [activeLocation, setActiveLocation] = useState({
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  });

  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineTimestamp, setOfflineTimestamp] = useState<string | null>(null);

  // Units
  const [tempUnit, setTempUnit] = useState<'CELSIUS' | 'FAHRENHEIT'>('CELSIUS');
  const [speedUnit, setSpeedUnit] = useState<'KM_H' | 'MPH' | 'M_S' | 'KNOTS'>('KM_H');
  const [pressureUnit, setPressureUnit] = useState<'HPA' | 'INHG' | 'MMHG'>('HPA');

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // Network offline listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      setOfflineTimestamp(new Date().toLocaleTimeString());
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch favorites
  useEffect(() => {
    fetch(`${API_BASE}/locations/favorites`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFavorites(data);
      })
      .catch(() => {});
  }, []);

  // Fetch weather data whenever activeLocation or units change
  const fetchWeather = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${API_BASE}/weather/current?lat=${activeLocation.latitude}&lon=${activeLocation.longitude}&tempUnit=${tempUnit}&speedUnit=${speedUnit}&pressureUnit=${pressureUnit}`
      );
      if (resp.ok) {
        const json = await resp.json();
        setWeatherData(json);
      }
    } catch {
      // Offline fallback handling
      setIsOffline(true);
      setOfflineTimestamp(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [activeLocation, tempUnit, speedUnit, pressureUnit]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl">
              <CloudLightning className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">Triply Weather</span>
              <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2 font-mono">v1.0</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 transition-colors shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Search city or coordinates...</span>
              <span className="md:hidden">Search</span>
            </button>

            {/* Units Toggle */}
            <button
              onClick={() => setTempUnit((prev) => (prev === 'CELSIUS' ? 'FAHRENHEIT' : 'CELSIUS'))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-sky-400 transition-colors"
              title="Toggle Temperature Unit"
            >
              °{tempUnit === 'CELSIUS' ? 'C' : 'F'}
            </button>

            {/* Action Buttons */}
            <button
              onClick={() => setIsAlertsOpen(true)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-colors"
              title="Alert Rules & Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCompareOpen(true)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-sky-400 border border-slate-700/60 transition-colors"
              title="Multi-Location Comparison"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 border border-slate-700/60 transition-colors"
              title="Historical Reanalysis Archive"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsWidgetOpen(true)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-teal-400 border border-slate-700/60 transition-colors"
              title="Embeddable Widget"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 flex-1">
        {/* Offline notice if disconnected */}
        {isOffline && (
          <div className="bg-amber-950/50 border border-amber-600/50 p-3 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span>Offline mode: Displaying last cached telemetry from {offlineTimestamp || 'cache'}.</span>
            </div>
            <button onClick={fetchWeather} className="flex items-center gap-1 font-semibold text-amber-300 hover:underline">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Favorites bar */}
        <FavoritesBar
          favorites={favorites}
          activeLocation={activeLocation}
          onSelect={(loc) =>
            setActiveLocation({
              name: loc.name,
              latitude: loc.latitude,
              longitude: loc.longitude,
              timezone: loc.timezone,
            })
          }
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Primary Conditions Card */}
        {weatherData && (
          <CurrentConditionsCard
            location={{
              ...weatherData.location,
              name: activeLocation.name || weatherData.location.name,
            }}
            current={weatherData.current}
            dataSource={weatherData.dataSource}
            units={{
              temp: tempUnit,
              speed: speedUnit,
              pressure: pressureUnit,
            }}
          />
        )}

        {/* Hourly Projection */}
        {weatherData && weatherData.hourly && (
          <HourlyForecastChart hourly={weatherData.hourly} tempUnit={tempUnit} />
        )}

        {/* 7-Day Daily Projection */}
        {weatherData && weatherData.daily && (
          <DailyForecastCards daily={weatherData.daily} tempUnit={tempUnit} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-400 space-y-1">
        <p>Triply Weather Application • Meteorological Information & Geospatial Telemetry</p>
        <p className="text-[11px] text-slate-400">
          Data provided under CC BY 4.0 by Open-Meteo.com • Geocoding via Open-Meteo Geocoding API
        </p>
      </footer>

      {/* Modals */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={(loc) => setActiveLocation(loc)}
        apiUrl={API_BASE}
      />
      <AlertRulesModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        currentLocation={activeLocation}
        apiUrl={API_BASE}
      />
      <ComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        apiUrl={API_BASE}
      />
      <HistoricalModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        location={activeLocation}
        apiUrl={API_BASE}
      />
      <WidgetModal
        isOpen={isWidgetOpen}
        onClose={() => setIsWidgetOpen(false)}
        location={activeLocation}
        apiUrl={API_BASE}
      />
    </div>
  );
}
