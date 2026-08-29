import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { AiService, GroundingItem } from './ai.service';
import { OnboardingMessageDto } from './dto/onboarding-message.dto';
import { CityRecommendationsDto } from './dto/city-recommendations.dto';
import { CitiesService } from '../cities/cities.service';
import { FoodService } from '../food/food.service';
import { LocationService } from '../location/location.service';
import { CultureService } from '../culture/culture.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly citiesService: CitiesService,
    private readonly foodService: FoodService,
    private readonly locationService: LocationService,
    private readonly cultureService: CultureService,
  ) {}

  /**
   * POST /ai/onboarding/message
   * Public endpoint — no JWT required.
   * Drives a short AI conversation to refine the user profile.
   */
  @Post('onboarding/message')
  @HttpCode(HttpStatus.OK)
  async onboardingMessage(@Body() dto: OnboardingMessageDto) {
    return this.aiService.continueOnboarding(dto);
  }

  /**
   * POST /ai/cities/:id/recommendations
   * Public endpoint — no JWT required.
   * Returns AI-generated personalized highlights anchored to real DB data.
   */
  @Post('cities/:id/recommendations')
  @HttpCode(HttpStatus.OK)
  async cityRecommendations(
    @Param('id') cityId: string,
    @Body() dto: CityRecommendationsDto,
  ) {
    // 1. Resolve city — 404 if not found
    const city = await this.citiesService.findById(cityId);
    if (!city) {
      throw new NotFoundException(`Cidade com id "${cityId}" não encontrada.`);
    }

    // 2. Fetch real data from DB in parallel
    const [foodEstablishments, neighborhoods, culturalInsights] = await Promise.all([
      this.foodService.getEstablishments(cityId),
      this.locationService.getNeighborhoods(cityId),
      this.cultureService.getInsights(cityId),
    ]);

    // 3. Build grounding — only include fields the AI needs
    const foodGrounding: GroundingItem[] = foodEstablishments.map((f) => ({
      id: f.id,
      name: f.name,
      cuisineType: f.servesCuisines?.join(', ') ?? undefined,
    }));

    const neighborhoodGrounding: GroundingItem[] = neighborhoods.map((n) => ({
      id: n.id,
      name: n.name,
    }));

    const cultureGrounding: GroundingItem[] = culturalInsights.map((c) => ({
      id: c.id,
      name: c.title,
      title: c.title,
    }));

    // 4. Call AiService
    return this.aiService.recommendForCity({
      cityName: city.name,
      country: city.country,
      profile: dto.profile,
      freeformTags: dto.freeformTags,
      grounding: {
        food: foodGrounding,
        neighborhoods: neighborhoodGrounding,
        culture: cultureGrounding,
      },
      maxItems: dto.maxItems ?? 5,
      locale: dto.locale ?? 'pt-BR',
    });
  }
}
