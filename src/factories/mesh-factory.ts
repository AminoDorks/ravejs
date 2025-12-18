import z from 'zod';
import { randomUUID } from 'crypto';

import {
  DEFAULT_LANGUAGE,
  EVENTS_API_URL,
  PATCHED_DEVICE,
  PATCHED_IP_DATA,
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
import { matchMeshId } from '../utils/utils';
import { MeshSocket } from '../core/mesh-socket';

export class MeshFactory {
  private readonly __config: RaveConfig;
  private readonly __http: HttpWorkflow;

  constructor(config: RaveConfig = {}, http: HttpWorkflow) {
    this.__config = config;
    this.__http = http;
  }

  public get = async (meshId: string): Promise<GetMeshResponse> => {
    return await this.__http.sendGet<GetMeshResponse>(
      {
        path: `/meshes/${meshId}`,
      },
      GetMeshSchema,
    );
  };

  public getByLink = async (meshLink: string): Promise<GetMeshResponse> => {
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

  public getMany = async (
    params: GetManyMeshesParams = {
      limit: 20,
      language: DEFAULT_LANGUAGE,
      isPublic: true,
    },
  ): Promise<GetManyMeshesResponse> => {
    return await this.__http.sendGet<GetManyMeshesResponse>(
      {
        path: `/meshes/self?deviceId=${this.__config.credentials?.deviceId}&public=${!!params.isPublic}&friends=${!!params.hasFriends}&local=${!!params.local}&invited=${!!params.hasInvited}&limit=${params.limit}&lang=${params.language}`,
      },
      GetManyMeshesSchema,
    );
  };

  public join = async (meshId: string) => {
    const mesh = await this.get(meshId);
    await this.__http.sendPost<StatusedResponse>(
      {
        baseUrl: EVENTS_API_URL,
        path: '/event',
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
            id: this.__config.account!.id,
            ip_api_data: PATCHED_IP_DATA,
          },
        }),
      },
      StatusSchema,
    );

    return new MeshSocket({
      meshId: meshId,
      server: mesh.data.server,
      userId: this.__config.account!.id,
      credentials: {
        deviceId: this.__config.credentials!.deviceId,
        token: this.__config.credentials!.token,
      },
    });
  };
}
