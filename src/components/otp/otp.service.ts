import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as randomstring from 'randomstring';
import { OtpGenerationOptions } from './otp.interface';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class OtpService {
  private readonly otpLength = 6;
  private readonly otpExpiration = 10; // in minutes

  constructor(
    @Inject(CacheService)
    private readonly cacheService: CacheService,
  ) {}

  private parseKeyPart(part: string | number) {
    return part.toString().trim().replaceAll(' ', '-').toLowerCase();
  }

  private getCacheKey(identity: string | number, scope: string, otp: string) {
    return `otp:${this.parseKeyPart(scope)}:${this.parseKeyPart(identity)}:${otp}`;
  }

  async clearPrevious(identity: string | number, scope: string) {
    await this.cacheService.delByPattern(
      this.getCacheKey(identity, scope, '*'),
    );
  }

  /**
   * Generates a random numeric OTP
   * @param identity - An entity to associate the OTP with (e.g., user ID, an email or phone number, etc.)
   * @param scope - A context or purpose for the OTP (e.g., 'email-verification', 'password-reset', etc.)
   * @param options - Optional settings for OTP generation (length, expiration, replace)
   * @returns The generated OTP as a string
   */
  async generate(
    identity: string | number,
    scope: string,
    options: OtpGenerationOptions = {},
  ): Promise<string> {
    const length = options.length || this.otpLength;
    const expiration = options.expiration || this.otpExpiration;

    if (options.replace) {
      await this.clearPrevious(identity, scope);
    }

    const otp = randomstring.generate({ charset: 'numeric', length });
    const cacheKey = this.getCacheKey(identity, scope, otp);
    await this.cacheService.set(cacheKey, { otp }, expiration * 60);
    return otp;
  }

  /**
   * Verifies the provided OTP for the given identity and scope, then deletes it
   * to prevent reuse. Throws if the OTP is invalid or expired.
   */
  async verify(
    identity: string | number,
    scope: string,
    otp: string,
  ): Promise<boolean> {
    const cacheKey = this.getCacheKey(identity, scope, otp);
    const exists = await this.cacheService.exists(cacheKey);

    if (!exists) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.cacheService.del(cacheKey);
    return true;
  }
}
