import { HttpWorkflow } from '../core/httpworkflow';
import { EditProfileBuilder, EditProfileBuilderSchema } from '../schemas';
import { EditProfileResponse } from '../schemas/responses';

export class UserFactory {
  private readonly __http: HttpWorkflow;

  constructor(http: HttpWorkflow) {
    this.__http = http;
  }

  public edit = async (
    builder: EditProfileBuilder,
  ): Promise<EditProfileResponse> => {
    return await this.__http.sendPut<EditProfileResponse>(
      {
        path: '/users/self',
        body: JSON.stringify(builder),
      },
      EditProfileBuilderSchema,
    );
  };
}
