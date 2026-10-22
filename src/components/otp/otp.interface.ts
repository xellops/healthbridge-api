export interface OtpGenerationOptions {
  /** This is the length of the OTP digits. Defaults to 6. */
  length?: number;
  /** This is the expiration time for the OTP in minutes. Defaults to 10 minutes
   * @default 10
   */
  expiration?: number;
  /**
   * Replaces previous OTP for the same identity and scope combination when generating a new one. Defaults to false.
   */
  replace?: boolean;
}

export enum OtpScope {
  PASSWORD_RESET = 'password-reset',
}
