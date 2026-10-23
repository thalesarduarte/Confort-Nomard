import type { CitySummary, UserPreferenceProfile } from '@/types';

export interface ClimateMonth { month: number; avgTemp: number; rainfallMm: number; humidity: number; sunHours: number }
export interface FoodSpot { id: string; name: string; cuisine: string; kind: string; neighborhood: string; price: number; nostalgiaScore: number }
export interface Neighborhood { id: string; name: string; rentLocal: number; rentBrl: number; monthlyCostBrl: number; safety: number; transit: number; nightlife: number; expatCommunity: number; x: number; y: number }
export interface CultureTip { id: string; category: string; title: string; description: string; importance: 'alta' | 'média' | 'baixa' }
export interface DataProvenance { source: string; updatedAt: string; confidence: 'baixa' | 'média' | 'alta'; note: string }
export interface CityData { summary: CitySummary; language: string; currency: string; timezone: string; monthlyCostBrl: number; climate: ClimateMonth[]; foods: FoodSpot[]; neighborhoods: Neighborhood[]; culture: CultureTip[]; provenance: { cost: DataProvenance; climate: DataProvenance; safety: DataProvenance } }
export type ScorePillar = 'climate' | 'food' | 'budget' | 'culture';
export interface ScoreBreakdown { overall: number; pillars: Array<{ id: ScorePillar; label: string; score: number; weight: number; explanation: string }> }
export interface ArrivalTask { id: string; phase: string; title: string; description: string; dueDate: string; estimatedCostBrl: number; priority: 'alta' | 'média' | 'baixa' }
export interface ArrivalPlan { cityId: string; arrivalDate: string; tasks: ArrivalTask[]; estimatedSetupCostBrl: number; monthlyCostBrl: number; generatedAt: string }
export interface ComfortServices {
  cities: { list(): Promise<CitySummary[]>; search(query: string): Promise<CitySummary[]>; detail(id: string): Promise<CityData | null> };
  recommendations: { destinations(profile?: Partial<UserPreferenceProfile>, limit?: number): Promise<{ city: CitySummary; score: number; reason: string }[]>; scoreBreakdown(cityId: string, profile?: Partial<UserPreferenceProfile>): ScoreBreakdown | null };
  planning: { arrivalPlan(cityId: string, arrivalDate: string): Promise<ArrivalPlan> };
  auth: { register(name: string, email: string, password: string): Promise<void>; login(email: string, password: string): Promise<void>; logout(): void };
}
