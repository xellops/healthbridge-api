import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';
import constants from '../utils/constants';

export const DEFAULT_RESPONSE_MESSAGE = 'Query successful';

/**
 * Wraps every HTTP handler's return value as `{ status, message, data }`.
 * `message` comes from `@ResponseMessage()` or falls back to the default;
 * `data` is left out when the handler returns nothing.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only HTTP; leave websocket/other contexts alone.
    if (context.getType() !== 'http') return next.handle();

    const message =
      this.reflector.getAllAndOverride<string>(constants.RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_RESPONSE_MESSAGE;

    return next.handle().pipe(
      map((data): ApiResponse | StreamableFile => {
        // Files/streams must reach the client untouched.
        if (data instanceof StreamableFile) return data;

        const body: ApiResponse = { status: true, message };
        if (data !== undefined && data !== null) body.data = data;
        return body;
      }),
    );
  }
}
