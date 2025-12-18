import { AuthFactory } from '../factories/auth-factory';
import { MeshFactory } from '../factories/mesh-factory';
import { UserFactory } from '../factories/user-factory';
import { RaveConfig } from '../schemas/public';
import initLogger, { LOGGER } from '../utils/logger';
import { HttpWorkflow } from './httpworkflow';
import {
  GetAccountResponse,
  GetAccountSchema,
  ValidateMeResponse,
  ValidateMeSchema,
} from '../schemas/responses';
import { ThreadFactory } from '../factories/thread-factory';
import { Account } from '../schemas/rave/account';
import { DEFAULT_LANGUAGE, PATCHED_DEVICE } from '../constants';
import { validateProxy } from '../utils/utils';

export class Rave {
  private __config?: RaveConfig;
  private __http: HttpWorkflow;

  private __authFactory?: AuthFactory;
  private __userFactory?: UserFactory;
  private __meshFactory?: MeshFactory;
  private __threadFactory?: ThreadFactory;

  constructor(config: RaveConfig = {}) {
    this.__config = config;
    this.__http = new HttpWorkflow();

    if (this.__config.credentials?.token) {
      this.__http.token = this.__config.credentials.token;
      this.getAccount();

      if (this.__config.credentials?.autoJWT) this.refreshJWT();
    }

    initLogger(!!config.enableLogging);
  }

  get token() {
    return this.__http.token;
  }

  get JWT() {
    return this.__http.weMeshToken;
  }

  get account() {
    if (!this.__config?.account) {
      throw new Error('Account not found');
    }

    return this.__config.account;
  }

  get auth() {
    if (!this.__authFactory)
      return (this.__authFactory = new AuthFactory(this.__config, this.__http));
    return this.__authFactory;
  }

  get user() {
    if (!this.__userFactory)
      return (this.__userFactory = new UserFactory(this.__http));
    return this.__userFactory;
  }

  get mesh() {
    if (!this.__meshFactory)
      return (this.__meshFactory = new MeshFactory(this.__config, this.__http));
    return this.__meshFactory;
  }

  get thread() {
    if (!this.__threadFactory)
      return (this.__threadFactory = new ThreadFactory(this.__http));
    return this.__threadFactory;
  }

  get proxy(): string | undefined {
    return this.__http.proxy;
  }

  set proxy(proxy: string) {
    try {
      this.__http.setProxy(proxy, validateProxy(proxy));
    } catch {
      LOGGER.error({ proxy }, 'Invalid proxy');
    }
  }

  public refreshJWT = async (deviceId?: string): Promise<string> => {
    const { data } = await this.__http.sendGet<ValidateMeResponse>(
      {
        path: `/users/self/validateMe?deviceId=${deviceId || this.__config?.credentials?.deviceId}`,
      },
      ValidateMeSchema,
    );
    this.__http.weMeshToken = data;

    return data;
  };

  public getAccount = async (): Promise<Account> => {
    const { data } = await this.__http.sendPost<GetAccountResponse>(
      {
        path: '/auth/login',
        body: JSON.stringify({
          adId: PATCHED_DEVICE.adId,
          carrierCountry: DEFAULT_LANGUAGE.toUpperCase(),
          deviceId: this.__config?.credentials?.deviceId,
          lang: DEFAULT_LANGUAGE,
          storeCountry: DEFAULT_LANGUAGE.toUpperCase(),
        }),
      },
      GetAccountSchema,
    );

    this.__config = {
      ...this.__config,
      account: data,
    };

    return this.__config.account!;
  };
}
