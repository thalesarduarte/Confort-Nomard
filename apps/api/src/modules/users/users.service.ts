import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UserPreferenceProfile } from '../../database/entities/user-preference-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserPreferenceProfile) private profileRepo: Repository<UserPreferenceProfile>
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id }, relations: ['profile'] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(userData);
    const savedUser = await this.usersRepo.save(user);
    
    // Create default profile
    const profile = this.profileRepo.create({ userId: savedUser.id });
    await this.profileRepo.save(profile);
    
    return this.findById(savedUser.id);
  }

  async updateProfile(userId: string, profileData: Partial<UserPreferenceProfile>): Promise<UserPreferenceProfile> {
    await this.profileRepo.update({ userId }, profileData);
    return this.profileRepo.findOne({ where: { userId } });
  }
}
