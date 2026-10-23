import { Controller, Get, Post, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { CitiesService } from './cities.service';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.citiesService.search(query);
  }

  @Get(':id')
  async getCity(@Param('id') id: string) {
    const city = await this.citiesService.findById(id);
    if (!city) throw new NotFoundException(`Cidade "${id}" não encontrada.`);
    return city;
  }

  /**
   * POST /cities/:id/overview — public endpoint, no JWT required.
   * Accepts { profile } in the body and returns overallScore + compatibilities.
   * Follows the same pattern as POST /ai/cities/:id/recommendations.
   */
  @Post(':id/overview')
  async getOverview(
    @Param('id') id: string,
    @Body() body: { profile?: Record<string, any> },
  ) {
    return this.citiesService.getOverview(id, body.profile ?? {});
  }
}
