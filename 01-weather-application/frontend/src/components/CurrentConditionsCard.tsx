import React from 'react';
import { WeatherIcon } from './WeatherIcons';
import { Wind, Droplets, Gauge, Eye, Sunrise, Sunset, Cloud, AlertCircle, Clock, MapPin } from 'lucide-react';

interface CurrentConditionsProps {
  location: {
    name: string;
    administrative?: string;
    country?: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    timezone: string;
  };
  current: {
    temperature: number;
    feelsLike: number;
    weatherCode: number;
    conditionText: string;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    cloudCover?: number;
    visibility?: number;
    isDay: boolean;
    sunrise: string;
    sunset: string;
    observedAt: string;
    fetchedAt: string;
  };
  dataSource: {
    provider: string;
    attribution: string;
    isSampleData: boolean;
    isStale: boolean;
    staleReason?: string;
  };
  units: {
    temp: string;
    speed: string;
    pressure: string;
  };
}

export function CurrentConditionsCard({ location, current, dataSource, units }: CurrentConditionsProps) {
  const viewerLocalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const observedTime = current.observedAt
    ? new Date(current.observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'unavailable';
  const sunriseTime = current.sunrise
    ? new Date(current.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'unavailable';
  const sunsetTime = current.sunset
    ? new Date(current.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'unavailable';

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Stale or Sample Banner */}
      {dataSource.isStale && (
        <div className="mb-4 bg-amber-500/20 border border-amber-500/40 text-amber-200 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Stale Data Notice:</strong> {dataSource.staleReason || 'Upstream provider unavailable; showing cached telemetry.'}
          </span>
        </div>
      )}

      {dataSource.isSampleData && (
        <div className="mb-4 bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Sample data mode (deterministic development fixture)
        </div>
      )}

      {/* Header: Location & Admin Info */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-medium text-sm mb-1">
            <MapPin className="w-4 h-4" />
            <span>{location.administrative ? `${location.administrative}, ` : ''}{location.country || 'Global'}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            {location.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            {location.elevation != null ? ` • Elev: ${Math.round(location.elevation)}m` : ''} • TZ: {location.timezone}
          </p>
        </div>

        {/* Timestamps Disclosure */}
        <div className="text-right text-xs text-slate-400 space-y-0.5 bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-end gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Observed: <strong className="text-slate-200">{observedTime}</strong></span>
          </div>
          <div>Viewer Local: <strong className="text-slate-200">{viewerLocalTime}</strong></div>
          <div className="text-[10px] text-slate-500">Fetched: {new Date(current.fetchedAt).toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Main Conditions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-2xl shadow-inner">
            <WeatherIcon code={current.weatherCode} isDay={current.isDay} className="w-16 h-16" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                {current.temperature != null ? current.temperature.toFixed(1) : 'unavailable'}
              </span>
              <span className="text-2xl font-semibold text-sky-400">°{units.temp === 'FAHRENHEIT' ? 'F' : 'C'}</span>
            </div>
            <p className="text-base font-medium text-slate-300 mt-0.5 capitalize">
              {current.conditionText || 'Atmospheric condition'}
            </p>
            <p className="text-xs text-slate-400">
              Feels like <strong className="text-slate-200">{current.feelsLike != null ? current.feelsLike.toFixed(1) : 'unavailable'}°</strong> (as provided)
            </p>
          </div>
        </div>

        {/* Atmospheric Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Humidity</span>
            </div>
            <div className="text-base font-semibold text-white">
              {current.humidity != null ? `${current.humidity}%` : 'unavailable'}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Wind</span>
            </div>
            <div className="text-base font-semibold text-white">
              {current.windSpeed != null ? `${current.windSpeed.toFixed(1)} ${units.speed}` : 'unavailable'}
            </div>
            <div className="text-[10px] text-slate-400">{current.windDirection}° heading</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pressure</span>
            </div>
            <div className="text-base font-semibold text-white">
              {current.pressure != null ? `${Math.round(current.pressure)} ${units.pressure}` : 'unavailable'}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Cloud className="w-3.5 h-3.5 text-slate-400" />
              <span>Cloud Cover</span>
            </div>
            <div className="text-base font-semibold text-white">
              {current.cloudCover != null ? `${current.cloudCover}%` : 'unavailable'}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Visibility</span>
            </div>
            <div className="text-base font-semibold text-white">
              {current.visibility != null ? `${(current.visibility / 1000).toFixed(1)} km` : 'unavailable'}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-400" />
              <span>Sun Cycle</span>
            </div>
            <div className="text-xs text-white">↑ {sunriseTime}</div>
            <div className="text-xs text-slate-400">↓ {sunsetTime}</div>
          </div>
        </div>
      </div>

      {/* Attribution footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
        <span>Source: <strong>{dataSource.provider}</strong></span>
        <span className="italic">{dataSource.attribution}</span>
      </div>
    </div>
  );
}
