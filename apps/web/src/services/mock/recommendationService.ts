import { cityData } from './data/cities';
import type { UserPreferenceProfile } from '@/types';
import { scoreCity, scoreCityBreakdown } from './scoring';
export const mockRecommendationService = { async destinations(profile?:Partial<UserPreferenceProfile>,limit=6){ await new Promise(r=>setTimeout(r,650)); return cityData.map(data=>{const score=scoreCity(data,profile); return {city:data.summary,score,reason:score>78?'Boa combinação de clima, comida e orçamento para o seu perfil.':'Um destino interessante para explorar com planejamento.'};}).sort((a,b)=>b.score-a.score).slice(0,limit); }, scoreBreakdown(cityId:string,profile?:Partial<UserPreferenceProfile>){const data=cityData.find(city=>city.summary.id===cityId);return data?scoreCityBreakdown(data,profile):null;} };
