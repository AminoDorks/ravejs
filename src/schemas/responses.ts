import z from 'zod';
import { UserSchema } from './rave/user';

export const EditProfileSchema = z.object({
  data: UserSchema,
});

export const SendMagicLinkSchema = z
  .object({
    state_id: z.string(),
  })
  .transform((data) => {
    return {
      stateId: data.state_id,
    };
  });

export const CheckRegisterStateSchema = z
  .object({
    authenticated: z.boolean(),
    is_second_factor_login: z.boolean().optional(),
    oauth: z
      .object({
        access_token: z.string(),
        id_token: z.string(),
        refresh_token: z.string(),
        expires_in: z.string(),
        token_type: z.string(),
      })
      .optional(),
    user: z
      .object({
        created_at: z.string(),
        updated_at: z.string(),
        issuer: z.string(),
        user_id: z.string(),
        identifier: z.string(),
        email: z.string(),
      })
      .optional(),
  })
  .transform((data) => {
    return {
      authenticated: data.authenticated,
      isSecondFactorLogin: data.is_second_factor_login,
      oauth: data.oauth
        ? {
            accessToken: data.oauth.access_token,
            idToken: data.oauth.id_token,
            refreshToken: data.oauth.refresh_token,
            expiresIn: data.oauth.expires_in,
            tokenType: data.oauth.token_type,
          }
        : undefined,
      user: data.user
        ? {
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at,
            issuer: data.user.issuer,
            userId: data.user.user_id,
            identifier: data.user.identifier,
            email: data.user.email,
          }
        : undefined,
    };
  });

export const ParseUserCredentialsSchema = z.object({
  objectId: z.string(),
  createdAt: z.string(),
  username: z.string(),
  sessionToken: z.string(),
});

export const MojoLoginSchema = z.object({
  data: z.object({
    isValid: z.boolean(),
    newUser: z.boolean(),
    suggestedHandles: z.array(z.string()),
  }),
});

export type EditProfileResponse = z.infer<typeof EditProfileSchema>;
export type SendMagicLinkResponse = z.infer<typeof SendMagicLinkSchema>;
export type CheckRegisterStateResponse = z.infer<
  typeof CheckRegisterStateSchema
>;
export type ParseUserCredentialsResponse = z.infer<
  typeof ParseUserCredentialsSchema
>;
export type MojoLoginResponse = z.infer<typeof MojoLoginSchema>;
