import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateInput,
  type UserUpdateInput,
} from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission('config', 'ver')
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @RequirePermission('config', 'editar')
  create(@(zodBody(userCreateSchema)) body: UserCreateInput, @CurrentUser() actor: JwtUser) {
    return this.usersService.create(body, actor.sub);
  }

  @Patch(':id')
  @RequirePermission('config', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(userUpdateSchema)) body: UserUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.usersService.update(id, body, actor.sub);
  }

  @Post(':id/reset-password')
  @RequirePermission('config', 'editar')
  resetPassword(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.usersService.resetPassword(id, actor.sub);
  }
}
