import { Test, TestingModule } from '@nestjs/testing';
import { FoodService } from './food.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FoodEstablishment } from '../../database/entities/food-establishment.entity';

describe('FoodService', () => {
  let service: FoodService;

  const mockEstablishments = [
    { comfortFoodTags: ['PIZZA', 'PASTA'] },
    { comfortFoodTags: ['BURGER'] },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        {
          provide: getRepositoryToken(FoodEstablishment),
          useValue: {
            find: jest.fn().mockResolvedValue(mockEstablishments),
          },
        },
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);
  });

  it('returns 100 when all comfort foods are available', async () => {
    const result = await service.calculateFoodCompatibility('cityId', ['PIZZA', 'BURGER']);
    expect(result.score).toBe(100);
    expect(result.matchedTags).toContain('PIZZA');
    expect(result.matchedTags).toContain('BURGER');
  });

  it('returns 0 when no comfort foods match', async () => {
    const result = await service.calculateFoodCompatibility('cityId', ['SUSHI', 'TACOS']);
    expect(result.score).toBe(0);
    expect(result.matchedTags).toHaveLength(0);
  });

  it('partial match returns proportional score', async () => {
    const result = await service.calculateFoodCompatibility('cityId', ['PIZZA', 'SUSHI']);
    expect(result.score).toBe(50);
    expect(result.matchedTags).toContain('PIZZA');
  });
});
