import { api } from './api';
import { UserPreferenceProfile } from '@/types';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ExtractedPreferences {
  comfortFoods: string[];
  freeformTags: string[];
  notes: string;
}

export interface OnboardingAiResponse {
  done: boolean;
  message: string;
  quickReplies: string[];
  extractedPreferences: ExtractedPreferences;
}

export interface RecommendationHighlight {
  refId: string;
  type: 'food' | 'neighborhood' | 'culture';
  title: string;
  reason: string;
}

export interface CityRecommendationsResponse {
  summary: string;
  highlights: RecommendationHighlight[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const aiService = {
  /**
   * Sends one turn of the onboarding conversation to the backend.
   * The backend routes to Claude with tool_choice forced — always returns structured data.
   */
  async continueOnboarding(
    history: ChatMessage[],
    profileSoFar?: Partial<UserPreferenceProfile>,
    locale = 'pt-BR',
  ): Promise<OnboardingAiResponse> {
    const response = await api.post<OnboardingAiResponse>('/ai/onboarding/message', {
      history,
      profileSoFar,
      locale,
    });
    return response.data;
  },

  /**
   * Fetches AI-generated personalized recommendations for a city.
   * Uses only real DB data as grounding — the backend filters any hallucinated ids.
   */
  async getCityRecommendations(
    cityId: string,
    profile?: Partial<UserPreferenceProfile>,
    freeformTags?: string[],
    locale = 'pt-BR',
  ): Promise<CityRecommendationsResponse> {
    const response = await api.post<CityRecommendationsResponse>(
      `/ai/cities/${cityId}/recommendations`,
      { profile, freeformTags, locale },
    );
    return response.data;
  },
};
