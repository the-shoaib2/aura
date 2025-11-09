/**
 * @integration/openai Plugin
 *
 * OpenAI models integration
 */

import { BaseIntegration } from '../../base-integration';
import {
	type ActionDefinition,
	type IntegrationMetadata,
	type CredentialDefinition,
} from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@integration/openai',
	version: '1.0.0',
	category: 'integration',
	description: 'OpenAI models integration',
	tags: ['openai', 'ai', 'gpt', 'llm', 'chatgpt'],
};

export class IntegrationOpenaiPlugin extends BaseIntegration {
	metadata = metadata;
	triggers?: undefined;

	credentials: CredentialDefinition[] = [
		{
			name: 'openaiApi',
			displayName: 'OpenAI API',
			type: 'apiKey',
			properties: [{ name: 'apiKey', displayName: 'API Key', type: 'string', required: true }],
		},
	];

	actions: ActionDefinition[] = [
		{
			name: 'chat',
			displayName: 'Chat Completion',
			description: 'Generate chat completion',
			operation: 'chat',
			properties: [
				{
					name: 'model',
					displayName: 'Model',
					type: 'string',
					default: 'gpt-3.5-turbo',
					options: [
						{ name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
						{ name: 'GPT-4', value: 'gpt-4' },
						{ name: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
					],
				},
				{
					name: 'messages',
					displayName: 'Messages',
					type: 'json',
					required: true,
					description: 'Array of messages',
				},
				{ name: 'temperature', displayName: 'Temperature', type: 'number', default: 1.0 },
				{ name: 'maxTokens', displayName: 'Max Tokens', type: 'number' },
			],
		},
		{
			name: 'embeddings',
			displayName: 'Create Embeddings',
			description: 'Generate embeddings',
			operation: 'embeddings',
			properties: [
				{ name: 'model', displayName: 'Model', type: 'string', default: 'text-embedding-ada-002' },
				{ name: 'input', displayName: 'Input', type: 'string', required: true },
			],
		},
	];

	protected async executeAction(params: ExecuteParams): Promise<any> {
		const { operation, parameters, credentials } = params;
		const apiKey = credentials?.openaiApi?.apiKey || credentials?.apiKey;

		if (!apiKey) {
			throw new Error('OpenAI API key is required');
		}

		const fetch = (await import('node-fetch')).default;
		const baseUrl = 'https://api.openai.com/v1';

		switch (operation) {
			case 'chat':
				const chatResponse = await fetch(`${baseUrl}/chat/completions`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${apiKey}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: parameters.model || 'gpt-3.5-turbo',
						messages: parameters.messages,
						temperature: parameters.temperature || 1.0,
						max_tokens: parameters.maxTokens,
					}),
				});
				return chatResponse.json();

			case 'embeddings':
				const embedResponse = await fetch(`${baseUrl}/embeddings`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${apiKey}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: parameters.model || 'text-embedding-ada-002',
						input: parameters.input,
					}),
				});
				return embedResponse.json();

			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
