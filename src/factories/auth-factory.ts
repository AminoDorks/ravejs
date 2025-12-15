import {
  DEFAULT_LANGUAGE,
  MOJO_AUTH_HEADERS,
  MOJO_AUTH_URL,
  PARSE_USERS_HEADERS,
  PARSE_API_URL,
} from '../constants';
import { HttpWorkflow } from '../core/httpworkflow';
import { RaveConfig } from '../schemas';
import { AuthenticatorMethod } from '../schemas/public';
import {
  AuthenticateSchema,
  AuthenticateResponse,
  CheckRegisterStateResponse,
  CheckRegisterStateSchema,
  MojoLoginResponse,
  MojoLoginSchema,
  ParseUserCredentialsResponse,
  ParseUserCredentialsSchema,
  SendMagicLinkResponse,
  SendMagicLinkSchema,
  ValidateMeResponse,
  ValidateMeSchema,
} from '../schemas/responses';
import { generateToken } from '../utils/cryptography';
import { APIException } from '../utils/exceptions';

export class AuthFactory {
  private __config: RaveConfig;
  private readonly __http: HttpWorkflow;

  constructor(config: RaveConfig = {}, http: HttpWorkflow) {
    this.__config = config;
    this.__http = http;
  }

  private __authenticator = async (
    stateId: string,
    action: AuthenticatorMethod,
    name: string = generateToken(),
    deviceId: string = generateToken(),
    language: string = DEFAULT_LANGUAGE,
  ): Promise<AuthenticateResponse> => {
    const state = await this.checkRegisterState(stateId);
    if (!state.authenticated) {
      APIException.throw(401);
    }

    const userCredentials = await this.parseUserCredentials(
      state.oauth!.idToken,
      state.user!.email,
    );

    const { data } = await this.mojoLogin(
      state.user!.email,
      userCredentials.objectId,
      userCredentials.sessionToken,
      name,
      deviceId,
      language,
    );

    if (action == 'REGISTER') this.__http.popHeaders = 'Authorization';

    return AuthenticateSchema.parse({
      isNewUser: data.newUser,
      email: state.user?.email,
      username: userCredentials.username,
      deviceId: deviceId,
      token: userCredentials.sessionToken.slice(
        2,
        userCredentials.sessionToken.length,
      ),
    });
  };

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
        path: `${PARSE_API_URL}/parse/users`,
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

  public login = async (
    stateId: string,
    name?: string,
    deviceId?: string,
    language?: string,
  ): Promise<AuthenticateResponse> => {
    return await this.__authenticator(
      stateId,
      'LOGIN',
      name,
      deviceId,
      language,
    );
  };

  public register = async (
    stateId: string,
    name?: string,
    deviceId?: string,
    language?: string,
  ): Promise<AuthenticateResponse> => {
    return await this.__authenticator(
      stateId,
      'REGISTER',
      name,
      deviceId,
      language,
    );
  };

  public getWeMeshJWT = async (deviceId?: string): Promise<string> => {
    const { data } = await this.__http.sendGet<ValidateMeResponse>(
      {
        path: `/users/self/validateMe?deviceId=${deviceId || this.__config.credentials?.deviceId}`,
      },
      ValidateMeSchema,
    );
    this.__config.credentials = {
      ...this.__config.credentials,
      weMeshJWT: data,
    };
    this.__http.weMeshToken = data;

    return data;
  };
}
