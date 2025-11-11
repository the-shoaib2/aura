import type { ICredentialType, INodeProperties } from 'workflow';

export class ProfitWellApi implements ICredentialType {
	name = 'profitWellApi';

	displayName = 'ProfitWell API';

	documentationUrl = 'profitwell';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Private Token',
		},
	];
}
