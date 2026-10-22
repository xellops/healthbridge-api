import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
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
import { UserStatus, UserType } from '../user/user.enum';
import { AuthErrorCodes } from './auth.error';

/**
 * Registered globally. Every route requires a valid access token (Bearer
 * header or `token` cookie) unless it is marked with `@Public()`. Suspended
 * users are rejected, and `@Roles()` limits a route to the given user types.
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

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException();
    }

    const ignorePasswordResetRequiredCheck =
      this.reflector.getAllAndOverride<boolean>(constants.IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (user.passwordResetRequired && !ignorePasswordResetRequiredCheck) {
      throw new ForbiddenException({
        code: AuthErrorCodes.AuthPasswordResetRequiredError,
        message: 'You need to change/reset your password to continue',
      });
    }

    const roles = this.reflector.getAllAndOverride<UserType[] | undefined>(
      constants.ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (roles && !roles.includes(user.type)) {
      throw new ForbiddenException();
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
