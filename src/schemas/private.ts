import z from 'zod';

export const PagingSchema = z
  .object({
    next: z.string().optional(),
  })
  .optional();

export type HeadersType = Record<string, string>;
export type MethodType = 'POST' | 'PUT';
export type AuthenticatorMethod = 'LOGIN' | 'REGISTER';
export type Paging = z.infer<typeof PagingSchema>;
