import { describe, expect, it } from 'vitest';
import { citySeed } from '@/services/mock/data/cities';
import { DEFAULT_PROFILE } from '@/services/types';
import { onlyKnownIds, scoreCity } from './scoring';
import { buildArrivalPlan, mergeAnonymousProfile, parseAssistantPreferences, simulateFirstMonth } from './simulation';

describe('Comfort Nomad domain', () => {
  it('has 15 mock cities with complete provenance and 12 climate months', () => {
    expect(citySeed).toHaveLength(15);
    for (const city of citySeed) {
      expect(city.climate).toHaveLength(12);
      expect(city.provenance.cost.source).toBe('Seed local Comfort Nomad v2');
      expect(city.provenance.climate.updatedAt).toBeTruthy();
      expect(city.provenance.safety.confidence).toBe('baixa');
    }
  });

  it('scores the same city with consistent pillar weights and reacts to profile preferences', () => {
    const city = citySeed[0];
    const base = scoreCity(city, DEFAULT_PROFILE);
    const changed = scoreCity(city, { ...DEFAULT_PROFILE, thermalPreference: 'cool', comfortFoods: ['sushi'], weights: { ...DEFAULT_PROFILE.weights, climate: 2 } });
    expect(base.pillars.map(pillar => pillar.id)).toEqual(['climate', 'food', 'neighborhood', 'culture']);
    expect(changed.pillars[0].weight).toBe(2);
    expect(changed.pillars[0].score).not.toBe(base.pillars[0].score);
  });

  it('never keeps recommendations with IDs outside the city seed', () => {
    const known = new Set(citySeed.map(city => city.id));
    expect(onlyKnownIds([{ id: 'lisboa' }, { id: 'inventada' }], known)).toEqual([{ id: 'lisboa' }]);
  });

  it('turns recognized natural language into preferences and preserves prior foods when none are recognized', () => {
    expect(parseAssistantPreferences('Gosto de clima frio e comida vegana')).toMatchObject({ thermalPreference: 'cool', comfortFoods: ['vegan'] });
    expect(parseAssistantPreferences('Prefiro um ritmo tranquilo')).not.toHaveProperty('comfortFoods');
  });

  it('merges anonymous choices and creates a four-week destination estimate', () => {
    const merged = mergeAnonymousProfile({ comfortFoods: ['sushi'], freeformTags: ['social'] }, { origin: 'Brasil', freeformTags: ['clima'] });
    expect(merged).toMatchObject({ comfortFoods: ['sushi'], origin: 'Brasil', freeformTags: ['social', 'clima'] });
    expect(simulateFirstMonth(citySeed[0], DEFAULT_PROFILE)).toHaveLength(4);
  });

  it('personalizes arrival tasks and marks completed categories and official checks', () => {
    const arrival = new Date();
    arrival.setFullYear(arrival.getFullYear() + 1);
    const date = `${arrival.getFullYear()}-${String(arrival.getMonth()+1).padStart(2,'0')}-${String(arrival.getDate()).padStart(2,'0')}`;
    const tasks = buildArrivalPlan(citySeed[0], date, { nationality: 'Canadense', purpose: 'study', completedCategories: ['budget'] });
    expect(tasks).toHaveLength(11);
    expect(tasks[0].description).toContain('Canadense');
    expect(tasks[0].description).toContain('estudar');
    expect(tasks[0].officialCheck).toBe(true);
    expect(tasks.find(task => task.category === 'budget')?.completed).toBe(true);
  });
});
