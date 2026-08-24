import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CulturalInsight } from '../../database/entities/cultural-insight.entity';
import { InsightSeverity } from '@comfort-nomad/shared-types';

@Injectable()
export class CultureService {
  constructor(
    @InjectRepository(CulturalInsight)
    private insightRepo: Repository<CulturalInsight>
  ) {}

  async getInsights(cityId: string): Promise<CulturalInsight[]> {
    return this.insightRepo.find({ where: { cityId } });
  }

  async calculateCulturalCompatibility(cityId: string, culturalOpenness: number) {
    const insights = await this.getInsights(cityId);
    
    let score = 50 + (culturalOpenness * 5); // Base score boosted by openness (openness 1-10)
    
    insights.forEach(insight => {
      if (insight.severity === InsightSeverity.WARNING) {
        score -= (11 - culturalOpenness); // Lower openness means larger penalty
      } else if (insight.severity === InsightSeverity.CAUTION) {
        score -= (5 - culturalOpenness / 2);
      } else {
        score += 2;
      }
    });

    return {
      score: Math.min(Math.max(score, 0), 100)
    };
  }

  async reportInsight(cityId: string, insightData: Partial<CulturalInsight>) {
    const insight = this.insightRepo.create({ ...insightData, cityId });
    return this.insightRepo.save(insight);
  }
}
