/**
 * @integration/github Plugin
 *
 * GitHub repository automation
 */

import { BaseIntegration } from '../../base-integration';
import {
	type ActionDefinition,
	type IntegrationMetadata,
	type CredentialDefinition,
} from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@integration/github',
	version: '1.0.0',
	category: 'integration',
	description: 'GitHub repository automation',
	tags: ['github', 'git', 'repository', 'version-control'],
};

export class IntegrationGithubPlugin extends BaseIntegration {
	metadata = metadata;
	triggers?: undefined;

	credentials: CredentialDefinition[] = [
		{
			name: 'githubApi',
			displayName: 'GitHub API',
			type: 'apiKey',
			properties: [
				{ name: 'token', displayName: 'Personal Access Token', type: 'string', required: true },
			],
		},
	];

	actions: ActionDefinition[] = [
		{
			name: 'createRepository',
			displayName: 'Create Repository',
			description: 'Create a new GitHub repository',
			operation: 'createRepository',
			properties: [
				{ name: 'name', displayName: 'Repository Name', type: 'string', required: true },
				{ name: 'description', displayName: 'Description', type: 'string' },
				{ name: 'private', displayName: 'Private', type: 'boolean', default: false },
			],
		},
		{
			name: 'createIssue',
			displayName: 'Create Issue',
			description: 'Create a new issue',
			operation: 'createIssue',
			properties: [
				{ name: 'owner', displayName: 'Owner', type: 'string', required: true },
				{ name: 'repo', displayName: 'Repository', type: 'string', required: true },
				{ name: 'title', displayName: 'Title', type: 'string', required: true },
				{ name: 'body', displayName: 'Body', type: 'string' },
			],
		},
		{
			name: 'createPullRequest',
			displayName: 'Create Pull Request',
			description: 'Create a pull request',
			operation: 'createPullRequest',
			properties: [
				{ name: 'owner', displayName: 'Owner', type: 'string', required: true },
				{ name: 'repo', displayName: 'Repository', type: 'string', required: true },
				{ name: 'title', displayName: 'Title', type: 'string', required: true },
				{ name: 'head', displayName: 'Head Branch', type: 'string', required: true },
				{ name: 'base', displayName: 'Base Branch', type: 'string', required: true },
			],
		},
	];

	protected async executeAction(params: ExecuteParams): Promise<any> {
		const { operation, parameters, credentials } = params;
		const token = credentials?.githubApi?.token || credentials?.token;

		if (!token) {
			throw new Error('GitHub token is required');
		}

		const fetch = (await import('node-fetch')).default;
		const baseUrl = 'https://api.github.com';

		switch (operation) {
			case 'createRepository':
				const repoResponse = await fetch(`${baseUrl}/user/repos`, {
					method: 'POST',
					headers: {
						Authorization: `token ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: parameters.name,
						description: parameters.description,
						private: parameters.private || false,
					}),
				});
				return repoResponse.json();

			case 'createIssue':
				const issueResponse = await fetch(
					`${baseUrl}/repos/${parameters.owner}/${parameters.repo}/issues`,
					{
						method: 'POST',
						headers: {
							Authorization: `token ${token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							title: parameters.title,
							body: parameters.body,
						}),
					},
				);
				return issueResponse.json();

			case 'createPullRequest':
				const prResponse = await fetch(
					`${baseUrl}/repos/${parameters.owner}/${parameters.repo}/pulls`,
					{
						method: 'POST',
						headers: {
							Authorization: `token ${token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							title: parameters.title,
							head: parameters.head,
							base: parameters.base,
						}),
					},
				);
				return prResponse.json();

			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}
}
