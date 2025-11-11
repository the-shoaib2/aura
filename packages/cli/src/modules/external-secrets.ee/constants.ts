import type { INodeProperties } from 'workflow';

export const EXTERNAL_SECRETS_DB_KEY = 'feature.externalSecrets';
export const EXTERNAL_SECRETS_INITIAL_BACKOFF = 10 * 1000;
export const EXTERNAL_SECRETS_MAX_BACKOFF = 5 * 60 * 1000;

export const EXTERNAL_SECRETS_NAME_REGEX = /^[a-zA-Z0-9\-\_\/]+$/;

export const DOCS_HELP_NOTICE: INodeProperties = {
	displayName:
		'Need help filling out these fields? <a href="https://docs.aura.io/external-secrets/#connect-aura-to-your-secrets-store" target="_blank">Open docs</a>',
	name: 'notice',
	type: 'notice',
	default: '',
	noDataExpression: true,
};
