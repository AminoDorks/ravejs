import { request } from 'undici';
import { randomUUID } from 'crypto';
import z from 'zod';

import {
  EVENTS_API_URL,
  PATCHED_DEVICE,
  PATCHED_IP_DATA,
  RAVE_LINK_URL,
} from '../constants';
import { HttpWorkflow } from '../core/httpworkflow';
import { GetManyMeshesParams, RaveConfig } from '../schemas';
import {
  GetManyMeshesResponse,
  GetManyMeshesSchema,
  GetMeshResponse,
  GetMeshSchema,
  StatusedResponse,
  StatusSchema,
} from '../schemas/responses';
import { matchMeshId, parseMeshId } from '../utils/utils';
import { MeshSocket } from '../core/mesh-socket';
import { Account } from '../schemas/rave/account';

export class MeshFactory {
  private readonly __config: RaveConfig;
  private readonly __http: HttpWorkflow;
  private readonly __account: Account;

  constructor(config: RaveConfig = {}, http: HttpWorkflow, account: Account) {
    this.__config = config;
    this.__http = http;
    this.__account = account;
  }

  private __getRaveLink = async (meshLink: string) => {
    const meshId = matchMeshId(
      await this.__http.sendRaw(
        {
          method: 'GET',
          path: meshLink,
        },
        z.string(),
      ),
    );

    return await this.get(meshId);
  };

  public get = async (meshId: string): Promise<GetMeshResponse> => {
    return await this.__http.sendGet<GetMeshResponse>(
      {
        path: `/meshes/${meshId}`,
      },
      GetMeshSchema,
    );
  };

  public getByLink = async (meshLink: string): Promise<GetMeshResponse> => {
    if (meshLink.startsWith(RAVE_LINK_URL))
      return await this.__getRaveLink(meshLink);

    const { headers } = await request(meshLink);

    return await this.get(parseMeshId(headers.location as string));
  };

  public getMany = async (
    params: GetManyMeshesParams = {
      limit: 20,
      isPublic: true,
    },
  ): Promise<GetManyMeshesResponse> => {
    return await this.__http.sendGet<GetManyMeshesResponse>(
      {
        path: `/meshes/self?deviceId=${this.__config.credentials?.deviceId}&public=${!!params.isPublic}&friends=${!!params.hasFriends}&local=${!!params.local}&invited=${!!params.hasInvited}&limit=${params.limit}&lang=fuckravedevs`,
      },
      GetManyMeshesSchema,
    );
  };

  public join = async (meshId: string): Promise<MeshSocket> => {
    const mesh = await this.get(meshId);
    await this.__http.sendPost<StatusedResponse>(
      {
        baseUrl: EVENTS_API_URL,
        path: '/api/event',
        body: JSON.stringify({
          device: {
            ...PATCHED_DEVICE,
            id: this.__config.credentials?.deviceId,
          },
          event: 'mesh_join',
          mesh: {
            id: meshId,
            numFriends: 0,
            numStrangers: 0,
            numTotal: 1,
            visibility: 'PRIVATE',
          },
          screen: {
            name: 'LobbyActivity',
          },
          sessionId: randomUUID(),
          user: {
            id: this.__account.id,
            ip_api_data: PATCHED_IP_DATA,
          },
        }),
      },
      StatusSchema,
    );

    return new MeshSocket({
      meshId: meshId,
      server: mesh.data.server,
      userId: this.__account.id,
      credentials: {
        deviceId: this.__config.credentials!.deviceId,
        token: this.__config.credentials!.token,
      },
      proxy: this.__http.proxy,
    });
  };
}
