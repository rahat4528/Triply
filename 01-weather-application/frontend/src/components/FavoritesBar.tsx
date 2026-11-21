import React from 'react';
import { Star, MapPin, Plus } from 'lucide-react';

export interface SavedLocation {
  id: string;
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface FavoritesBarProps {
  favorites: SavedLocation[];
  activeLocation: { latitude: number; longitude: number };
  onSelect: (loc: SavedLocation) => void;
  onOpenSearch: () => void;
}

export function FavoritesBar({ favorites, activeLocation, onSelect, onOpenSearch }: FavoritesBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-sky-400 hover:text-sky-300 transition-colors shrink-0 shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Place</span>
      </button>

      {favorites.map((fav) => {
        const isActive =
          Math.abs(fav.latitude - activeLocation.latitude) < 0.05 &&
          Math.abs(fav.longitude - activeLocation.longitude) < 0.05;

        return (
          <button
            key={fav.id}
            onClick={() => onSelect(fav)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
              isActive
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-400'
                : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Star className={`w-3 h-3 ${isActive ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
            <span>{fav.name}</span>
          </button>
        );
      })}
    </div>
  );
}
