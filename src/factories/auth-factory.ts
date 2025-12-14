import {
  DEFAULT_LANGUAGE,
  MOJO_AUTH_HEADERS,
  MOJO_AUTH_URL,
  PARSE_USERS_HEADERS,
  THIRD_API_URL,
} from '../constants';
import { HttpWorkflow } from '../core/httpworkflow';
import { RaveConfig } from '../schemas';
import {
  CheckRegisterStateResponse,
  CheckRegisterStateSchema,
  MojoLoginResponse,
  MojoLoginSchema,
  ParseUserCredentialsResponse,
  ParseUserCredentialsSchema,
  SendMagicLinkResponse,
  SendMagicLinkSchema,
} from '../schemas/responses';
import { generateToken } from '../utils/cryptography';

export class AuthFactory {
  private __config: RaveConfig;
  private readonly __http: HttpWorkflow;

  constructor(config: RaveConfig = {}, http: HttpWorkflow) {
    this.__config = config;
    this.__http = http;
  }

  public sendMagicLink = async (
    email: string,
    language: string = DEFAULT_LANGUAGE,
  ): Promise<SendMagicLinkResponse> => {
    return await this.__http.sendRaw<SendMagicLinkResponse>(
      {
        method: 'POST',
        path: `${MOJO_AUTH_URL}/users/magiclink?language=${language}&redirect_url=https://rave.watch/mojoauth`,
        body: JSON.stringify({ email }),
        headers: MOJO_AUTH_HEADERS,
      },
      SendMagicLinkSchema,
    );
  };

  public checkRegisterState = async (
    stateId: string,
  ): Promise<CheckRegisterStateResponse> => {
    return await this.__http.sendRaw<CheckRegisterStateResponse>(
      {
        method: 'GET',
        path: `${MOJO_AUTH_URL}/users/status?state_id=${stateId}`,
        headers: MOJO_AUTH_HEADERS,
      },
      CheckRegisterStateSchema,
    );
  };

  public parseUserCredentials = async (
    idToken: string,
    email: string,
  ): Promise<ParseUserCredentialsResponse> => {
    return await this.__http.sendRaw(
      {
        method: 'POST',
        headers: PARSE_USERS_HEADERS,
        path: `${THIRD_API_URL}/parse/users`,
        body: JSON.stringify({
          authData: {
            mojo: {
              id_token: idToken,
              id: email,
            },
          },
        }),
      },
      ParseUserCredentialsSchema,
    );
  };

  public mojoLogin = async (
    email: string,
    parseId: string,
    parseToken: string,
    name: string,
    deviceId: string = generateToken(),
    language: string = DEFAULT_LANGUAGE,
  ): Promise<MojoLoginResponse> => {
    this.__http.token = parseToken.slice(1, parseToken.length);
    this.__config.credentials = {
      token: this.__http.token,
      deviceId,
    };

    return await this.__http.sendPost(
      {
        path: '/auth2/mojo/login',
        body: JSON.stringify({
          deviceId,
          email,
          name,
          parseId,
          parseToken,
          lang: language,
          platId: email,
        }),
      },
      MojoLoginSchema,
    );
  };
}
