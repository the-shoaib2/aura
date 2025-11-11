import type { ICredentialType, INodeProperties } from 'workflow';

export class McpOAuth2Api implements ICredentialType {
	name = 'mcpOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'MCP OAuth2 API';

	documentationUrl = 'mcp';

	properties: INodeProperties[] = [
		{
			displayName: 'Use Dynamic Client Registration',
			name: 'useDynamicClientRegistration',
			type: 'boolean',
			default: true,
			required: true,
		},
	];
}
