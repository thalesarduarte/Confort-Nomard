import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { City } from '../../database/entities/city.entity';
import { ClimateService } from '../climate/climate.service';
import { FoodService } from '../food/food.service';
import { LocationService } from '../location/location.service';
import { CultureService } from '../culture/culture.service';
import { UserPreferenceProfile } from '../../database/entities/user-preference-profile.entity';

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
    if (!query) return [];
    return this.cityRepo.find({
      where: [
        { name: Like(`%${query}%`) },
        { country: Like(`%${query}%`) }
      ],
      take: 10
    });
  }

  async findById(id: string): Promise<City | null> {
    return this.cityRepo.findOne({ where: { id } });
  }

  async getOverview(cityId: string, userProfile: UserPreferenceProfile) {
    const city = await this.findById(cityId);
    if (!city) throw new Error('City not found');

    const climateData = await this.climateService.calculateCompatibility(cityId, userProfile.thermalSensitivity);
    const foodData = await this.foodService.calculateFoodCompatibility(cityId, userProfile.comfortFoods || []);
    const matchingNeighborhoods = await this.locationService.matchNeighborhoods(cityId, userProfile.monthlyBudget, userProfile.budgetCurrency);
    const cultureData = await this.cultureService.calculateCulturalCompatibility(cityId, userProfile.culturalOpenness);

    return {
      city,
      compatibilities: {
        climate: climateData,
        food: foodData,
        neighborhoods: matchingNeighborhoods,
        culture: cultureData,
      }
    };
  }
}
