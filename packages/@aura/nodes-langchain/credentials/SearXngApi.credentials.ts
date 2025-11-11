import type { ICredentialType, INodeProperties } from 'workflow';

export class SearXngApi implements ICredentialType {
	name = 'searXngApi';

	displayName = 'SearXNG';

	documentationUrl = 'searxng';

	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
			required: true,
		},
	];
}
