import { calculateGeodesicDistance } from '../../../geolocation/geodesic';

export interface PlaceItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  isOpenNow: boolean;
  openingHours?: string;
  phone?: string;
  website?: string;
  isVerified: boolean;
  isSampleData: boolean;
}

export interface PlaceCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export class SpatialService {
  private categories: PlaceCategoryItem[] = [
    { id: 'cat-health', name: 'Healthcare', slug: 'healthcare', icon: 'cross', description: 'Hospitals and pharmacies' },
    { id: 'cat-dining', name: 'Dining & Cafes', slug: 'dining', icon: 'utensils', description: 'Restaurants and cafes' },
    { id: 'cat-transit', name: 'Public Transit', slug: 'transit', icon: 'train', description: 'Stations and transit hubs' },
    { id: 'cat-fuel', name: 'Fuel & EV Charging', slug: 'fuel-ev', icon: 'zap', description: 'Charging hubs and fuel' },
    { id: 'cat-parks', name: 'Parks & Recreation', slug: 'parks', icon: 'trees', description: 'Public parks and reserves' },
  ];

  private places: PlaceItem[] = [
    {
      id: 'plc-st-thomas',
      categoryId: 'cat-health',
      name: 'St Thomas Hospital',
      description: 'Major NHS emergency hospital on South Bank',
      address: 'Westminster Bridge Rd, London SE1 7EH',
      latitude: 51.5002,
      longitude: -0.1194,
      isOpenNow: true,
      openingHours: '24/7',
      isVerified: true,
      isSampleData: true,
    },
    {
      id: 'plc-borough-market',
      categoryId: 'cat-dining',
      name: 'Borough Market Artisans',
      description: 'Historic vibrant food market',
      address: '8 Southwark St, London SE1 1TL',
      latitude: 51.5055,
      longitude: -0.091,
      isOpenNow: true,
      openingHours: '10:00 - 17:00',
      isVerified: true,
      isSampleData: true,
    },
    {
      id: 'plc-waterloo',
      categoryId: 'cat-transit',
      name: 'Waterloo Station',
      description: 'Central London railway and subway interchange',
      address: 'Waterloo Rd, London SE1 8SW',
      latitude: 51.5032,
      longitude: -0.1123,
      isOpenNow: true,
      openingHours: '04:30 - 01:00',
      isVerified: true,
      isSampleData: true,
    },
    {
      id: 'plc-ev-hub',
      categoryId: 'cat-fuel',
      name: 'Shell Recharge Hub Southwark',
      description: 'Rapid 150kW EV charging hub',
      address: 'Blackfriars Rd, London SE1 8HW',
      latitude: 51.5048,
      longitude: -0.1035,
      isOpenNow: true,
      openingHours: '24/7 Access',
      isVerified: true,
      isSampleData: true,
    },
    {
      id: 'plc-jubilee-gardens',
      categoryId: 'cat-parks',
      name: 'Jubilee Gardens',
      description: 'Riverside public park near the London Eye',
      address: 'Belvedere Rd, London SE1 7PG',
      latitude: 51.5036,
      longitude: -0.1189,
      isOpenNow: true,
      openingHours: '24 Hours',
      isVerified: true,
      isSampleData: true,
    },
  ];

  getCategories(): PlaceCategoryItem[] {
    return this.categories;
  }

  /**
   * Spatial search simulating PostGIS ST_DWithin and distance ordering
   */
  findNearby(options: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
    categoryId?: string;
    openNowOnly?: boolean;
    searchTerm?: string;
  }): Array<PlaceItem & { distanceMeters: number }> {
    const { latitude, longitude, radiusMeters, categoryId, openNowOnly, searchTerm } = options;

    return this.places
      .map((place) => {
        const distanceMeters = calculateGeodesicDistance(latitude, longitude, place.latitude, place.longitude);
        return { ...place, distanceMeters };
      })
      .filter((place) => {
        if (place.distanceMeters > radiusMeters) return false;
        if (categoryId && place.categoryId !== categoryId) return false;
        if (openNowOnly && !place.isOpenNow) return false;
        if (searchTerm && !place.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  addPlace(place: Omit<PlaceItem, 'id' | 'isVerified' | 'isSampleData'>): PlaceItem {
    const newPlace: PlaceItem = {
      id: `plc-${Date.now()}`,
      ...place,
      isVerified: true,
      isSampleData: true,
    };
    this.places.push(newPlace);
    return newPlace;
  }
}

export const globalSpatialService = new SpatialService();
