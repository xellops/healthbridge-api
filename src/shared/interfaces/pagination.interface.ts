export interface Pagination {
  /** The page value from the client. It is used to evaluate the value of `offset` and `skip`. Defaults to 1. */
  page?: number;
  /** The number of rows to take */
  limit?: number;
  /** The number of rows to skip */
  offset?: number;
  /** Logically same as offset. */
  skip?: number;
}
