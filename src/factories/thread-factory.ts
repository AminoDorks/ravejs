import { HttpWorkflow } from '../core/httpworkflow';
import { Thread } from '../schemas/rave/thread';
import { GetThreadsResponse, GetThreadsSchema } from '../schemas/responses';

export class ThreadFactory {
  private readonly __http: HttpWorkflow;

  constructor(http: HttpWorkflow) {
    this.__http = http;
  }

  public getMany = async (): Promise<Thread[]> => {
    return (
      await this.__http.sendWeMeshGet<GetThreadsResponse>(
        {
          path: '/dms',
        },
        GetThreadsSchema,
      )
    ).data;
  };
}
