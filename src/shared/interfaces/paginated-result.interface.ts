export interface PaginatedResult<T> {
  total: number;
  limit: number;
  page: number;
  records: T[];
}
