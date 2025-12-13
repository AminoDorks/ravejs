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

export const EditProfileBuilderSchema = z.object({
  displayAvatar: z.string().optional(),
  displayName: z.string().optional(),
  handle: z.string().optional(),
});

export type RaveConfig = z.infer<typeof RaveConfigSchema>;
export type EditProfileBuilder = z.infer<typeof EditProfileBuilderSchema>;
