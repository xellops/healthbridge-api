import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export function hashPassword(unencryptedPassword: string): Promise<string> {
  return bcrypt.hash(unencryptedPassword, SALT_ROUNDS);
}

/** `hashedPassword` must be loaded explicitly, since `User.password` is `select: false`. */
export function comparePassword(
  unencryptedPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(unencryptedPassword, hashedPassword);
}
