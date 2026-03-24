import { SetMetadata } from '@nestjs/common';

export const REQUEST_TIMEOUT_KEY = 'request_timeout';
export const SetTimeout = (timeout: number) => SetMetadata(REQUEST_TIMEOUT_KEY, timeout);