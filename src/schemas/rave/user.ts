import z from 'zod';

export const UserSchema = z.object({
  avatar: z.string(),
  country: z.string(),
  displayName: z.string().optional(),
  handle: z.string(),
  id: z.number(),
  lang: z.string(),
  lat: z.float32(),
  lng: z.float32(),
  name: z.string(),
});

export const ProfileSchema = UserSchema.omit({
  id: true,
  lat: true,
  lng: true,
  lang: true,
});

export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
