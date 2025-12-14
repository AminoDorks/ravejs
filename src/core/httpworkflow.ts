import { Dispatcher, request } from 'undici';
import BodyReadable from 'undici/types/readable';
import { z } from 'zod';

import { API_URL, WE_MESH_HEADERS } from '../constants';
import { HeadersType, MethodType } from '../schemas/private';
import { generateHash } from '../utils/cryptography';
import { LOGGER } from '../utils/logger';
import {
  GetRequestConfig,
  PostRequestConfig,
  RawRequestConfig,
} from '../schemas/configs';
import { isOk } from '../utils/utils';
import { APIException } from '../utils/exceptions';

export class HttpWorkflow {
  private __headers: HeadersType = WE_MESH_HEADERS;

  get token(): string {
    return this.__headers.Authorization.slice(
      7,
      this.__headers.Authorization.length,
    );
  }

  set token(token: string) {
    this.__headers.Authorization = `Bearer ${token}`;
  }

  private __configureHeaders = (): HeadersType => {
    return {
      ...this.__headers,
      'request-ts': Date.now().toString(),
    };
  };

  private __configureDataHeaders = (data: string) => {
    const headers = this.__configureHeaders();

    return {
      ...headers,
      'request-hash': generateHash(
        this.token,
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

    return schema.parse(JSON.parse(response)) as T;
  };

  private __sendDataRequest = async <T>(
    method: MethodType,
    config: PostRequestConfig,
    schema: z.ZodSchema,
  ): Promise<T> => {
    const { statusCode, body } = await request(`${API_URL}${config.path}`, {
      method,
      headers: this.__configureDataHeaders(config.body),
      body: config.body,
    });

    return await this.__handleResponse(
      statusCode,
      `${API_URL}${config.path}`,
      body,
      schema,
    );
  };

  public sendGet = async <T>(
    config: GetRequestConfig,
    schema: z.ZodSchema,
  ): Promise<T> => {
    const { statusCode, body } = await request(`${API_URL}${config.path}`, {
      method: 'GET',
      headers: this.__configureHeaders(),
    });

    return await this.__handleResponse(
      statusCode,
      `${API_URL}${config.path}`,
      body,
      schema,
    );
  };

  public sendPost = async <T>(
    config: PostRequestConfig,
    schema: z.ZodSchema,
  ): Promise<T> => {
    return await this.__sendDataRequest('POST', config, schema);
  };

  public sendPut = async <T>(
    config: PostRequestConfig,
    schema: z.ZodSchema,
  ): Promise<T> => {
    return await this.__sendDataRequest('PUT', config, schema);
  };

  public sendRaw = async <T>(
    config: RawRequestConfig,
    schema: z.ZodSchema,
  ): Promise<T> => {
    const { statusCode, body } = await request(config.path, {
      headers: config.headers,
      method: config.method,
      body: config.body,
    });

    return await this.__handleResponse(statusCode, config.path, body, schema);
  };
}
