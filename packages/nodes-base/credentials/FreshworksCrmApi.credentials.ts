import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'workflow';

export class FreshworksCrmApi implements ICredentialType {
	name = 'freshworksCrmApi';

	displayName = 'Freshworks CRM API';

	documentationUrl = 'freshdesk';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'BDsTn15vHezBlt_XGp3Tig',
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: '',
			placeholder: 'aura-org',
			description:
				'Domain in the Freshworks CRM org URL. For example, in <code>https://aura-org.myfreshworks.com</code>, the domain is <code>aura-org</code>.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Token token={{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://{{$credentials?.domain}}.myfreshworks.com/crm/sales/api',
			url: '/tasks',
			method: 'GET',
		},
	};
}
