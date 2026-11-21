import React from 'react';
import { MapPin, Navigation, Clock, CheckCircle2 } from 'lucide-react';

interface NearbyPlacesListProps {
  places: any[];
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  radiusMeters: number;
  onChangeRadius: (radius: number) => void;
  onSelectPlace: (place: any) => void;
  selectedPlaceId?: string;
}

export function NearbyPlacesList({
  places,
  categories,
  selectedCategory,
  onSelectCategory,
  radiusMeters,
  onChangeRadius,
  onSelectPlace,
  selectedPlaceId,
}: NearbyPlacesListProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Category Chips */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Service Categories
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === null
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Venues
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Radius Slider */}
      <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>Discovery Radius: <strong>{(radiusMeters / 1000).toFixed(1)} km</strong></span>
        </div>
        <input
          type="range"
          min="500"
          max="15000"
          step="500"
          value={radiusMeters}
          onChange={(e) => onChangeRadius(Number(e.target.value))}
          className="w-36 accent-emerald-500"
        />
      </div>

      {/* Places Items */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {places.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No venues found within {(radiusMeters / 1000).toFixed(1)} km of your location.
          </p>
        ) : (
          places.map((place) => {
            const isSelected = selectedPlaceId === place.id;
            const distanceKm = (place.distanceMeters / 1000).toFixed(2);

            return (
              <div
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{place.name}</span>
                      {place.isVerified && (
                        <span title="Verified Place">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{place.address}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40 shrink-0">
                    {distanceKm} km
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{place.openingHours || 'Open'}</span>
                  </span>
                  <span className="text-emerald-300 font-medium">{place.isOpenNow ? 'Open Now' : 'Closed'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
