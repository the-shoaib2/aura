import type { IUser } from '@aura/rest-api-client/api/users';
import { Model } from 'miragejs';
import type { ModelDefinition } from 'miragejs/-types';

export const UserModel: ModelDefinition<IUser> = Model.extend({});
