import type { City } from '../types';
import { citySeed } from './data/cities';
import { wait } from './storage';

export const mockCitiesService={
  async list():Promise<City[]>{await wait(420);return citySeed;},
  async detail(id:string):Promise<City|null>{await wait(360);return citySeed.find(city=>city.id===id)??null;},
  async search(query:string):Promise<City[]>{await wait(300);const text=query.trim().toLocaleLowerCase('pt-BR');return citySeed.filter(city=>`${city.name} ${city.country}`.toLocaleLowerCase('pt-BR').includes(text));},
  byId(id:string):City|undefined{return citySeed.find(city=>city.id===id);},
  allKnownIds():ReadonlySet<string>{return new Set(citySeed.map(city=>city.id));},
};
