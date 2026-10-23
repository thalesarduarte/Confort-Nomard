import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { City } from '../../database/entities/city.entity';
import { ClimateService } from '../climate/climate.service';
import { FoodService } from '../food/food.service';
import { LocationService } from '../location/location.service';
import { CultureService } from '../culture/culture.service';
import { ThermalSensitivity } from '@comfort-nomad/shared-types';

/** Minimal shape of a user profile when no auth is present. */
interface ProfileInput {
  thermalSensitivity?: string;
  comfortFoods?: string[];
  monthlyBudget?: number;
  budgetMonthlyUsd?: number; // frontend name alias
  budgetCurrency?: string;
  culturalOpenness?: number;
}

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private cityRepo: Repository<City>,
    private climateService: ClimateService,
    private foodService: FoodService,
    private locationService: LocationService,
    private cultureService: CultureService,
  ) {}

  async search(query: string): Promise<City[]> {
    // Empty query → return a broad list (powers "popular cities")
    if (!query || query.trim() === '') {
      return this.cityRepo.find({ take: 12, order: { name: 'ASC' } });
    }
    return this.cityRepo.find({
      where: [
        { name: Like(`%${query}%`) },
        { country: Like(`%${query}%`) },
      ],
      take: 10,
    });
  }

  async findById(id: string): Promise<City | null> {
    return this.cityRepo.findOne({ where: { id } });
  }

  async getOverview(cityId: string, profile: ProfileInput) {
    const city = await this.findById(cityId);
    if (!city) throw new NotFoundException(`Cidade "${cityId}" não encontrada.`);

    // Resolve defaults for optional profile fields
    const sensitivity = (profile.thermalSensitivity as ThermalSensitivity) ?? ThermalSensitivity.TOLERANT;
    const comfortFoods = profile.comfortFoods ?? [];
    // Support both naming conventions (frontend uses budgetMonthlyUsd, entity uses monthlyBudget)
    const budget = profile.budgetMonthlyUsd ?? profile.monthlyBudget ?? 2000;
    const currency = profile.budgetCurrency ?? 'USD';
    const openness = profile.culturalOpenness ?? 5;

    const [climateData, foodData, matchingNeighborhoods, cultureData] = await Promise.all([
      this.climateService.calculateCompatibility(cityId, sensitivity),
      this.foodService.calculateFoodCompatibility(cityId, comfortFoods),
      this.locationService.matchNeighborhoods(cityId, budget, currency),
      this.cultureService.calculateCulturalCompatibility(cityId, openness),
    ]);

    // Compute an overall compatibility score (0-100)
    // Climate: average of monthly scores; Food: direct score; Culture: direct score;
    // Location: rough heuristic — has neighborhoods within budget? 80 : 40
    const avgClimate =
      climateData.length > 0
        ? Math.round(climateData.reduce((a, b) => a + b.score, 0) / climateData.length)
        : 50;
    const locationScore = matchingNeighborhoods.length > 0 ? 80 : 40;
    const overallScore = Math.round(
      (avgClimate + (foodData.score ?? 50) + (cultureData.score ?? 50) + locationScore) / 4,
    );

    return {
      city,
      overallScore: Math.min(Math.max(overallScore, 0), 100),
      compatibilities: {
        climate: climateData,
        food: foodData,
        neighborhoods: matchingNeighborhoods,
        culture: cultureData,
      },
    };
  }
}

