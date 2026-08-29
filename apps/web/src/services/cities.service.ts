import { api } from './api';
import {
  CitySummary,
  CityOverview,
  ClimateOverview,
  ClimateData,
  FoodOverview,
  LocationOverview,
  NeighborhoodData,
  CultureOverview,
  UserPreferenceProfile,
} from '@/types';

// ── Unsplash fallback images by country code ──────────────────────────────────
const COUNTRY_IMAGE: Record<string, string> = {
  BR: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=800',
  PT: 'https://images.unsplash.com/photo-1585218356057-dc0e8d355888?w=800',
  DE: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
  JP: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
  US: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800',
  CA: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
  ES: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
  NL: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
  IT: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  PL: 'https://images.unsplash.com/photo-1559541919-e79bc157a657?w=800',
  TH: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800',
  SG: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
  KR: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
  VN: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
  ID: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  AE: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=800',
  AU: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
  ZA: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
  KE: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
  AR: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
  CL: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
  CO: 'https://images.unsplash.com/photo-1561832772-d01a2c4dd7cb?w=800',
  PE: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
  MX: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
};

function mapCityToSummary(city: any): CitySummary {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    countryCode: city.countryCode,
    imageUrl: city.imageUrl || COUNTRY_IMAGE[city.countryCode] || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
    // Backend doesn't store tagline — generate a sensible client-side placeholder
    tagline: city.tagline ?? `${city.country}`,
  };
}

// Thermal comfort mapping: backend uses EXCELLENT/GOOD/FAIR/POOR/UNBEARABLE
// Frontend type uses IDEAL/TOLERABLE/UNCOMFORTABLE
function mapComfort(comfort: string): ClimateData['thermalComfort'] {
  if (comfort === 'EXCELLENT' || comfort === 'GOOD') return 'IDEAL';
  if (comfort === 'FAIR') return 'TOLERABLE';
  return 'UNCOMFORTABLE';
}

// CostTier mapping: backend uses LOW/MEDIUM/HIGH
// Frontend NeighborhoodData uses BUDGET/MID/PREMIUM
function mapCostTier(tier: string): NeighborhoodData['costTier'] {
  if (tier === 'LOW') return 'BUDGET';
  if (tier === 'HIGH') return 'PREMIUM';
  return 'MID';
}

function generateClimateSummary(score: number, idealMonths: number[]): string {
  if (score >= 80) return `Excelente clima durante o ano com ${idealMonths.length} meses ideais.`;
  if (score >= 60) return `Clima agradável na maior parte do ano com ${idealMonths.length} meses ideais.`;
  if (score >= 40) return `Clima variado — confira os meses ideais para planejar sua estadia.`;
  return `Clima desafiador para este perfil — considere a época do ano com cuidado.`;
}

function generateFoodSummary(score: number): string {
  if (score >= 80) return 'Ótima compatibilidade gastronômica. Você vai se sentir em casa.';
  if (score >= 50) return 'Boa oferta gastronômica com algumas lacunas nos seus alimentos preferidos.';
  return 'Pode ser difícil encontrar seus alimentos de conforto aqui.';
}

function generateCultureSummary(score: number): string {
  if (score >= 80) return 'Alta receptividade cultural. Adaptação tende a ser fácil e natural.';
  if (score >= 50) return 'Adaptação cultural moderada — algumas diferenças notáveis mas superáveis.';
  return 'Diferenças culturais significativas que podem exigir mais tempo de adaptação.';
}

/** Compute a client-side language score heuristic based on LANGUAGE insights. */
function computeLanguageScore(insights: any[]): number {
  let score = 100;
  for (const ins of insights) {
    if (ins.category === 'LANGUAGE') {
      // Language/WARNING = strong barrier (-15), LANGUAGE/CAUTION = mild barrier (-8)
      if (ins.severity === 'WARNING') score -= 15;
      else if (ins.severity === 'CAUTION') score -= 8;
    }
  }
  return Math.max(score, 10);
}

// ── Empty state factories (used when backend has no data) ─────────────────────

const EMPTY_CLIMATE: ClimateOverview = {
  score: 0,
  idealMonths: [],
  monthlyData: [],
  summary: 'Dados climáticos não disponíveis para esta cidade ainda.',
};

const EMPTY_FOOD: FoodOverview = {
  score: 0,
  availableFoods: [],
  missingFoods: [],
  topEstablishments: [],
  summary: 'Dados gastronômicos não disponíveis para esta cidade ainda.',
};

