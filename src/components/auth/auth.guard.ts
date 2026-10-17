import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import constants from '../../shared/utils/constants';
import { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';
import { UserService } from '../user/user.service';
import { AuthTokenPayload } from './auth.interface';

/**
 * Registered globally. Every route requires a valid access token (Bearer
 * header or `token` cookie) unless it is marked with `@Public()`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      constants.IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request: ExtendedExpressRequest = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: AuthTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AuthTokenPayload>(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({ id: payload.id });

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;
    return true;
  }

  private extractToken(request: ExtendedExpressRequest): string | undefined {
    const [type, tokenFromHeader] =
      request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? tokenFromHeader : request.cookies?.token;
  }
}
