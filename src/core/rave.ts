import { RaveConfig } from '../schemas/public';
import initLogger from '../utils/logger';
import { HttpWorkflow } from './httpworkflow';

export class Rave {
  private __config: RaveConfig;
  private __http: HttpWorkflow;

  constructor(config: RaveConfig) {
    this.__config = config;
    this.__http = new HttpWorkflow();
    this.__http.headers = {
      Authorization: `Bearer ${this.__config.credentials?.token}`,
    };

    initLogger(!!config.enableLogging);
  }
}
