import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Neighborhood } from '../../database/entities/neighborhood.entity';
import { CostOfLiving } from '../../database/entities/cost-of-living.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Neighborhood)
    private neighborhoodRepo: Repository<Neighborhood>,
    @InjectRepository(CostOfLiving)
    private costRepo: Repository<CostOfLiving>,
  ) {}

  async getNeighborhoods(cityId: string): Promise<Neighborhood[]> {
    return this.neighborhoodRepo.find({ where: { cityId }, relations: ['costOfLiving'] });
  }

  async getCostOfLiving(neighborhoodId: string): Promise<CostOfLiving | null> {
    return this.costRepo.findOne({ where: { neighborhoodId } });
  }

  async matchNeighborhoods(cityId: string, budget: number, currency: string) {
    const neighborhoods = await this.getNeighborhoods(cityId);
    return neighborhoods.filter(n => {
      if (n.costOfLiving && n.costOfLiving.currency === currency) {
        return n.costOfLiving.monthlyTotal <= budget;
      }
      return true;
    });
  }
}
