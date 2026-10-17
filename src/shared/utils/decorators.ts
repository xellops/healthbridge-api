import { SetMetadata } from '@nestjs/common';
import { Transform } from 'class-transformer';
import constants from './constants';

/** Skips AuthGuard for a route or controller. */
export const Public = () => SetMetadata(constants.IS_PUBLIC_KEY, true);

/** Trims and lowercases an email field on a DTO. */
export const NormalizeEmail = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
