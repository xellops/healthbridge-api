import { QueryFailedError } from 'typeorm';

/** Escapes LIKE wildcards so user input matches literally. */
export const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

/** Drops `undefined` fields: TypeORM throws on them in `where` and ignores intent in updates. */
export function withoutUndefined<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

const pgCode = (error: unknown) =>
  error instanceof QueryFailedError
    ? (error.driverError as { code?: string } | undefined)?.code
    : undefined;

/**
 * A row is still referenced by a foreign key. `ON DELETE RESTRICT` reports
 * 23001 (restrict_violation); NO ACTION reports 23503.
 */
export const isForeignKeyViolation = (error: unknown) =>
  ['23001', '23503'].includes(pgCode(error) ?? '');

/** A unique constraint was hit (e.g. a race past an existence check). */
export const isUniqueViolation = (error: unknown) => pgCode(error) === '23505';
