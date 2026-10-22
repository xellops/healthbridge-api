import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
import { UserStatus } from '../user/user.enum';
import { OtpService } from '../otp/otp.service';
import { OtpScope } from '../otp/otp.interface';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { ResourceType } from '../../shared/enums/resource.enum';
import { OrganizationService } from '../organization/organization.service';
import { comparePassword, hashPassword } from '../../shared/utils/password';

/** Access token lifetime in seconds. */
export const accessTokenTtl = () => Number(process.env.JWT_TTL ?? 15 * 60);
/** Refresh token lifetime in seconds. */
export const refreshTokenTtl = () =>
  Number(process.env.JWT_REFRESH_TTL ?? 7 * 24 * 60 * 60);

@Injectable()
export class AuthService {
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
    @Inject(OrganizationService)
    private readonly organizationService: OrganizationService,
  ) {}

  /**
   * Emails are only unique within an organization, so a user is identified
   * by the organization's client ID plus their email.
   * Returns null if either doesn't match.
   */
  private async findUserInOrganization(
    clientId: string,
    email: string,
    { withPassword = false } = {},
  ): Promise<User | null> {
    const organization = await this.organizationService.findOne({ clientId });

    if (!organization) return null;

    const query = { email, organizationId: organization.id };

    return withPassword
      ? this.userService.findOneWithPasswordIncluded(query)
      : this.userService.findOne(query);
  }

  async signIn(input: SignInInput): Promise<SignInSuccessPayload> {
    const user = await this.findUserInOrganization(
      input.clientId,
      input.email,
      { withPassword: true },
    );

    if (!user || !(await comparePassword(input.password, user.password))) {
      throw new UnauthorizedException(
        'Client ID, email or password is incorrect',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    const tokens = await this.tokenizeUser(user);

    await this.appNotificationService.create({
      resourceType: ResourceType.USER,
      resourceId: user.id,
      title: 'New Login',
      description: 'You signed in to your account',
      recipientIds: [user.id],
    });

    return {
      id: user.id,
      email: user.email,
      type: user.type,
      organizationId: user.organizationId,
      ...tokens,
    };
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

    if (!user || user.status !== UserStatus.ACTIVE) {
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
    clientId,
    email,
  }: PasswordResetRequestInput): Promise<void> {
    const user = await this.findUserInOrganization(clientId, email);

    // Respond the same way whether or not the account exists.
    if (!user) return;

    // Keyed by user ID: the same email can exist in several organizations.
    const otp = await this.otpService.generate(
      user.id,
      OtpScope.PASSWORD_RESET,
      { replace: true },
    );

    await this.mailService.sendPasswordResetRequestMail({
      recipients: [user.email],
      data: { passwordResetCode: otp },
    });
  }

  async resetPassword(input: PasswordResetInput): Promise<void> {
    const { clientId, email, otp, password } = input;
    const user = await this.findUserInOrganization(clientId, email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.otpService.verify(user.id, OtpScope.PASSWORD_RESET, otp);

    await this.userService.updatePassword(
      { id: user.id },
      await hashPassword(password),
    );
  }

  async changePassword(
    input: PasswordChangeInput,
    userId: string,
  ): Promise<void> {
    const user = await this.userService.findOneWithPasswordIncluded({
      id: userId,
    });

    if (
      !user ||
      !(await comparePassword(input.currentPassword, user.password))
    ) {
      throw new BadRequestException('Incorrect password');
    }

    await this.userService.updatePassword(
      { id: user.id },
      await hashPassword(input.newPassword),
    );
  }
}
