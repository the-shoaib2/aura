import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	INode,
} from 'workflow';

import { brandfetchApiRequest } from '../GenericFunctions';

export const node: INode = {
	id: 'c4a5ca75-18c7-4cc8-bf7d-5d57bb7d84da',
	name: 'Brandfetch',
	type: 'aura-nodes-base.Brandfetch',
	typeVersion: 1,
	position: [0, 0],
	parameters: {
		operation: 'font',
		domain: 'aura.io',
	},
};

describe('Brandfetch', () => {
	describe('brandfetchApiRequest', () => {
		const mockThis = {
			helpers: {
				requestWithAuthentication: jest.fn().mockResolvedValue({ statusCode: 200 }),
			},
			getNode() {
				return node;
			},
			getNodeParameter: jest.fn(),
		} as unknown as IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions;

		it('should make an authenticated API request to Brandfetch', async () => {
			const method: IHttpRequestMethods = 'GET';
			const resource = '/brands/aura.io';

			await brandfetchApiRequest.call(mockThis, method, resource);

			expect(mockThis.helpers.requestWithAuthentication).toHaveBeenCalledWith('brandfetchApi', {
				method: 'GET',
				url: 'https://api.brandfetch.io/v2/brands/aura.io',
				json: true,
			});
		});
	});
});
