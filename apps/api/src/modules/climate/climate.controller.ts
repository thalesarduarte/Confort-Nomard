import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClimateService } from './climate.service';
import { ThermalSensitivity } from '@comfort-nomad/shared-types';

@Controller('cities/:id/climate')
export class ClimateController {
  constructor(private readonly climateService: ClimateService) {}

  @Get()
  async getClimate(@Param('id') cityId: string) {
    return this.climateService.getClimateData(cityId);
  }

  @Get('compatibility')
  async getCompatibility(
    @Param('id') cityId: string,
    @Query('sensitivity') sensitivity: ThermalSensitivity
  ) {
    return this.climateService.calculateCompatibility(cityId, sensitivity || ThermalSensitivity.TOLERANT);
  }
}
