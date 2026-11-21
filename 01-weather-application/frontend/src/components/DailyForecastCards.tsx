import React from 'react';
import { WeatherIcon } from './WeatherIcons';
import { Droplets, Wind } from 'lucide-react';

interface DailyForecastItem {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  weatherCode: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
}

interface DailyForecastCardsProps {
  daily: DailyForecastItem[];
  tempUnit: string;
}

export function DailyForecastCards({ daily, tempUnit }: DailyForecastCardsProps) {
  if (!daily || daily.length === 0) return null;

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">7-Day Daily Outlook</h3>
        <span className="text-xs text-slate-400">Day by Day</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {daily.slice(0, 7).map((day, idx) => {
          const dateObj = new Date(day.date);
          const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short' });
          const monthDay = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                idx === 0
                  ? 'bg-sky-950/40 border-sky-600/50 shadow-md ring-1 ring-sky-500/30'
                  : 'bg-slate-900/50 border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-200 block">{dayName}</span>
                <span className="text-[10px] text-slate-400 block mb-2">{monthDay}</span>
              </div>

              <div className="my-1.5 p-2 bg-slate-800/80 rounded-xl">
                <WeatherIcon code={day.weatherCode} className="w-8 h-8" />
              </div>

              <div className="mt-2 w-full">
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  <span className="font-bold text-white">{day.temperatureMax.toFixed(0)}°</span>
                  <span className="text-slate-400">{day.temperatureMin.toFixed(0)}°</span>
                </div>

                {day.precipitationProbabilityMax > 0 && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-400 mt-1.5">
                    <Droplets className="w-3 h-3" />
                    <span>{day.precipitationProbabilityMax}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
