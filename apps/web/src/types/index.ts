export interface User {
  id: string;
  name: string;
  email: string;
}

export type ThermalSensitivity = 'HEAT_LOVER' | 'TOLERANT' | 'SENSITIVE' | 'COLD_LOVER';
export type TravelPurpose = 'DIGITAL_NOMAD' | 'EXPAT' | 'STUDENT' | 'TOURIST';

export interface UserPreferenceProfile {
  thermalSensitivity: ThermalSensitivity;
  comfortFoods: string[];
  budgetMonthlyUsd: number;
  travelPurpose: TravelPurpose;
  languages: string[];
  culturalOpenness: number; // 1-10
}

export interface CitySummary {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  imageUrl: string;
  tagline: string;
}

export interface CityOverview {
  city: CitySummary;
  overallScore: number;
}

export interface ClimateData {
  month: number;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  humidity: number;
  thermalComfort: 'IDEAL' | 'TOLERABLE' | 'UNCOMFORTABLE';
  description: string;
}

export interface ClimateOverview {
  score: number;
  idealMonths: number[];
  monthlyData: ClimateData[];
  summary: string;
}

export interface FoodOverview {
  score: number;
  availableFoods: string[];
  missingFoods: string[];
  topEstablishments: {
    name: string;
    cuisine: string;
    priceTier: '$' | '$$' | '$$$' | '$$$$';
  }[];
  summary: string;
}

export interface NeighborhoodData {
  id: string;
  name: string;
  costTier: 'BUDGET' | 'MID' | 'PREMIUM';
  monthlyCost: {
    rent: number;
    food: number;
    transport: number;
    utilities: number;
    total: number;
  };
  isRecommended: boolean;
}

export interface LocationOverview {
  score: number;
  neighborhoods: NeighborhoodData[];
}

export type InsightCategory = 'SOCIAL' | 'SAFETY' | 'CUSTOMS' | 'LANGUAGE' | 'BUREAUCRACY';
export type InsightSeverity = 'INFO' | 'CAUTION' | 'WARNING';

export interface CultureInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
}

export interface CultureOverview {
  receptivityScore: number;
  languageScore: number;
  insights: CultureInsight[];
  summary: string;
}
