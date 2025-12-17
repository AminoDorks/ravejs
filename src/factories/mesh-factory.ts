import z from 'zod';
import { DEFAULT_LANGUAGE } from '../constants';
import { HttpWorkflow } from '../core/httpworkflow';
import { GetManyMeshesParams, RaveConfig } from '../schemas';
import {
  GetManyMeshesResponse,
  GetManyMeshesSchema,
  GetMeshResponse,
  GetMeshSchema,
} from '../schemas/responses';
import { matchMeshId } from '../utils/utils';

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
}
