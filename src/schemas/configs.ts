import { z } from 'zod';

export const PostRequestConfigSchema = z.object({
  path: z.string().readonly(),
  body: z.string().readonly(),
  contentType: z.string().optional(),
});

export const GetRequestConfigSchema = PostRequestConfigSchema.omit({
  body: true,
});

export type PostRequestConfig = z.infer<typeof PostRequestConfigSchema>;
export type GetRequestConfig = z.infer<typeof GetRequestConfigSchema>;
