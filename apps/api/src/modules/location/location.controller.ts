import { Controller, Get, Param, Query } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('cities/:id/neighborhoods')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  async getNeighborhoods(@Param('id') cityId: string) {
    return this.locationService.getNeighborhoods(cityId);
  }

  @Get('match')
  async matchNeighborhoods(
    @Param('id') cityId: string,
    @Query('budget') budget: number,
    @Query('currency') currency: string
  ) {
    return this.locationService.matchNeighborhoods(cityId, budget, currency);
  }

  @Get(':nid/cost')
  async getCost(@Param('nid') neighborhoodId: string) {
    return this.locationService.getCostOfLiving(neighborhoodId);
  }
}