const EMPTY_LOCATION: LocationOverview = {
  score: 0,
  neighborhoods: [],
};

const EMPTY_CULTURE: CultureOverview = {
  receptivityScore: 0,
  languageScore: 0,
  insights: [],
  summary: 'Dados culturais não disponíveis para esta cidade ainda.',
};

// ─────────────────────────────────────────────────────────────────────────────

export const citiesService = {
  async searchCities(q: string): Promise<CitySummary[]> {
    try {
      if (!q || q.trim().length < 2) return [];
      const { data } = await api.get<any[]>(`/cities/search?q=${encodeURIComponent(q)}`);
      return data.map(mapCityToSummary);
    } catch {
      return [];
    }
  },

  async getPopularCities(): Promise<CitySummary[]> {
    try {
      // Empty query → backend returns up to 12 cities ordered by name
      const { data } = await api.get<any[]>('/cities/search?q=');
      return data.map(mapCityToSummary);
    } catch {
      return [];
    }
  },

  async getCityOverview(cityId: string, profile?: Partial<UserPreferenceProfile>): Promise<CityOverview> {
    try {
      const { data } = await api.post<any>(`/cities/${cityId}/overview`, { profile: profile ?? {} });
      return {
        city: mapCityToSummary(data.city),
        overallScore: data.overallScore ?? 50,
      };
    } catch {
      // Fallback: resolve city name at minimum
      try {
        const { data: city } = await api.get<any>(`/cities/${cityId}`);
        return { city: mapCityToSummary(city), overallScore: 50 };
      } catch {
        return { city: { id: cityId, name: '—', country: '—', countryCode: '', imageUrl: '', tagline: '' }, overallScore: 0 };
      }
    }
  },

  async getCityClimate(cityId: string, sensitivity?: string): Promise<ClimateOverview> {
    try {
      const senParam = sensitivity ?? 'TOLERANT';
      const [rawRes, compatRes] = await Promise.all([
        api.get<any[]>(`/cities/${cityId}/climate`),
        api.get<any[]>(`/cities/${cityId}/climate/compatibility?sensitivity=${senParam}`),
      ]);

      const rawData: any[] = rawRes.data ?? [];
      const compatData: any[] = compatRes.data ?? [];
      if (rawData.length === 0) return EMPTY_CLIMATE;

      // Merge by month index (both arrays are ordered 1-12)
      const compatByMonth: Record<number, any> = {};
      for (const c of compatData) compatByMonth[c.month] = c;

      const monthlyData: ClimateData[] = rawData.map((r) => {
        const compat = compatByMonth[r.month] ?? { score: 50, comfort: 'FAIR' };
        return {
          month: r.month,
          avgTemp: Math.round(((r.avgTempMin + r.avgTempMax) / 2) * 10) / 10,
          minTemp: r.avgTempMin,
          maxTemp: r.avgTempMax,
          humidity: r.avgHumidity,
          thermalComfort: mapComfort(compat.comfort),
          description: r.description ?? '',
        };
      });

      const scores = compatData.map((c) => c.score);
      const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
      const idealMonths = compatData
        .filter((c) => c.comfort === 'EXCELLENT' || c.comfort === 'GOOD')
        .map((c) => c.month);

      return {
        score: avgScore,
        idealMonths,
        monthlyData,
        summary: generateClimateSummary(avgScore, idealMonths),
      };
    } catch {
      return EMPTY_CLIMATE;
    }
  },

  async getFoodCompatibility(cityId: string, comfortFoods?: string[]): Promise<FoodOverview> {
    try {
      const foodsParam = (comfortFoods ?? []).join(',');
      const [rawRes, compatRes] = await Promise.all([
        api.get<any[]>(`/cities/${cityId}/food`),
        api.get<any>(`/cities/${cityId}/food/compatibility?comfortFoods=${encodeURIComponent(foodsParam)}`),
      ]);

      const establishments: any[] = rawRes.data ?? [];
      const compat = compatRes.data ?? { score: 100, matchedTags: [] };
      if (establishments.length === 0) return EMPTY_FOOD;

      // Collect unique cuisines present in the city
      const cuisineSet = new Set<string>();
      establishments.forEach((e) => (e.servesCuisines ?? []).forEach((c: string) => cuisineSet.add(c)));
      const availableFoods = [...cuisineSet].slice(0, 10);

      // Missing = comfort foods NOT in matchedTags
      const matched: string[] = compat.matchedTags ?? [];
      const missingFoods = (comfortFoods ?? []).filter((f) => !matched.includes(f));

      const topEstablishments = establishments.slice(0, 5).map((e) => ({
        name: e.name,
        cuisine: (e.servesCuisines?.[0] ?? 'Restaurant'),
        priceTier: ('$'.repeat(Math.max(1, Math.min(4, e.priceRange ?? 2)))) as '$' | '$$' | '$$$' | '$$$$',
      }));

      return {
        score: Math.round(compat.score ?? 100),
        availableFoods,
        missingFoods,
        topEstablishments,
        summary: generateFoodSummary(compat.score ?? 100),
      };
    } catch {
      return EMPTY_FOOD;
    }
  },

  async getNeighborhoods(cityId: string, budget?: number, currency?: string): Promise<LocationOverview> {
    try {
      const b = budget ?? 2000;
      const c = currency ?? 'USD';
      const { data } = await api.get<any[]>(
        `/cities/${cityId}/neighborhoods/match?budget=${b}&currency=${c}`,
      );

      const neighborhoods: any[] = data ?? [];
      if (neighborhoods.length === 0) return EMPTY_LOCATION;

      // Find the neighborhood with lowest monthlyTotal within budget (recommended)
      let minTotal = Infinity;
      let recommendedId = '';
      for (const n of neighborhoods) {
        const total = n.costOfLiving?.monthlyTotal ?? Infinity;
        if (total < minTotal) {
          minTotal = total;
          recommendedId = n.id;
        }
      }

      const mappedNeighborhoods: NeighborhoodData[] = neighborhoods.map((n) => {
        const col = n.costOfLiving ?? {};
        return {
          id: n.id,
          name: n.name,
          costTier: mapCostTier(n.costTier),
          monthlyCost: {
            rent: col.rentOneBedroom ?? 0,
            food: col.groceriesMonthly ?? 0,
            transport: col.transportMonthly ?? 0,
            utilities: col.utilities ?? 0,
            total: col.monthlyTotal ?? 0,
          },
          // Recommended = lowest-cost neighborhood within the returned (budget-filtered) list
          isRecommended: n.id === recommendedId,
        };
      });

      // Score heuristic: proportion of total neighborhoods that fit within budget × 100
      // (The endpoint already filters by budget, so all returned ones "fit" — we compare vs full list)
      // Use a simple 80 base score since all returned ones are within budget
      const score = Math.min(80 + Math.round(Math.min(neighborhoods.length, 5) * 4), 100);

      return { score, neighborhoods: mappedNeighborhoods };
    } catch {
      return EMPTY_LOCATION;
    }
  },

  async getCultureInsights(cityId: string, openness?: number): Promise<CultureOverview> {
    try {
      const o = openness ?? 5;
      const [rawRes, compatRes] = await Promise.all([
        api.get<any[]>(`/cities/${cityId}/culture`),
        api.get<any>(`/cities/${cityId}/culture/compatibility?openness=${o}`),
      ]);

      const rawInsights: any[] = rawRes.data ?? [];
      const compat = compatRes.data ?? { score: 50 };
      if (rawInsights.length === 0) return EMPTY_CULTURE;

      const receptivityScore = Math.round(compat.score ?? 50);
      // Language score: client-side heuristic — starts at 100, reduced by LANGUAGE insights
      // (LANGUAGE/WARNING = -15, LANGUAGE/CAUTION = -8). Placeholder until DB has a language_score field.
      const languageScore = computeLanguageScore(rawInsights);

      const insights = rawInsights.map((ins) => ({
        id: ins.id,
        category: ins.category,
        severity: ins.severity,
        title: ins.title,
        description: ins.description,
      }));

      return {
        receptivityScore,
        languageScore,
        insights,
        summary: generateCultureSummary(receptivityScore),
      };
    } catch {
      return EMPTY_CULTURE;
    }
  },

  /**
   * Tries to resolve a city name to a real DB city id.
   * Calls the real backend — returns null if city not found or backend is down.
   * Used by AiRecommendationsPanel to bridge the mock UI with real AI data.
   */
  async resolveRealCityId(cityName: string): Promise<string | null> {
    try {
      const { data } = await api.get<{ id: string; name: string }[]>(
        `/cities/search?q=${encodeURIComponent(cityName)}`,
      );
      if (Array.isArray(data) && data.length > 0) return data[0].id;
      return null;
    } catch {
      return null;
    }
  },
};
