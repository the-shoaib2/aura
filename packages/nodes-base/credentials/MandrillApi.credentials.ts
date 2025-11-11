import type { ICredentialType, INodeProperties } from 'workflow';

export class MandrillApi implements ICredentialType {
	name = 'mandrillApi';

	displayName = 'Mandrill API';

	documentationUrl = 'mandrill';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
}
