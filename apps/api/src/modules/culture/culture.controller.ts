import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CultureService } from './culture.service';
import { CulturalInsight } from '../../database/entities/cultural-insight.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cities/:id/culture')
export class CultureController {
  constructor(private readonly cultureService: CultureService) {}

  @Get()
  async getCulture(@Param('id') cityId: string) {
    return this.cultureService.getInsights(cityId);
  }

  @Get('compatibility')
  async getCompatibility(
    @Param('id') cityId: string,
    @Query('openness') openness: number
  ) {
    return this.cultureService.calculateCulturalCompatibility(cityId, openness || 5);
  }

  @UseGuards(JwtAuthGuard)
  @Post('report')
  async reportInsight(
    @Param('id') cityId: string,
    @Body() insightData: Partial<CulturalInsight>
  ) {
    return this.cultureService.reportInsight(cityId, insightData);
  }
}
