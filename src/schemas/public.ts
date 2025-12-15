import z from 'zod';

export const LanguagesSchema = z.enum(['en', 'ru']);

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

export const GetManyMeshesSchema = z.object({
  isPublic: z.boolean().optional(),
  limit: z.number().default(20),
  hasFriends: z.boolean().optional(),
  local: z.boolean().optional(),
  hasInvited: z.boolean().optional(),
  language: LanguagesSchema,
});

export type RaveConfig = z.infer<typeof RaveConfigSchema>;
export type EditProfileBuilder = z.infer<typeof EditProfileBuilderSchema>;
export type GetManyMeshesParams = z.infer<typeof GetManyMeshesSchema>;
export type Languages = z.infer<typeof LanguagesSchema>;
