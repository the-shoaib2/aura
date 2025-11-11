import type { ITag } from '@aura/rest-api-client/api/tags';
import { Model } from 'miragejs';
import type { ModelDefinition } from 'miragejs/-types';

export const TagModel: ModelDefinition<ITag> = Model.extend({});
