import type { ComfortServices } from './types';
import { mockCityService } from './mock/cityService';
import { mockRecommendationService } from './mock/recommendationService';
import { mockAuthService } from './mock/authService';
import { mockCityService as cityService } from './mock/cityService';
import { buildArrivalPlan } from './mock/planningService';
export const dataSource = import.meta.env.VITE_DATA_SOURCE ?? 'mock';
// The HTTP implementation is intentionally absent until the product is ready for live data.
// Unknown/non-mock values continue to use the complete offline implementation.
export const services: ComfortServices = {
 cities: { list:()=>mockCityService.list(), search:q=>mockCityService.search(q), detail:id=>mockCityService.detail(id) },
 recommendations: { destinations:(profile,limit)=>mockRecommendationService.destinations(profile,limit), scoreBreakdown:(id,profile)=>mockRecommendationService.scoreBreakdown(id,profile) },
 planning: { async arrivalPlan(id,arrivalDate) { const city = cityService.getSync(id); if (!city) throw new Error('Destino não encontrado'); await new Promise(resolve => setTimeout(resolve, 350)); return buildArrivalPlan(city, arrivalDate); } },
 auth: mockAuthService,
};
export { mockCityService, mockRecommendationService, mockAuthService };
export * from './types';
