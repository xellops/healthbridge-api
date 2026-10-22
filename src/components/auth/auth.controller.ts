import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { accessTokenTtl, AuthService, refreshTokenTtl } from './auth.service';
import {
  PasswordChangeDto,
  PasswordResetDto,
  RequestPasswordResetDto,
  SignInDto,
} from './auth.dto';
import { AuthTokens } from './auth.interface';
import { Public } from '../../shared/utils/decorators';
import type { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setCookies(res: Response, { token, refreshToken }: AuthTokens) {
    const isProduction = process.env.NODE_ENV === 'production';

    const sharedCookieConfig: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
    };

    res.cookie('token', token, {
      ...sharedCookieConfig,
      maxAge: accessTokenTtl() * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...sharedCookieConfig,
      maxAge: refreshTokenTtl() * 1000,
    });
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.signIn(body);
    this.setCookies(res, data);
    return data;
  }

  @Public()
  @Get('refresh')
  async refreshToken(
    @Req() req: ExtendedExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.refreshToken(req.cookies?.refreshToken);
    this.setCookies(res, data);
    return data;
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(body);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: PasswordResetDto) {
    return this.authService.resetPassword(body);
  }

  @Patch('change-password')
  async changePassword(
    @Body() body: PasswordChangeDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.authService.changePassword(body, req.user.id);
  }
}
