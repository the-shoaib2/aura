import type { ITag } from '@aura/rest-api-client/api/tags';
import type { IRestApiContext } from '@aura/rest-api-client';
import { makeRestApiRequest } from '@aura/rest-api-client';
import type { CreateOrUpdateTagRequestDto, RetrieveTagQueryDto } from '@aura/api-types';

type TagsApiEndpoint = '/tags' | '/annotation-tags';

export function createTagsApi(endpoint: TagsApiEndpoint) {
	return {
		getTags: async (context: IRestApiContext, data: RetrieveTagQueryDto): Promise<ITag[]> => {
			return await makeRestApiRequest(context, 'GET', endpoint, data);
		},
		createTag: async (
			context: IRestApiContext,
			data: CreateOrUpdateTagRequestDto,
		): Promise<ITag> => {
			return await makeRestApiRequest(context, 'POST', endpoint, data);
		},
		updateTag: async (
			context: IRestApiContext,
			id: string,
			data: CreateOrUpdateTagRequestDto,
		): Promise<ITag> => {
			return await makeRestApiRequest(context, 'PATCH', `${endpoint}/${id}`, data);
		},
		deleteTag: async (context: IRestApiContext, id: string): Promise<boolean> => {
			return await makeRestApiRequest(context, 'DELETE', `${endpoint}/${id}`);
		},
	};
}
