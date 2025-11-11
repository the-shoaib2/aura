import type { ICredentialType, INodeProperties } from 'workflow';

export class TapfiliateApi implements ICredentialType {
	name = 'tapfiliateApi';

	displayName = 'Tapfiliate API';

	documentationUrl = 'tapfiliate';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			required: true,
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
}
