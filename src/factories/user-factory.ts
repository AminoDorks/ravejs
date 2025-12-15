import z from 'zod';
import { HttpWorkflow } from '../core/httpworkflow';
import { EditProfileBuilder, EditProfileBuilderSchema } from '../schemas';
import {
  EditProfileResponse,
  GetAvatarUploadResponse,
  GetAvatarUploadSchema,
  GetUserResponse,
  GetUserSchema,
  SendFriendshipResponse,
  SendFriendshipSchema,
} from '../schemas/responses';

export class UserFactory {
  private readonly __http: HttpWorkflow;

  constructor(http: HttpWorkflow) {
    this.__http = http;
  }

  public get = async (userId: number): Promise<GetUserResponse> => {
    return await this.__http.sendGet<GetUserResponse>(
      {
        path: `/profiles/${userId}?exclude=false&clientVersion=1`,
      },
      GetUserSchema,
    );
  };

  public sendFriendship = async (
    userId: number,
  ): Promise<SendFriendshipResponse> => {
    return await this.__http.sendPost<SendFriendshipResponse>(
      {
        path: `/friendships`,
        body: JSON.stringify({ id: userId }),
      },
      SendFriendshipSchema,
    );
  };

  public edit = async (
    builder: EditProfileBuilder,
  ): Promise<EditProfileResponse> => {
    return await this.__http.sendPut<EditProfileResponse>(
      {
        path: '/users/self',
        body: JSON.stringify(builder),
      },
      EditProfileBuilderSchema,
    );
  };

  public getAvatarUpload = async (): Promise<GetAvatarUploadResponse> => {
    return await this.__http.sendPost<GetAvatarUploadResponse>(
      {
        path: '/users/self/avatar/upload',
        body: JSON.stringify({ mime: 'image/jpeg' }),
      },
      GetAvatarUploadSchema,
    );
  };

  public uploadOnUrl = async (
    uploadUrl: string,
    image: Buffer,
  ): Promise<any> => {
    return await this.__http.sendRaw(
      {
        path: uploadUrl,
        method: 'PUT',
        body: image,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      },
      z.any(), // nothing returns
    );
  };

  public uploadAvatar = async (image: Buffer): Promise<string> => {
    const { data } = await this.getAvatarUpload();
    await this.uploadOnUrl(data.uploadUrl, image);
    return data.uploadUrl;
  };
}
