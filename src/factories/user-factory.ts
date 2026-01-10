import { any } from 'zod';

import { HttpWorkflow } from '../core/httpworkflow';
import { EditProfileBuilder, Sites, User } from '../schemas';
import {
  EditProfileResponse,
  EditProfileSchema,
  GetAvatarUploadResponse,
  GetAvatarUploadSchema,
  GetUserResponse,
  GetUserSchema,
  FriendshipResponse,
  FriendshipSchema,
  GetSuccessResponse,
  GetSuccessSchema,
  GetFriendsResponse,
  GetFriendsSchema,
} from '../schemas/responses';

export class UserFactory {
  private readonly __http: HttpWorkflow;

  constructor(http: HttpWorkflow) {
    this.__http = http;
  }

  private __friendshipRequests = async (
    body: string,
  ): Promise<FriendshipResponse> => {
    return await this.__http.sendPost<FriendshipResponse>(
      {
        path: `/friendships`,
        body,
      },
      FriendshipSchema,
    );
  };

  private __friendshipDelete = async (
    path: string,
  ): Promise<GetSuccessResponse> => {
    return await this.__http.sendDelete<GetSuccessResponse>(
      {
        path,
      },
      GetSuccessSchema,
    );
  };

  public get = async (userId: number): Promise<GetUserResponse> => {
    return await this.__http.sendGet<GetUserResponse>(
      {
        path: `/profiles/${userId}?exclude=false&clientVersion=1`,
      },
      GetUserSchema,
    );
  };

  public getFriends = async (limit: number = 24): Promise<User[]> => {
    return (
      await this.__http.sendGet<GetFriendsResponse>(
        {
          path: `/friendships?limit=${limit}`,
        },
        GetFriendsSchema,
      )
    ).data;
  };

  public setSite = async (site: Sites, value: string) => {
    return await this.__http.sendPut<any>(
      {
        path: `/profiles`,
        body: JSON.stringify({
          connections: {
            metadata: {
              position: 8,
              privacy: 'public',
            },
            sites: [
              {
                maturity: 'G',
                metadata: {
                  position: 0,
                  privacy: 'public',
                },
                site,
                value,
              },
            ],
          },
          exclude: false,
          clientVersion: 1,
        }),
      },
      any(),
    );
  };

  public sendFriendship = async (
    userId: number,
  ): Promise<FriendshipResponse> => {
    return await this.__friendshipRequests(JSON.stringify({ id: userId }));
  };

  public acceptFriendship = async (
    userId: number,
  ): Promise<FriendshipResponse> => {
    return await this.__friendshipRequests(
      JSON.stringify({ id: userId, state: 'friends' }),
    );
  };

  public declineFriendship = async (
    userId: number,
  ): Promise<FriendshipResponse> => {
    return await this.__friendshipRequests(
      JSON.stringify({ id: userId, state: 'notfriends' }),
    );
  };

  public deleteFriendship = async (userId: number): Promise<boolean> =>
    (await this.__friendshipDelete(`/friendships?id=${userId}`)).success;

  public deleteFriend = async (userId: number): Promise<boolean> =>
    (await this.__friendshipDelete(`/friendships/unfriend?id=${userId}`))
      .success;

  public edit = async (
    builder: EditProfileBuilder,
  ): Promise<EditProfileResponse> => {
    return await this.__http.sendPut<EditProfileResponse>(
      {
        path: '/users/self',
        body: JSON.stringify(builder),
      },
      EditProfileSchema,
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
      any(), // nothing returns
    );
  };

  public uploadAvatar = async (image: Buffer): Promise<string> => {
    const { data } = await this.getAvatarUpload();
    await this.uploadOnUrl(data.uploadUrl, image);
    return data.uploadUrl;
  };
}
