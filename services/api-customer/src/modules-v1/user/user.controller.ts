import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ActJwtGuard } from '../../guard/act-jwt.guard';
import { CurrentUser } from '@/decorators/request.decorator';
import { AuthUser } from '@/types/request.types';
import { ResponseInterceptor } from '@/interceptors/response.interceptors';

@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(ActJwtGuard)
  @Get('profile')
  @UseInterceptors(new ResponseInterceptor())
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.userService.getUserProfileByUserId(user.id);
  }

  @UseGuards(ActJwtGuard)
  @Get('user-org')
  @UseInterceptors(new ResponseInterceptor())
  async getUserWithOrgData(@CurrentUser() user: AuthUser) {
    return this.userService.findUserOrgByUuid(user.uuid);
  }
}
