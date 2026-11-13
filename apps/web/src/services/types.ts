export type Language = 'pt-BR' | 'en' | 'es';
export type Currency = 'BRL' | 'EUR' | 'USD';
export type Purpose = 'relocation' | 'remote' | 'study' | 'tourism';
export type ThermalPreference = 'warm' | 'mild' | 'cool' | 'flexible';
export type PillarKey = 'climate' | 'food' | 'neighborhood' | 'culture';

export interface Profile {
  origin: string;
  nationality: string;
  purpose: Purpose;
  budgetMonthlyUsd: number;
  thermalPreference: ThermalPreference;
  comfortFoods: string[];
  languages: string[];
  workStyle: 'remote' | 'hybrid' | 'onsite';
  pace: 'quiet' | 'balanced' | 'lively';
  stayMonths: number;
  safetyPriority: number;
  socialPriority: number;
  transitPriority: number;
  openness: number;
  weights: Record<PillarKey, number>;
  freeformTags: string[];
}

export type ProfilePatch = Partial<Profile>;
export interface ClimateMonth { month: number; averageC: number; rainMm: number; humidity: number; sunHours: number; feeling: string }
export interface FoodPlace { id: string; name: string; kind: string; cuisine: string; neighborhoodId: string; priceBrl: number; nostalgia: number; tags: string[] }
export interface Neighborhood { id: string; name: string; rentLocal: number; currency: string; rentBrl: number; monthlyBrl: number; safety: number; transit: number; social: number; expat: number; x: number; y: number }
export interface CultureTip { id: string; category: string; title: string; do: string; avoid: string; importance: 'alta'|'média'|'baixa' }
export interface Provenance { source: string; updatedAt: string; confidence: 'baixa'|'média'|'alta'; note: string }
export interface City {
  id: string; name: string; country: string; countryCode: string; tagline: string;
  language: string; currency: string; timezone: string; monthlyBrl: number;
  climate: ClimateMonth[]; foods: FoodPlace[]; neighborhoods: Neighborhood[]; culture: CultureTip[];
  documentsNote: string; provenance: { cost: Provenance; climate: Provenance; safety: Provenance };
}
export interface ScoreBreakdown { overall: number; pillars: Array<{ id: PillarKey; label: string; score: number; weight: number; explanation: string; effect: 'positive'|'neutral'|'negative'; preference: string }> }
export interface Recommendation { cityId: string; score: number; reason: string }
export interface FirstMonthWeek { week: number; title: string; focus: string; estimatedCostBrl: number; adjustment: string }
export type ArrivalCategory = 'documents'|'budget'|'housing'|'health'|'transport'|'connectivity'|'essentials'|'local_services'|'routine';
export interface ArrivalTask { id: string; category: ArrivalCategory; taskKey: 'entry'|'budget'|'housing'|'documents'|'health'|'transport'|'connectivity'|'essentials'|'local'|'routineCosts'|'routineNetwork'; phase: string; title: string; description: string; dueDate: string; estimateBrl: number; priority: 'alta'|'média'|'baixa'; officialCheck: boolean; completed: boolean }
export interface ArrivalPlanOptions { nationality: string; purpose: Purpose; completedCategories: ArrivalCategory[] }
export interface Contribution { id: string; kind: 'dica'|'comida'|'bairro'; cityId: string; title: string; body: string; status: 'pendente'|'aprovado'|'ajustes'|'denunciado'; author: string; authorId: string; votes: number; createdAt: string; note?: string }
export interface CommunityReport { id: string; contributionId: string; reporterId: string; reason: 'outdated'|'personal_data'|'harmful'|'spam'|'other'; details: string; createdAt: string }
export interface ModerationEvent { id: string; contributionId: string; action: 'submitted'|'edited'|'reported'|'approved'|'changes_requested'|'removed'; actorId: string; note: string; createdAt: string }
export interface Account { id: string; name: string; email: string; passwordHash: string }
export interface PartnerOffer { id:string;category:string;title:string;description:string;estimate:string;terms:string }
export interface RelocationEmployee { id:string;name:string;cityId:string;score:number;alert:string;checklistDone:number;checklistTotal:number }
export interface AuthState { account: Omit<Account,'passwordHash'>|null; isLoggedIn: boolean; profile: Profile|null; tempProfile: ProfilePatch|null }

export interface ComfortServices {
  cities: { list(): Promise<City[]>; detail(id: string): Promise<City|null>; search(query: string): Promise<City[]> };
  recommendations: { forProfile(profile: ProfilePatch|null, limit?: number): Promise<Recommendation[]>; explain(cityId: string, profile: ProfilePatch|null): ScoreBreakdown|null };
  simulation: { firstMonth(cityId: string, profile: ProfilePatch|null): Promise<FirstMonthWeek[]>; arrivalPlan(cityId: string, date: string, options: ArrivalPlanOptions): Promise<ArrivalTask[]> };
  auth: { register(name: string, email: string, password: string): Promise<void>; login(email: string, password: string): Promise<void>; logout(): void; deleteAccount(): void };
  business: { offers(): Promise<PartnerOffer[]>; employees(): Promise<RelocationEmployee[]>; submitLead(company:string,email:string): Promise<void> };
  community: { rules(): string[]; list(): Promise<Contribution[]>; reports(): Promise<CommunityReport[]>; history(contributionId?: string): Promise<ModerationEvent[]>; submit(input: Omit<Contribution,'id'|'status'|'author'|'authorId'|'votes'|'createdAt'|'note'>): Promise<void>; update(id: string, input: Pick<Contribution,'title'|'body'>): Promise<void>; remove(id: string): Promise<void>; vote(id: string, value: -1|1): Promise<void>; report(id: string, reason: CommunityReport['reason'], details: string): Promise<void>; moderate(id: string, status: 'aprovado'|'ajustes', note: string): Promise<void> };
}

export const DEFAULT_PROFILE: Profile = {
  origin: 'Brasil', nationality: 'Brasileira', purpose: 'relocation', budgetMonthlyUsd: 2500, thermalPreference: 'mild',
  comfortFoods: ['rice_beans','bread'], languages: ['pt-BR'], workStyle: 'remote', pace: 'balanced', stayMonths: 12,
  safetyPriority: 4, socialPriority: 3, transitPriority: 4, openness: 7,
  weights: { climate: 1.2, food: 1.1, neighborhood: 1.3, culture: 1 }, freeformTags: [],
};
