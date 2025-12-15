import { createHmac } from 'crypto';

import { HASH_SECRET } from '../constants';

export const generateHash = (
  token: string,
  timestamp: string,
  contentLength: number,
) => {
  const hash = createHmac('sha256', HASH_SECRET)
    .update(`${timestamp}:${token}:${contentLength}`)
    .digest();
  return hash.toString('base64');
};

export const generateToken = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    })
    .replace(/-/g, '');
};
