import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  AuthTokenPayload,
  AuthTokens,
  PasswordChangeInput,
  PasswordResetInput,
  PasswordResetRequestInput,
  RefreshTokenPayload,
  SignInInput,
  SignInSuccessPayload,
} from './auth.interface';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { OtpService } from '../otp/otp.service';
import { OtpScope } from '../otp/otp.interface';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { ResourceType } from '../../shared/enums/resource.enum';
import { AuthErrorCodes } from './auth.error';

/** Access token lifetime in seconds. */
export const accessTokenTtl = () => Number(process.env.JWT_TTL ?? 15 * 60);
/** Refresh token lifetime in seconds. */
export const refreshTokenTtl = () =>
  Number(process.env.JWT_REFRESH_TTL ?? 7 * 24 * 60 * 60);

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private jwtService: JwtService,
    @Inject(MailService)
    private readonly mailService: MailService,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(OtpService)
    private readonly otpService: OtpService,
    @Inject(AppNotificationService)
    private readonly appNotificationService: AppNotificationService,
  ) {}

  async hashPassword(unencryptedPassword: string): Promise<string> {
    return bcrypt.hash(unencryptedPassword, this.saltRounds);
  }

  /**
   * Returns true if the given password matches the user's hashed password.
   * The user must have been loaded with its password selected.
   */
  async comparePassword(
    user: User,
    unencryptedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(unencryptedPassword, user.password);
  }

  async signIn(input: SignInInput): Promise<SignInSuccessPayload> {
    const user = await this.userService.findOneWithPasswordIncluded({
      email: input.email,
    });

    if (!user || !(await this.comparePassword(user, input.password))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (user?.passwordResetRequired) {
      throw new ForbiddenException({
        code: AuthErrorCodes.AuthPasswordResetRequiredError,
        message: 'You need to reset your password to continue',
      });
    }

    const tokens = await this.tokenizeUser(user);

    await this.appNotificationService.create({
      resourceType: ResourceType.USER,
      resourceId: user.id,
      title: 'New Login',
      description: 'You signed in to your account',
      recipientIds: [user.id],
    });

    return { id: user.id, email: user.email, type: user.type, ...tokens };
  }

  async refreshToken(refreshToken?: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: process.env.JWT_REFRESH_SECRET },
      );
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({ id: payload.id });

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.tokenizeUser(user);
  }

  async tokenizeUser(user: User): Promise<AuthTokens> {
    const accessPayload: AuthTokenPayload = {
      id: user.id,
      email: user.email,
      type: user.type,
    };
    const refreshPayload: RefreshTokenPayload = { id: user.id };

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        expiresIn: accessTokenTtl(),
        secret: process.env.JWT_SECRET,
      }),
      this.jwtService.signAsync(refreshPayload, {
        expiresIn: refreshTokenTtl(),
        secret: process.env.JWT_REFRESH_SECRET,
      }),
    ]);

    return { token, refreshToken };
  }

  async requestPasswordReset({
    email,
  }: PasswordResetRequestInput): Promise<void> {
    const user = await this.userService.findOne({ email });

    // Respond the same way whether or not the account exists.
    if (!user) return;

    const otp = await this.otpService.generate(email, OtpScope.PASSWORD_RESET, {
      replace: true,
    });

    await this.mailService.sendPasswordResetRequestMail({
      recipients: [email],
      data: { passwordResetCode: otp },
    });
  }

  async resetPassword(input: PasswordResetInput): Promise<void> {
    const { email, otp, password } = input;
    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpService.verify(email, OtpScope.PASSWORD_RESET, otp);

    await this.userService.updatePassword(
      { id: user.id },
      await this.hashPassword(password),
    );
  }

  async changePassword(
    input: PasswordChangeInput,
    userId: string,
  ): Promise<void> {
    const user = await this.userService.findOneWithPasswordIncluded({
      id: userId,
    });

    if (!user || !(await this.comparePassword(user, input.currentPassword))) {
      throw new BadRequestException('Incorrect password');
    }

    await this.userService.updatePassword(
      { id: user.id },
      await this.hashPassword(input.newPassword),
    );
  }
}
