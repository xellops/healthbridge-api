import { SetMetadata } from '@nestjs/common';
import { Transform } from 'class-transformer';
import constants from './constants';
import { UserType } from '../../components/user/user.enum';

/** Skips AuthGuard for a route or controller. */
export const Public = () => SetMetadata(constants.IS_PUBLIC_KEY, true);

/** Skips PasswordResetRequiredCheck for a route or controller. */
export const IgnorePasswordResetRequiredCheck = () =>
  SetMetadata(constants.IGNORE_PASSWORD_RESET_REQUIRED_CHECK, true);

/** Restricts a route or controller to the given user types (checked by AuthGuard). */
export const Roles = (...types: UserType[]) =>
  SetMetadata(constants.ROLES_KEY, types);

/** Overrides the default `message` in the response body (see ResponseInterceptor). */
export const ResponseMessage = (message: string) =>
  SetMetadata(constants.RESPONSE_MESSAGE_KEY, message);

/** Trims and lowercases an email field on a DTO. */
export const NormalizeEmail = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
