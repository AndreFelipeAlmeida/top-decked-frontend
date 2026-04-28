export interface ApiErrorDetail {
  detail:
    | string
    | Array<{
        loc: (string | number)[];
        msg: string;
        type: string;
      }>;
}

import { AxiosError } from 'axios';

export type ApiError = AxiosError<ApiErrorDetail>;
