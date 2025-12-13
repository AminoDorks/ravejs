import z from 'zod';
import { UserSchema } from './rave/user';

export const EditProfileResponseSchema = z.object({
  data: UserSchema,
});

export type EditProfileResponse = z.infer<typeof EditProfileResponseSchema>;
