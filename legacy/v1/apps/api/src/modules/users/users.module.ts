import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../database/entities/user.entity';
import { UserPreferenceProfile } from '../../database/entities/user-preference-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPreferenceProfile])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
