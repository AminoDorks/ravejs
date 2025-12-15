import { AuthFactory } from '../factories/auth-factory';
import { MeshFactory } from '../factories/mesh-factory';
import { UserFactory } from '../factories/user-factory';
import { RaveConfig } from '../schemas/public';
import initLogger from '../utils/logger';
import { HttpWorkflow } from './httpworkflow';

export class Rave {
  private __config?: RaveConfig;
  private __http: HttpWorkflow;

  private __authFactory?: AuthFactory;
  private __userFactory?: UserFactory;
  private __meshFactory?: MeshFactory;

  constructor(config: RaveConfig = {}) {
    this.__config = config;
    this.__http = new HttpWorkflow();
    if (this.__config.credentials)
      this.__http.token = this.__config.credentials.token;

    initLogger(!!config.enableLogging);
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
}
