import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cities')
export class CitiesController {
  constructor(
    private readonly citiesService: CitiesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.citiesService.search(query);
  }

  @Get(':id')
  async getCity(@Param('id') id: string) {
    return this.citiesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/overview')
  async getOverview(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findById(req.user.id);
    return this.citiesService.getOverview(id, user.profile);
  }
}
