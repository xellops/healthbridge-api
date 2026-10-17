import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Pagination } from '../interfaces/pagination.interface';

const MIN_PAGE = 1;
const MAX_PAGE = 20;
const MIN_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Attaches a `Pagination` object named `pagination` to the request, built from
 * the `page` and `limit` query params (defaults: page = 1, limit = 10), then
 * removes those params from the query object.
 */
@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    let page = Number.parseInt(request.query.page as string);
    let limit = Number.parseInt(request.query.limit as string);

    if (Number.isNaN(page) || page < MIN_PAGE) page = MIN_PAGE;
    if (Number.isNaN(limit) || limit < 1) limit = MIN_LIMIT;

    if (page > MAX_PAGE) {
      throw new BadRequestException(
        'Not found what you are looking for yet? Try searching instead',
      );
    }

    limit = Math.min(limit, MAX_LIMIT);

    const pagination: Pagination = {
      offset: (page - 1) * limit,
      skip: (page - 1) * limit,
      limit,
      page,
    };

    request.pagination = pagination;

    // Express 5 re-parses `req.query` on every access, so deleting keys has no
    // effect. Replace it with a copy that leaves out the pagination params.
    const { page: _page, limit: _limit, ...query } = request.query;
    Object.defineProperty(request, 'query', { value: query, writable: true });

    return next.handle();
  }
}
