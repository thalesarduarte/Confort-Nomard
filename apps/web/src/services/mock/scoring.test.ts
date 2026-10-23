import { describe,it,expect } from 'vitest';
import { cityData } from './data/cities';
import { filterKnownIds,scoreCity } from './scoring';
import { aiService } from '../ai.service';
describe('mock destination logic',()=>{
 it('returns a bounded weighted city score',()=>{const score=scoreCity(cityData[0],{budgetMonthlyUsd:2000,priorityRanking:['budget','climate']});expect(score).toBeGreaterThanOrEqual(0);expect(score).toBeLessThanOrEqual(100);});
 it('filters unknown record ids',()=>{expect(filterKnownIds([{id:'ok'},{id:'hallucinated'}],[{id:'ok'}])).toEqual([{id:'ok'}]);});
 it('completes the deterministic onboarding chat in two user turns',async()=>{const first=await aiService.continueOnboarding([]);expect(first.done).toBe(false);const done=await aiService.continueOnboarding([{role:'user',content:'Gosto de arroz e feijão'},{role:'user',content:'Quero vida tranquila'}]);expect(done.done).toBe(true);expect(done.extractedPreferences.notes).toContain('tranquila');});
});
