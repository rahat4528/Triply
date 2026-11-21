import React from 'react';
import { WeatherIcon } from './WeatherIcons';

interface HourlyForecastItem {
  time: string;
  temperature: number;
  feelsLike: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

interface HourlyForecastChartProps {
  hourly: HourlyForecastItem[];
  tempUnit: string;
}

export function HourlyForecastChart({ hourly, tempUnit }: HourlyForecastChartProps) {
  if (!hourly || hourly.length === 0) return null;

  const displayHours = hourly.slice(0, 18); // Next 18 hours
  const temps = displayHours.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Hourly Projection & Rain Likelihood</h3>
        <span className="text-xs text-slate-400">Next 18 Hours</span>
      </div>

      <div className="overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="flex items-end gap-3 min-w-[700px] h-48 pt-6 pb-2 px-2">
          {displayHours.map((item, idx) => {
            const timeLabel = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Calculate proportional height for temperature curve
            const heightPercent = 25 + ((item.temperature - minTemp) / tempRange) * 55;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                {/* Temperature label */}
                <span className="text-xs font-bold text-white mb-1 group-hover:text-sky-400 transition-colors">
                  {item.temperature.toFixed(0)}°
                </span>

                {/* Bar visualization */}
                <div
                  className="w-full max-w-[28px] bg-gradient-to-t from-sky-600/60 to-sky-400 rounded-t-md transition-all duration-300 relative group-hover:from-sky-500 group-hover:to-sky-300"
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Rain badge if rain probability > 0 */}
                  {item.precipitationProbability > 0 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-cyan-300">
                      {item.precipitationProbability}%
                    </div>
                  )}
                </div>

                {/* Weather icon */}
                <div className="mt-2.5">
                  <WeatherIcon code={item.weatherCode} className="w-5 h-5" />
                </div>

                {/* Time label */}
                <span className="text-[11px] font-medium text-slate-400 mt-1.5 whitespace-nowrap">
                  {timeLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
