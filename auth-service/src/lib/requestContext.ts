import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<{
  'x-user'?: string;
  'x-user-signature': string;
}>();
