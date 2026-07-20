import { Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { type Response } from 'express';
import {
  changePasswordSchema,
  loginSchema,
  type ChangePasswordInput,
  type LoginInput,
} from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { AuthService, type MeDto } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser, type JwtUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @(zodBody(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MeDto> {
    const { user, token, maxAge } = await this.authService.login(
      body.identifier,
      body.password,
      body.remember,
    );
    res.cookie('sge_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge,
    });
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('sge_token', { path: '/' });
  }

  @Get('me')
  me(@CurrentUser() user: JwtUser): Promise<MeDto> {
    return this.authService.me(user.sub);
  }

  @Post('change-password')
  @HttpCode(200)
  changePassword(
    @(zodBody(changePasswordSchema)) body: ChangePasswordInput,
    @CurrentUser() user: JwtUser,
  ): Promise<{ ok: true }> {
    return this.authService.changePassword(user.sub, body.currentPassword, body.newPassword);
  }
}
