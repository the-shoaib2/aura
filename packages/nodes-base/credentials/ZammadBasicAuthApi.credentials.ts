import type { ICredentialType, INodeProperties } from 'workflow';

export class ZammadBasicAuthApi implements ICredentialType {
	name = 'zammadBasicAuthApi';

	displayName = 'Zammad Basic Auth API';

	documentationUrl = 'zammad';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://aura-helpdesk.zammad.com',
			required: true,
		},
		{
			displayName: 'Email',
			name: 'username',
			type: 'string',
			default: '',
			placeholder: 'helpdesk@aura.io',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Ignore SSL Issues (Insecure)',
			name: 'allowUnauthorizedCerts',
			type: 'boolean',
			description: 'Whether to connect even if SSL certificate validation is not possible',
			default: false,
		},
	];
}
