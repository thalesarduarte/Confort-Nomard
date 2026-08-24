export enum ThermalSensitivity {
  HEAT_LOVER = 'HEAT_LOVER',
  COLD_LOVER = 'COLD_LOVER',
  TOLERANT = 'TOLERANT',
  SENSITIVE = 'SENSITIVE',
}

export enum TravelPurpose {
  DIGITAL_NOMAD = 'DIGITAL_NOMAD',
  EXPAT = 'EXPAT',
  VACATION = 'VACATION',
  STUDENT = 'STUDENT'
}

export enum CostTier {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum ThermalComfort {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  UNBEARABLE = 'UNBEARABLE'
}

export enum CulturalInsightCategory {
  INFO = 'INFO',
  CAUTION = 'CAUTION',
  LANGUAGE = 'LANGUAGE',
  SOCIAL = 'SOCIAL',
  BUREAUCRACY = 'BUREAUCRACY',
  SAFETY = 'SAFETY',
  CUSTOMS = 'CUSTOMS'
}

export enum InsightSeverity {
  INFO = 'INFO',
  CAUTION = 'CAUTION',
  WARNING = 'WARNING'
}

export enum ComfortFood {
  PIZZA = 'PIZZA',
  SUSHI = 'SUSHI',
  BURGER = 'BURGER',
  VEGAN = 'VEGAN',
  PASTA = 'PASTA',
  TACOS = 'TACOS',
  BREAD = 'BREAD'
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserPreferenceProfile {
  id: string;
}

export interface City {
  id: string;
}

export interface Neighborhood {
  id: string;
}

export interface CostOfLiving {
  id: string;
}

export interface ClimateData {
  id: string;
}

export interface ClimateCompatibility {
  month: number;
  score: number;
  comfort: ThermalComfort;
}

export interface FoodEstablishment {
  id: string;
}

export interface FoodCompatibility {
  score: number;
  matchedTags: string[];
}

export interface CulturalInsight {
  id: string;
}

export interface CulturalCompatibility {
  score: number;
}

export interface CityOverview {
  city: City;
}
