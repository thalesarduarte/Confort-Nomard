import { CitySummary, CityOverview, ClimateOverview, FoodOverview, LocationOverview, CultureOverview, UserPreferenceProfile } from '@/types';

// Mocked data for development until backend is ready
const mockCities: CitySummary[] = [
  { id: '1', name: 'São Paulo', country: 'Brazil', countryCode: 'BR', imageUrl: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=800', tagline: 'The concrete jungle that never sleeps' },
  { id: '2', name: 'Lisboa', country: 'Portugal', countryCode: 'PT', imageUrl: 'https://images.unsplash.com/photo-1585218356057-dc0e8d355888?w=800', tagline: 'Sunshine, pastéis de nata and steep hills' },
  { id: '3', name: 'Berlin', country: 'Germany', countryCode: 'DE', imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800', tagline: 'History meets vibrant techno culture' },
  { id: '4', name: 'Tokyo', country: 'Japan', countryCode: 'JP', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800', tagline: 'Neon lights and serene temples' },
];

export const citiesService = {
  async searchCities(q: string): Promise<CitySummary[]> {
    // In real app: return (await api.get(`/cities/search?q=${q}`)).data;
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockCities.filter(c => c.name.toLowerCase().includes(q.toLowerCase())));
      }, 500);
    });
  },
  
  async getPopularCities(): Promise<CitySummary[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockCities), 500));
  },

  async getCityOverview(cityId: string, _profile?: UserPreferenceProfile): Promise<CityOverview> {
    const city = mockCities.find(c => c.id === cityId) || mockCities[0];
    return new Promise(resolve => setTimeout(() => resolve({
      city,
      overallScore: 82
    }), 500));
  },

  async getCityClimate(_cityId: string): Promise<ClimateOverview> {
    return new Promise(resolve => setTimeout(() => resolve({
      score: 75,
      idealMonths: [4, 5, 9, 10], // May, Jun, Oct, Nov
      summary: 'Winters are mild but wet. Summers can be quite hot. Spring and autumn are the perfect times to visit.',
      monthlyData: Array.from({length: 12}, (_, i) => ({
        month: i + 1,
        avgTemp: 15 + Math.sin(i / 12 * Math.PI) * 10,
        minTemp: 10 + Math.sin(i / 12 * Math.PI) * 10,
        maxTemp: 20 + Math.sin(i / 12 * Math.PI) * 10,
        humidity: 60 + Math.random() * 20,
        thermalComfort: i > 3 && i < 9 ? 'IDEAL' : (i < 2 || i > 10 ? 'UNCOMFORTABLE' : 'TOLERABLE'),
        description: 'Typical weather for this month'
      }))
    }), 500));
  },

  async getFoodCompatibility(_cityId: string): Promise<FoodOverview> {
    return new Promise(resolve => setTimeout(() => resolve({
      score: 90,
      availableFoods: ['Pizza', 'Sushi', 'Café Especial', 'Massas', 'Opções Veganas'],
      missingFoods: ['Açaí Autêntico', 'Tacos Mexicanos'],
      topEstablishments: [
        { name: 'Osteria Del Popolo', cuisine: 'Italian', priceTier: '$$' },
        { name: 'Green Haven', cuisine: 'Vegan', priceTier: '$$$' },
        { name: 'Tokyo Vibes', cuisine: 'Japanese', priceTier: '$$$$' }
      ],
      summary: 'Excellent culinary scene with great match for your preferences, though some specific comfort foods might be hard to find.'
    }), 500));
  },

  async getNeighborhoods(_cityId: string): Promise<LocationOverview> {
    return new Promise(resolve => setTimeout(() => resolve({
      score: 85,
      neighborhoods: [
        {
          id: 'n1',
          name: 'Downtown Central',
          costTier: 'PREMIUM',
          monthlyCost: { rent: 1500, food: 600, transport: 100, utilities: 200, total: 2400 },
          isRecommended: false
        },
        {
          id: 'n2',
          name: 'Arts District',
          costTier: 'MID',
          monthlyCost: { rent: 1000, food: 500, transport: 150, utilities: 150, total: 1800 },
          isRecommended: true
        }
      ]
    }), 500));
  },

  async getCultureInsights(_cityId: string): Promise<CultureOverview> {
    return new Promise(resolve => setTimeout(() => resolve({
      receptivityScore: 88,
      languageScore: 60,
      summary: 'Very welcoming culture, but language barrier might be an issue outside tourist areas.',
      insights: [
        { id: 'i1', category: 'SOCIAL', severity: 'INFO', title: 'Friendly Locals', description: 'People are generally very open to expats.' },
        { id: 'i2', category: 'LANGUAGE', severity: 'CAUTION', title: 'English is limited', description: 'Learning basic local phrases is highly recommended.' },
        { id: 'i3', category: 'BUREAUCRACY', severity: 'WARNING', title: 'Slow processes', description: 'Visas and apartment rentals can take months.' }
      ]
    }), 500));
  }
};
