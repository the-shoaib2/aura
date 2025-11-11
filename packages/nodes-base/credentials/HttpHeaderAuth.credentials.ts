import type { IAuthenticateGeneric, ICredentialType, INodeProperties, Icon } from 'workflow';

export class HttpHeaderAuth implements ICredentialType {
	name = 'httpHeaderAuth';

	displayName = 'Header Auth';

	documentationUrl = 'httprequest';

	genericAuth = true;

	icon: Icon = 'node:aura-nodes-base.httpRequest';

	properties: INodeProperties[] = [
		{
			displayName: 'Name',
			name: 'name',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Value',
			name: 'value',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'To send multiple headers, use a "Custom Auth" credential instead',
			name: 'useCustomAuth',
			type: 'notice',
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'={{$credentials.name}}': '={{$credentials.value}}',
			},
		},
	};
}
