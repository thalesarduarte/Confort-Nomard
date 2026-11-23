import type { ComfortServices } from './types';
import { citySeed } from './mock/data/cities';
import { mockCitiesService } from './mock/cities.service';
import { mockAuthService } from './mock/auth.service';
import { mockCommunityService } from './mock/community.service';
import { mockBusinessService } from './mock/business.service';
import { mockAdminAuthService } from './mock/adminAuth.service';
import { wait } from './mock/storage';
import { scoreCity } from '@/domain/scoring';
import { buildArrivalPlan, simulateFirstMonth } from '@/domain/simulation';

const mockServices:ComfortServices={
  cities:mockCitiesService,
  recommendations:{
    async forProfile(profile,limit=6){await wait(520);const known=new Set(citySeed.map(city=>city.id));return citySeed.map(city=>({cityId:city.id,score:scoreCity(city,profile).overall,reason:'Pontuação determinística baseada nas preferências selecionadas.'})).filter(item=>known.has(item.cityId)).sort((a,b)=>b.score-a.score).slice(0,limit);},
    explain(cityId,profile){const city=citySeed.find(item=>item.id===cityId);return city?scoreCity(city,profile):null;},
  },
  simulation:{
    async firstMonth(cityId,profile){await wait(580);const city=citySeed.find(item=>item.id===cityId);return city?simulateFirstMonth(city,profile):[];},
    async arrivalPlan(cityId,date,options){await wait(420);const city=citySeed.find(item=>item.id===cityId);return city?buildArrivalPlan(city,date,options):[];},
  },
  auth:mockAuthService,
  adminAuth:mockAdminAuthService,
  business:mockBusinessService,
  community:mockCommunityService,
};

export const dataSource=import.meta.env.VITE_DATA_SOURCE??'mock';
// The HTTP adapter is intentionally not included in v2. Unknown source values stay local.
export const services:ComfortServices=mockServices;
export * from './types';
