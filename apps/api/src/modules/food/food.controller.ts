import { Controller, Get, Param, Query } from '@nestjs/common';
import { FoodService } from './food.service';

@Controller('cities/:id/food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  async getFood(@Param('id') cityId: string) {
    return this.foodService.getEstablishments(cityId);
  }

  @Get('compatibility')
  async getCompatibility(
    @Param('id') cityId: string,
    @Query('comfortFoods') comfortFoodsQuery: string
  ) {
    const comfortFoods = comfortFoodsQuery ? comfortFoodsQuery.split(',') : [];
    return this.foodService.calculateFoodCompatibility(cityId, comfortFoods);
  }
}
