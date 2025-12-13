import { Dispatcher, request } from 'undici';
import BodyReadable from 'undici/types/readable';
import { z } from 'zod';

import { API_URL, WE_MESH_HEADERS } from '../constants';
import { HeadersType } from '../schemas/private';
import { generateHash } from '../utils/cryptography';
import { LOGGER } from '../utils/logger';
import { GetRequestConfig, PostRequestConfig } from '../schemas/configs';
import { isOk } from '../utils/utils';
import { APIException } from '../utils/exceptions';

export class HttpWorkflow {
  private __headers: HeadersType = WE_MESH_HEADERS;

  set headers(headers: HeadersType) {
    this.__headers = {
      ...this.__headers,
      ...headers,
    };
  }

  private __configureGetHeaders = (): HeadersType => {
    return {
      ...this.__headers,
      'request-ts': Date.now().toString(),
    };
  };

  private __configurePostHeaders = (data: string) => {
    const headers = this.__configureGetHeaders();

    return {
      ...headers,
      'request-hash': generateHash(
        headers.Authorization,
        headers['request-ts'],
        data.length,
      ),
    };
  };

  private __handleResponse = async <T>(
    statusCode: number,
    fullPath: string,
    body: BodyReadable & Dispatcher.BodyMixin,
    schema: z.ZodSchema,
  ): Promise<T> => {
    if (!isOk(statusCode)) {
      LOGGER.child({ path: fullPath }).error(statusCode);
      APIException.throw(statusCode);
    }

    const response = await body.text();
    LOGGER.child({ path: fullPath }).info(statusCode);

    return schema.parse(response) as T;
  };

  public sendGet = async <T>(
    config: GetRequestConfig,
    schema: z.ZodSchema,
  ): Promise<T> => {
    const { statusCode, body } = await request(`${API_URL}${config.path}`, {
      method: 'GET',
      headers: this.__configureGetHeaders(),
    });

    return await this.__handleResponse(statusCode, config.path, body, schema);
  };

  public sendPost = async <T>(
    config: PostRequestConfig,
    schema: z.ZodSchema,
  ): Promise<T> => {
    const { statusCode, body } = await request(`${API_URL}${config.path}`, {
      method: 'POST',
      headers: this.__configurePostHeaders(config.body),
      body: config.body,
    });

    return await this.__handleResponse(statusCode, config.path, body, schema);
  };
}
