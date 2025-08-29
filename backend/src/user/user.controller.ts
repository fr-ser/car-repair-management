import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import type { UserWithoutHash } from 'src/auth/strategy';

import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: UserWithoutHash) {
    return user;
  }

  @Patch()
  editUser(@GetUser() user: UserWithoutHash, @Body() dto: EditUserDto) {
    const userId: number = user.id;
    return this.userService.editUser(userId, dto);
  }
}
