import type { Risk } from '@/security-audit/types';

/**
 * Risk categories
 */

export const RISK_CATEGORIES: Risk.Category[] = [
	'credentials',
	'database',
	'nodes',
	'instance',
	'filesystem',
];

/**
 * Node types
 */

export const SQL_NODE_TYPES_WITH_QUERY_PARAMS = new Set([
	'aura-nodes-base.postgres',
	'aura-nodes-base.crateDb',
	'aura-nodes-base.questDb',
	'aura-nodes-base.timescaleDb',
]);

export const SQL_NODE_TYPES = new Set([
	...SQL_NODE_TYPES_WITH_QUERY_PARAMS,
	'aura-nodes-base.mySql',
	'aura-nodes-base.microsoftSql',
	'aura-nodes-base.snowflake',
]);

export const WEBHOOK_NODE_TYPE = 'aura-nodes-base.webhook';

export const WEBHOOK_VALIDATOR_NODE_TYPES = new Set([
	'aura-nodes-base.if',
	'aura-nodes-base.switch',
	'aura-nodes-base.code',
	'aura-nodes-base.function',
	'aura-nodes-base.functionItem',
]);

export const FILESYSTEM_INTERACTION_NODE_TYPES = new Set([
	'aura-nodes-base.readPdf',
	'aura-nodes-base.readBinaryFile',
	'aura-nodes-base.readBinaryFiles',
	'aura-nodes-base.spreadsheetFile',
	'aura-nodes-base.writeBinaryFile',
]);

export const OFFICIAL_RISKY_NODE_TYPES = new Set([
	'aura-nodes-base.executeCommand',
	'aura-nodes-base.code',
	'aura-nodes-base.function',
	'aura-nodes-base.functionItem',
	'aura-nodes-base.httpRequest',
	'aura-nodes-base.ssh',
	'aura-nodes-base.ftp',
]);

/**
 * Risk reports
 */

export const DATABASE_REPORT = {
	RISK: 'database',
	SECTIONS: {
		EXPRESSIONS_IN_QUERIES: 'Expressions in "Execute Query" fields in SQL nodes',
		EXPRESSIONS_IN_QUERY_PARAMS: 'Expressions in "Query Parameters" fields in SQL nodes',
		UNUSED_QUERY_PARAMS: 'Unused "Query Parameters" fields in SQL nodes',
	},
} as const;

export const CREDENTIALS_REPORT = {
	RISK: 'credentials',
	SECTIONS: {
		CREDS_NOT_IN_ANY_USE: 'Credentials not used in any workflow',
		CREDS_NOT_IN_ACTIVE_USE: 'Credentials not used in any active workflow',
		CREDS_NOT_RECENTLY_EXECUTED: 'Credentials not used in recently executed workflows',
	},
} as const;

export const FILESYSTEM_REPORT = {
	RISK: 'filesystem',
	SECTIONS: {
		FILESYSTEM_INTERACTION_NODES: 'Nodes that interact with the filesystem',
	},
} as const;

export const NODES_REPORT = {
	RISK: 'nodes',
	SECTIONS: {
		OFFICIAL_RISKY_NODES: 'Official risky nodes',
		COMMUNITY_NODES: 'Community nodes',
		CUSTOM_NODES: 'Custom nodes',
	},
} as const;

export const INSTANCE_REPORT = {
	RISK: 'instance',
	SECTIONS: {
		UNPROTECTED_WEBHOOKS: 'Unprotected webhooks in instance',
		OUTDATED_INSTANCE: 'Outdated instance',
		SECURITY_SETTINGS: 'Security settings',
	},
} as const;

/**
 * URLs
 */

export const ENV_VARS_DOCS_URL =
	'https://docs.aura.io/hosting/configuration/environment-variables/';

export const DB_QUERY_PARAMS_DOCS_URL =
	'https://docs.aura.io/integrations/builtin/app-nodes/aura-nodes-base.postgres#use-query-parameters';

export const COMMUNITY_NODES_RISKS_URL = 'https://docs.aura.io/integrations/community-nodes/risks';

export const NPM_PACKAGE_URL = 'https://www.npmjs.com/package';
