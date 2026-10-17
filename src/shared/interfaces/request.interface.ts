import { Request } from 'express';
import { Pagination } from './pagination.interface';
import { User } from '../../components/user/user.entity';

export interface ExtendedExpressRequest extends Request {
  /** Set by AuthGuard. Undefined on routes marked with `@Public()`. */
  user: User;
  /** Set by PaginationInterceptor. */
  pagination?: Pagination;
}
