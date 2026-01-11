import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';

import { MeshSocketConfig } from '../schemas/private';
import { SOCKET_PING_DELAY } from '../constants';
import { LOGGER } from '../utils/logger';
import { SocksProxyAgent } from 'socks-proxy-agent';

export class MeshSocket {
  private __config: MeshSocketConfig;
  private __url: string;
  private __websocket: WebSocket;

  constructor(config: MeshSocketConfig) {
    this.__config = config;
    this.__url = `wss://${this.__config.server}/?roomId=${this.__config.meshId}&peerId=${this.__config.userId}_${this.__config.credentials.deviceId}`;
    this.__websocket = new WebSocket(this.__url, 'protoo', {
      rejectUnauthorized: false,
      headers: {
        authorization: `Bearer ${this.__config.credentials.token}`,
        'API-Version': '4',
      },
      agent: this.__config.proxy
        ? new SocksProxyAgent(this.__config.proxy)
        : undefined,
    });

    this.__websocket.on('open', () => {
      LOGGER.info({ url: this.__url }, 'WebSocket opened');
      this.__sendFullyJoined();
    });

    setInterval(() => {
      try {
        this.__pingServer();
      } catch {}
    }, SOCKET_PING_DELAY);
  }

  private __send = (data: string) => {
    LOGGER.info({ url: this.__url, data }, 'Sending data');
    this.__websocket.send(data);
  };

  private __sendFullyJoined = () => {
    this.__send(
      JSON.stringify({
        data: {},
        id: 1207144,
        method: 'fullyJoined',
        request: true,
      }),
    );
  };

  private __pingServer = () => {
    this.__send(
      JSON.stringify({
        data: {},
        id: 8841449,
        method: 'clientPing',
        request: true,
      }),
    );
  };

  public onopen = (handler: () => void) => {
    LOGGER.info({ url: this.__url }, 'WebSocket opened');
    this.__websocket.onopen = handler;
  };

  public onclose = (handler: () => Promise<void>) => {
    LOGGER.info({ url: this.__url }, 'WebSocket closed');
    this.__websocket.on('close', handler);
  };

  public onerror = (handler: () => Promise<void>) => {
    LOGGER.error({ ur: this.__url }, 'Websocket error');
    this.__websocket.on('error', handler);
  };

  public onmessage = (handler: (data: string) => Promise<void>) => {
    LOGGER.info({ url: this.__url }, 'WebSocket message');
    this.__websocket.on('message', handler);
  };

  public sendMessage = (content: string): void => {
    this.__send(
      JSON.stringify({
        data: {
          chat: content,
          detected_lang: 'ru',
          id: randomUUID(),
          translations: {
            ru: content,
          },
        },
        method: 'chatMessage',
        notification: true,
      }),
    );
  };

  public leave = (): void => {
    this.__websocket.close();
  };
}
