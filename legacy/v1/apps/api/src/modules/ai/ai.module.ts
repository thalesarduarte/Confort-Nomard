import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { CitiesModule } from '../cities/cities.module';
import { FoodModule } from '../food/food.module';
import { LocationModule } from '../location/location.module';
import { CultureModule } from '../culture/culture.module';

@Module({
  imports: [CitiesModule, FoodModule, LocationModule, CultureModule],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
