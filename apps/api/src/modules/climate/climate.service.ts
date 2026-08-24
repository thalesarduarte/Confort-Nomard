import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClimateData } from '../../database/entities/climate-data.entity';
import { ThermalSensitivity, ThermalComfort } from '@comfort-nomad/shared-types';

@Injectable()
export class ClimateService {
  constructor(
    @InjectRepository(ClimateData)
    private climateRepo: Repository<ClimateData>
  ) {}

  async getClimateData(cityId: string): Promise<ClimateData[]> {
    return this.climateRepo.find({ where: { cityId }, order: { month: 'ASC' } });
  }

  async calculateCompatibility(cityId: string, sensitivity: ThermalSensitivity) {
    const data = await this.getClimateData(cityId);
    if (!data.length) return [];

    return data.map(month => {
      let score = 50; // Base score
      const temp = month.avgTempMax;
      const hum = month.avgHumidity;

      if (sensitivity === ThermalSensitivity.HEAT_LOVER) {
        if (temp > 28 && hum < 80) score = 100;
        else if (temp > 25) score = 80;
        else if (temp < 15) score = 20;
      } else if (sensitivity === ThermalSensitivity.COLD_LOVER) {
        if (temp < 18) score = 100;
        else if (temp < 22) score = 80;
        else if (temp > 28) score = 20;
      } else if (sensitivity === ThermalSensitivity.TOLERANT) {
        if (temp >= 18 && temp <= 28) score = 100;
        else if (temp < 10 || temp > 35) score = 40;
        else score = 80;
      } else if (sensitivity === ThermalSensitivity.SENSITIVE) {
        if (temp >= 20 && temp <= 25 && hum < 70) score = 100;
        else if (temp < 10 || temp > 35) score = 10;
        else score = 60;
      }

      let comfort = ThermalComfort.FAIR;
      if (score >= 90) comfort = ThermalComfort.EXCELLENT;
      else if (score >= 70) comfort = ThermalComfort.GOOD;
      else if (score >= 40) comfort = ThermalComfort.FAIR;
      else if (score >= 20) comfort = ThermalComfort.POOR;
      else comfort = ThermalComfort.UNBEARABLE;

      return {
        month: month.month,
        score,
        comfort
      };
    });
  }
}
