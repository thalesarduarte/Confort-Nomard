import type { UserPreferenceProfile } from '@/types';
import type { CityData, ScoreBreakdown, ScorePillar } from '../types';

const labels: Record<ScorePillar, string> = { climate: 'Clima', food: 'Comida familiar', budget: 'Orçamento', culture: 'Adaptação cultural' };

export function scoreCityBreakdown(city: CityData, profile?: Partial<UserPreferenceProfile>): ScoreBreakdown {
  const climate = city.climate.length ? Math.round(city.climate.reduce((total, month) => total + (
    profile?.thermalSensitivity === 'HEAT_LOVER' ? (month.avgTemp >= 22 ? 100 : 65)
      : profile?.thermalSensitivity === 'COLD_LOVER' ? (month.avgTemp <= 22 ? 100 : 60)
        : profile?.thermalSensitivity === 'SENSITIVE' ? (month.avgTemp >= 14 && month.avgTemp <= 26 ? 100 : 55) : 80
  ), 0) / city.climate.length) : 0;
  const preferredFoods = profile?.comfortFoods ?? [];
  const foodTerms: Record<string, string[]> = {
    rice_beans: ['brasileira', 'regional'], pasta: ['italiana'], bread: ['padaria'], sushi: ['japonesa', 'sushi'],
    tacos: ['mexicana', 'tacos'], curry: ['indiana', 'curry'], pizza: ['italiana', 'pizza'], arabic: ['árabe', 'arab'],
    chinese: ['chinesa', 'chinese'], vegan: ['vegana', 'vegan'],
  };
  const matchingFoods = preferredFoods.length
    ? city.foods.filter(food => preferredFoods.some(wanted => (foodTerms[wanted] ?? [wanted]).some(term => `${food.cuisine} ${food.name}`.toLowerCase().includes(term.toLowerCase()))))
    : city.foods;
  const food = city.foods.length ? Math.round(matchingFoods.length ? matchingFoods.reduce((total, item) => total + item.nostalgiaScore, 0) / matchingFoods.length : 35) : 0;
  const budgetBrl = profile?.budgetMonthlyUsd ? profile.budgetMonthlyUsd * 5 : 0;
  const budget = budgetBrl
    ? Math.max(0, Math.min(100, Math.round(130 - city.monthlyCostBrl / budgetBrl * 65))) : 75;
  const expatCommunity = city.neighborhoods.length ? city.neighborhoods.reduce((total, neighborhood) => total + neighborhood.expatCommunity, 0) / city.neighborhoods.length : 5;
  const culture = Math.max(40, Math.min(95, Math.round(55 + expatCommunity * 4 + ((profile?.culturalOpenness ?? 5) - 5) * 2)));
  const scores: Record<ScorePillar, number> = { climate, food, budget, culture };
  const priority = profile?.priorityRanking ?? [];
  const weights: Record<ScorePillar, number> = { climate: 1, food: 1, budget: 1, culture: 1 };
  priority.forEach((key, index) => { if (key in weights) weights[key as ScorePillar] = Math.max(.4, 2 - index * .4); });
  const pillars = (Object.keys(labels) as ScorePillar[]).map(id => ({
    id, label: labels[id], score: scores[id], weight: weights[id],
    explanation: id === 'climate' ? `Compatibilidade com sua preferência térmica; ${city.climate.length} meses considerados.`
      : id === 'food' ? (preferredFoods.length ? `${matchingFoods.length} opção(ões) ilustrativas correspondem aos sabores informados.` : 'Média das opções de comida cadastradas para a cidade.')
        : id === 'budget' ? (profile?.budgetMonthlyUsd ? 'Custo mensal ilustrativo convertido com a taxa fixa de demonstração R$ 5/US$; não é câmbio atual.' : 'Sem orçamento informado, usamos uma referência neutra.')
          : `Índice ilustrativo de comunidade internacional dos bairros, ajustado pela abertura cultural ${profile?.culturalOpenness ?? 5}/10.`
  }));
  const totalWeight = pillars.reduce((sum, item) => sum + item.weight, 0);
  return { overall: Math.round(pillars.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight), pillars };
}

export function scoreCity(city: CityData, profile?: Partial<UserPreferenceProfile>): number {
  return scoreCityBreakdown(city, profile).overall;
}

export function filterKnownIds<T extends { id: string }>(items: T[], knownItems: { id: string }[]): T[] {
  const ids = new Set(knownItems.map(item => item.id));
  return items.filter(item => ids.has(item.id));
}
