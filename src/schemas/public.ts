import z from 'zod';

export const RaveConfigSchema = z.object({
  credentials: z
    .object({
      token: z.string(),
      deviceId: z.string(),
    })
    .optional(),
  enableLogging: z.boolean().optional(),
});

export type RaveConfig = z.infer<typeof RaveConfigSchema>;
