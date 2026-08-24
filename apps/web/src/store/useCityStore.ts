import { create } from 'zustand';
import { CityOverview, ClimateOverview, FoodOverview, LocationOverview, CultureOverview } from '@/types';

interface CityStore {
  currentCityId: string | null;
  overview: CityOverview | null;
  climate: ClimateOverview | null;
  food: FoodOverview | null;
  location: LocationOverview | null;
  culture: CultureOverview | null;
  loading: boolean;
  
  setCityData: (data: Partial<Omit<CityStore, 'setCityData' | 'setLoading'>>) => void;
  setLoading: (loading: boolean) => void;
  clearCity: () => void;
}

export const useCityStore = create<CityStore>((set) => ({
  currentCityId: null,
  overview: null,
  climate: null,
  food: null,
  location: null,
  culture: null,
  loading: false,

  setCityData: (data) => set((state) => ({ ...state, ...data })),
  setLoading: (loading) => set({ loading }),
  clearCity: () => set({
    currentCityId: null,
    overview: null,
    climate: null,
    food: null,
    location: null,
    culture: null,
    loading: false
  })
}));
