import { Test, TestingModule } from '@nestjs/testing';
import { ClimateService } from './climate.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClimateData } from '../../database/entities/climate-data.entity';
import { ThermalSensitivity, ThermalComfort } from '@comfort-nomad/shared-types';

describe('ClimateService', () => {
  let service: ClimateService;

  const mockClimateData = [
    { month: 1, avgTempMax: 30, avgHumidity: 60 },
    { month: 6, avgTempMax: 15, avgHumidity: 80 },
    { month: 10, avgTempMax: 22, avgHumidity: 65 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClimateService,
        {
          provide: getRepositoryToken(ClimateData),
          useValue: {
            find: jest.fn().mockResolvedValue(mockClimateData),
          },
        },
      ],
    }).compile();

    service = module.get<ClimateService>(ClimateService);
  });

  it('HEAT_LOVER scores high in hot months, low in cold months', async () => {
    const results = await service.calculateCompatibility('cityId', ThermalSensitivity.HEAT_LOVER);
    
    const hotMonth = results.find(r => r.month === 1);
    const coldMonth = results.find(r => r.month === 6);

    expect(hotMonth.score).toBeGreaterThan(80);
    expect(coldMonth.score).toBeLessThan(50);
  });

  it('COLD_LOVER scores high in cold months, low in hot months', async () => {
    const results = await service.calculateCompatibility('cityId', ThermalSensitivity.COLD_LOVER);
    
    const hotMonth = results.find(r => r.month === 1);
    const coldMonth = results.find(r => r.month === 6);

    expect(hotMonth.score).toBeLessThan(50);
    expect(coldMonth.score).toBeGreaterThan(80);
  });
});
