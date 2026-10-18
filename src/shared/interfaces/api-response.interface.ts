/** Shape of every successful HTTP response (see ResponseInterceptor). */
export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}
