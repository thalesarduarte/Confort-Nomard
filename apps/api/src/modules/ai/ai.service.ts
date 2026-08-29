import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { OnboardingMessageDto } from './dto/onboarding-message.dto';

// ─── Onboarding types ─────────────────────────────────────────────────────────

export interface OnboardingAiResponse {
  done: boolean;
  message: string;
  quickReplies: string[];
  extractedPreferences: {
    comfortFoods: string[];
    freeformTags: string[];
    notes: string;
  };
}

// ─── Recommendations types ────────────────────────────────────────────────────

export interface GroundingItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface Grounding {
  food: GroundingItem[];
  neighborhoods: GroundingItem[];
  culture: GroundingItem[];
}

export interface RecommendationHighlight {
  refId: string;
  type: 'food' | 'neighborhood' | 'culture';
  title: string;
  reason: string;
}

export interface CityRecommendationsResult {
  summary: string;
  highlights: RecommendationHighlight[];
}

export interface RecommendForCityParams {
  cityName: string;
  country: string;
  profile?: Record<string, unknown>;
  freeformTags?: string[];
  grounding: Grounding;
  maxItems?: number;
  locale?: string;
}

// ─── Known comfort food enum ──────────────────────────────────────────────────

const KNOWN_COMFORT_FOODS = [
  'RICE_BEANS',
  'PASTA',
  'BREAD',
  'SUSHI',
  'TACOS',
  'CURRY',
  'PIZZA',
  'ARABIC',
  'CHINESE',
  'VEGAN',
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic | null = null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    this.model = this.configService.get<string>('ANTHROPIC_MODEL') ?? 'claude-sonnet-5';

    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      this.logger.log(`AiService initialized with model: ${this.model}`);
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not set — AI endpoints will return 503');
    }
  }

  private ensureClient(): Anthropic {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Serviço de IA não está disponível no momento. Configure ANTHROPIC_API_KEY para habilitá-lo.',
      );
    }
    return this.client;
  }

  // ─── Onboarding ─────────────────────────────────────────────────────────────

  async continueOnboarding(dto: OnboardingMessageDto): Promise<OnboardingAiResponse> {
    const client = this.ensureClient();
    const locale = dto.locale ?? 'pt-BR';

    // System prompt — profile goes here, never as a fake assistant message
    const profileSection = dto.profileSoFar
      ? `\n\nPerfil já coletado pelo formulário:\n${JSON.stringify(dto.profileSoFar, null, 2)}`
      : '';

    const systemPrompt = `Você é um assistente de viagem amigável do Comfort Nomad que está conduzindo uma conversa de refinamento de perfil com um usuário nômade digital. ${locale === 'pt-BR' ? 'Responda em Português do Brasil.' : `Respond in ${locale}.`}

Objetivo: Fazer até 3 perguntas curtas e objetivas para descobrir preferências adicionais que NÃO foram capturadas pelo formulário. NÃO repita perguntas sobre informações já conhecidas.${profileSection}

Exemplos de tópicos úteis para explorar (se ainda não coletados):
- Preferências de ambiente de trabalho (coworking, cafés, casa)
- Necessidades de conectividade (velocidade de internet, VPN)
- Preferências de vida noturna e socialização
- Preferências de transporte (moto, bicicleta, transporte público)
- Animais de estimação ou restrições específicas

Quando já tiver informações suficientes (após 1-3 trocas) ou o usuário quiser encerrar, retorne done: true com um resumo amigável.

Os comfortFoods extraídos devem ser SOMENTE dos valores: ${KNOWN_COMFORT_FOODS.join(', ')}.`;

    // Build messages — always end on user role
    let messages: { role: 'user' | 'assistant'; content: string }[];

    if (dto.history.length === 0) {
      // First call: bootstrap with a synthetic user message
      messages = [{ role: 'user', content: '(Início da conversa — faça a primeira pergunta agora.)' }];
    } else {
      messages = dto.history.map((m) => ({ role: m.role, content: m.content }));
      // Safety guard: ensure last message is from user
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role !== 'user') {
        messages.push({ role: 'user', content: '(Continue)' });
      }
    }

    const tool: Anthropic.Tool = {
      name: 'onboarding_response',
      description: 'Retorna a resposta estruturada do assistente durante o onboarding.',
      input_schema: {
        type: 'object' as const,
        properties: {
          done: {
            type: 'boolean',
            description: 'true quando a conversa de onboarding deve encerrar',
          },
          message: {
            type: 'string',
            description: 'Próxima pergunta ou mensagem de encerramento amigável',
          },
          quickReplies: {
            type: 'array',
            items: { type: 'string' },
            description: 'Até 4 respostas rápidas sugeridas para facilitar a interação',
          },
          extractedPreferences: {
            type: 'object',
            properties: {
              comfortFoods: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: KNOWN_COMFORT_FOODS,
                },
                description: 'Comfort foods identificados na conversa, apenas do enum conhecido',
              },
              freeformTags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Palavras-chave livres sobre preferências identificadas na conversa',
              },
              notes: {
                type: 'string',
                description: 'Resumo de 1-2 frases das preferências capturadas',
              },
            },
            required: ['comfortFoods', 'freeformTags', 'notes'],
          },
        },
        required: ['done', 'message', 'quickReplies', 'extractedPreferences'],
      },
    };

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      tools: [tool],
      tool_choice: { type: 'tool', name: 'onboarding_response' },
      messages,
    });

    // Extract tool input from response
    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('Unexpected response format from Anthropic API');
    }

    return toolUse.input as OnboardingAiResponse;
  }

  // ─── City Recommendations ────────────────────────────────────────────────────

  async recommendForCity(params: RecommendForCityParams): Promise<CityRecommendationsResult> {
    const client = this.ensureClient();
    const { cityName, country, profile, freeformTags, grounding, maxItems = 5, locale = 'pt-BR' } = params;

    // Build grounding text — give AI real ids to reference
    const foodList = grounding.food
      .map((f) => `  - id:"${f.id}" | ${f.name}${f.cuisineType ? ` (${f.cuisineType})` : ''}`)
      .join('\n');
    const neighborhoodList = grounding.neighborhoods
      .map((n) => `  - id:"${n.id}" | ${n.name}`)
      .join('\n');
    const cultureList = grounding.culture
      .map((c) => `  - id:"${c.id}" | ${c.title ?? c.name}`)
      .join('\n');

    const profileSection = profile
      ? `\nPerfil do usuário:\n${JSON.stringify(profile, null, 2)}`
      : '';
    const tagsSection =
      freeformTags && freeformTags.length > 0
        ? `\nPreferências adicionais (tags livres): ${freeformTags.join(', ')}`
        : '';

    const systemPrompt = `Você é um especialista em recomendações de destinos para nômades digitais do Comfort Nomad. ${locale === 'pt-BR' ? 'Responda em Português do Brasil.' : `Respond in ${locale}.`}

IMPORTANTE: Você DEVE citar SOMENTE itens que existem na lista de dados reais abaixo. Use EXATAMENTE o id fornecido (sem alterações). Nunca invente itens que não estão na lista.`;

    const userPrompt = `Cidade: ${cityName}, ${country}${profileSection}${tagsSection}

=== DADOS REAIS DO BANCO (USE SOMENTE ESTES) ===

Restaurantes/Estabelecimentos de comida:
${foodList || '  (nenhum dado disponível)'}

Bairros:
${neighborhoodList || '  (nenhum dado disponível)'}

Insights Culturais:
${cultureList || '  (nenhum dado disponível)'}

=== FIM DOS DADOS ===

Selecione até ${maxItems} destaques personalizados para este usuário, usando SOMENTE os itens listados acima. Para cada item, use o id EXATO da lista.`;

    const tool: Anthropic.Tool = {
      name: 'city_recommendations',
      description: 'Retorna recomendações personalizadas de cidade ancoradas em dados reais.',
      input_schema: {
        type: 'object' as const,
        properties: {
          summary: {
            type: 'string',
            description: '1-2 frases sobre o match geral entre o perfil do usuário e a cidade',
          },
          highlights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                refId: {
                  type: 'string',
                  description: 'ID EXATO de um item do grounding enviado',
                },
                type: {
                  type: 'string',
                  enum: ['food', 'neighborhood', 'culture'],
                  description: 'Tipo do item referenciado',
                },
                title: {
                  type: 'string',
                  description: 'Nome do item',
                },
                reason: {
                  type: 'string',
                  description: 'Motivo pessoal para a recomendação, em 1 frase',
                },
              },
              required: ['refId', 'type', 'title', 'reason'],
            },
          },
        },
        required: ['summary', 'highlights'],
      },
    };

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: systemPrompt,
      tools: [tool],
      tool_choice: { type: 'tool', name: 'city_recommendations' },
      messages: [{ role: 'user', content: userPrompt }],
    });

    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('Unexpected response format from Anthropic API');
    }

    const raw = toolUse.input as CityRecommendationsResult;

    // Build a set of all valid ids from grounding — anti-hallucination filter
    const validIds = new Set<string>([
      ...grounding.food.map((f) => f.id),
      ...grounding.neighborhoods.map((n) => n.id),
      ...grounding.culture.map((c) => c.id),
    ]);

    const filteredHighlights = raw.highlights.filter((h) => {
      const isValid = validIds.has(h.refId);
      if (!isValid) {
        this.logger.warn(`Filtered hallucinated refId: "${h.refId}" (not in grounding)`);
      }
      return isValid;
    });

    return {
      summary: raw.summary,
      highlights: filteredHighlights,
    };
  }
}
