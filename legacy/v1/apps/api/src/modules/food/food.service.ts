import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodEstablishment } from '../../database/entities/food-establishment.entity';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(FoodEstablishment)
    private foodRepo: Repository<FoodEstablishment>,
  ) {}

  async getEstablishments(cityId: string): Promise<FoodEstablishment[]> {
    return this.foodRepo.find({ where: { cityId } });
  }

  async calculateFoodCompatibility(cityId: string, comfortFoods: string[]) {
    if (!comfortFoods || comfortFoods.length === 0) return { score: 100, matchedTags: [] };

    const establishments = await this.getEstablishments(cityId);

    const availableTags = new Set<string>();
    establishments.forEach(est => {
      est.comfortFoodTags.forEach(tag => availableTags.add(tag));
    });

    let matched = 0;
    const matchedTags: string[] = [];
    comfortFoods.forEach(food => {
      if (availableTags.has(food)) {
        matched++;
        matchedTags.push(food);
      }
    });

    const score = comfortFoods.length > 0 ? (matched / comfortFoods.length) * 100 : 100;
    return { score, matchedTags };
  }
}
