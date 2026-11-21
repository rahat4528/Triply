import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
}

export function WeatherIcon({ code, isDay = true, className = 'w-8 h-8' }: WeatherIconProps) {
  // WMO code mapping
  if (code === 0) {
    return isDay ? <Sun className={`${className} text-amber-400`} /> : <Moon className={`${className} text-indigo-300`} />;
  }
  if (code === 1 || code === 2) {
    return isDay ? <CloudSun className={`${className} text-amber-300`} /> : <CloudMoon className={`${className} text-indigo-300`} />;
  }
  if (code === 3) {
    return <Cloud className={`${className} text-slate-400`} />;
  }
  if (code === 45 || code === 48) {
    return <CloudFog className={`${className} text-slate-300`} />;
  }
  if (code >= 51 && code <= 57) {
    return <CloudDrizzle className={`${className} text-cyan-400`} />;
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={`${className} text-blue-400`} />;
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return <CloudSnow className={`${className} text-sky-200`} />;
  }
  if (code >= 95) {
    return <CloudLightning className={`${className} text-yellow-400`} />;
  }

  return <Cloud className={`${className} text-slate-400`} />;
}
