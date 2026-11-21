'use client';

import React, { useState, useEffect } from 'react';
import { WeatherIcon } from '../../../components/WeatherIcons';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

export default function EmbeddedWidgetPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/widgets/${params.token}/data`)
      .then((r) => {
        if (!r.ok) throw new Error('Widget token invalid or expired');
        return r.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, [params.token]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[160px] bg-slate-900 text-red-300 p-4 rounded-xl flex items-center justify-center text-xs">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full min-h-[160px] bg-slate-900 text-slate-400 p-4 rounded-xl flex items-center justify-center text-xs animate-pulse">
        Loading atmospheric telemetry...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[160px] bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-white">{data.locationName}</h4>
          <span className="text-[10px] text-slate-400 capitalize">{data.current.conditionText}</span>
        </div>
        <WeatherIcon code={data.current.weatherCode} className="w-8 h-8" />
      </div>

      <div className="my-2">
        <span className="text-3xl font-extrabold text-sky-400">{data.current.temperature.toFixed(1)}°C</span>
        <span className="text-[11px] text-slate-400 ml-2">Feels {data.current.feelsLike.toFixed(1)}°</span>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span>Wind: {data.current.windSpeed} km/h</span>
        <span>Humidity: {data.current.humidity}%</span>
      </div>
    </div>
  );
}
