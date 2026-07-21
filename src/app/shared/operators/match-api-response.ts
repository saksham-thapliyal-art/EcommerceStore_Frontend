import { OperatorFunction, map } from 'rxjs';

import { ApiResponse } from '../models/api-response';

export function matchApiResponse<T>(): OperatorFunction<ApiResponse<T>, T> {
  return map((response) => response.data);
}
