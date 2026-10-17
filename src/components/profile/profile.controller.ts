import { Controller, Get, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import type { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';

@Controller('v1/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async findProfile(@Req() req: ExtendedExpressRequest) {
    return this.profileService.findProfile(req.user.id);
  }
}
