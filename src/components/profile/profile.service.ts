import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async findProfile(userId: string) {
    const user = await this.userService.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }
}
