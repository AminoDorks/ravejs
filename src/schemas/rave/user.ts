import z from 'zod';

export const UserSchema = z.object({
  avatar: z.string(),
  country: z.string(),
  displayName: z.string(),
  handle: z.string(),
  id: z.number(),
  lang: z.string(),
  lat: z.float32(),
  lng: z.float32(),
  name: z.string(),
});

export type User = z.infer<typeof UserSchema>;
