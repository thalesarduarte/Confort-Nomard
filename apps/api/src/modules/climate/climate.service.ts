import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClimateData } from '../../database/entities/climate-data.entity';
import { City } from '../../database/entities/city.entity';
import { ThermalSensitivity, ThermalComfort } from '@comfort-nomad/shared-types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const OPEN_METEO_TIMEOUT_MS = 8_000;

@Injectable()
export class ClimateService {
  private readonly logger = new Logger(ClimateService.name);

  constructor(
    @InjectRepository(ClimateData)
    private climateRepo: Repository<ClimateData>,
    @InjectRepository(City)
    private cityRepo: Repository<City>,
  ) {}

  async getClimateData(cityId: string): Promise<ClimateData[]> {
    const existing = await this.climateRepo.find({ where: { cityId }, order: { month: 'ASC' } });
    if (existing.length > 0) return existing;

    // ── Fallback: fetch climate normals from Open-Meteo (free, no API key) ──
    try {
      const city = await this.cityRepo.findOne({ where: { id: cityId } });
      if (!city) return [];

      const url =
        `https://climate-api.open-meteo.com/v1/climate` +
        `?latitude=${city.lat}&longitude=${city.lng}` +
        `&start_year=1991&end_year=2020` +
        `&monthly=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_days`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OPEN_METEO_TIMEOUT_MS);

      let json: any;
      try {
        const res = await fetch(url, { signal: controller.signal });
        json = await res.json();
      } finally {
        clearTimeout(timeout);
      }

      if (!json?.monthly?.time) return [];

      const { temperature_2m_max, temperature_2m_min, relative_humidity_2m_mean, precipitation_days } = json.monthly;
      const records: ClimateData[] = [];

      for (let i = 0; i < 12; i++) {
        const record = this.climateRepo.create({
          cityId,
          month: i + 1,
          monthName: MONTH_NAMES[i],
          avgTempMax: Math.round((temperature_2m_max?.[i] ?? 25) * 10) / 10,
          avgTempMin: Math.round((temperature_2m_min?.[i] ?? 15) * 10) / 10,
          avgHumidity: Math.round(relative_humidity_2m_mean?.[i] ?? 60),
          avgRainDays: Math.round(precipitation_days?.[i] ?? 8),
        });
        records.push(record);
      }

      // Save to DB so subsequent requests are instant
      await this.climateRepo.save(records);
      this.logger.log(`Fetched and cached Open-Meteo climate normals for city ${city.name}`);
      return records;
    } catch (err) {
      this.logger.warn(`Open-Meteo fallback failed for city ${cityId}: ${err?.message ?? err}`);
      return [];
    }
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
        comfort,
      };
    });
  }
}
