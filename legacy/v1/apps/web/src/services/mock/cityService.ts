import { cityData } from './data/cities';
import type { CityData } from '../types';
const delay = (ms=480) => new Promise<void>(resolve => setTimeout(resolve, ms));
export const mockCityService = {
 async list(){ await delay(); return cityData.map(c=>c.summary); },
 async search(query:string){ await delay(420); const q=query.trim().toLocaleLowerCase(); return cityData.map(c=>c.summary).filter(c=>`${c.name} ${c.country}`.toLocaleLowerCase().includes(q)); },
 async detail(id:string):Promise<CityData|null>{ await delay(560); return cityData.find(c=>c.summary.id===id) ?? null; },
 getSync(id:string):CityData|undefined { return cityData.find(c=>c.summary.id===id); },
};
