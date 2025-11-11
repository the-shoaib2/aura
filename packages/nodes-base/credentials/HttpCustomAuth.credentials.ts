/* eslint-disable aura-nodes-base/cred-class-field-name-unsuffixed */
/* eslint-disable aura-nodes-base/cred-class-name-unsuffixed */
import type { ICredentialType, INodeProperties, Icon } from 'workflow';

export class HttpCustomAuth implements ICredentialType {
	name = 'httpCustomAuth';

	displayName = 'Custom Auth';

	documentationUrl = 'httprequest';

	genericAuth = true;

	icon: Icon = 'node:aura-nodes-base.httpRequest';

	properties: INodeProperties[] = [
		{
			displayName: 'JSON',
			name: 'json',
			type: 'json',
			required: true,
			description: 'Use json to specify authentication values for headers, body and qs.',
			placeholder:
				'{ "headers": { "key" : "value" }, "body": { "key": "value" }, "qs": { "key": "value" } }',
			default: '',
		},
	];
}
