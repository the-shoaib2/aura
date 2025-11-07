export * from './api';
export * from './instance';
export * from './execution';

export const LICENSE_FEATURES = {
	SHARING: 'feat:sharing',
	LDAP: 'feat:ldap',
	SAML: 'feat:saml',
	OIDC: 'feat:oidc',
	MFA_ENFORCEMENT: 'feat:mfaEnforcement',
	LOG_STREAMING: 'feat:logStreaming',
	ADVANCED_EXECUTION_FILTERS: 'feat:advancedExecutionFilters',
	VARIABLES: 'feat:variables',
	SOURCE_CONTROL: 'feat:sourceControl',
	API_DISABLED: 'feat:apiDisabled',
	EXTERNAL_SECRETS: 'feat:externalSecrets',
	SHOW_NON_PROD_BANNER: 'feat:showNonProdBanner',
	WORKFLOW_HISTORY: 'feat:workflowHistory',
	DEBUG_IN_EDITOR: 'feat:debugInEditor',
	BINARY_DATA_S3: 'feat:binaryDataS3',
	MULTIPLE_MAIN_INSTANCES: 'feat:multipleMainInstances',
	WORKER_VIEW: 'feat:workerView',
	ADVANCED_PERMISSIONS: 'feat:advancedPermissions',
	PROJECT_ROLE_ADMIN: 'feat:projectRole:admin',
	PROJECT_ROLE_EDITOR: 'feat:projectRole:editor',
	PROJECT_ROLE_VIEWER: 'feat:projectRole:viewer',
	AI_ASSISTANT: 'feat:aiAssistant',
	ASK_AI: 'feat:askAi',
	AI_CREDITS: 'feat:aiCredits',
	FOLDERS: 'feat:folders',
	API_KEY_SCOPES: 'feat:apiKeyScopes',
	WORKFLOW_DIFFS: 'feat:workflowDiffs',
	CUSTOM_ROLES: 'feat:customRoles',
	AI_BUILDER: 'feat:aiBuilder',
} as const;

export const LICENSE_QUOTAS = {
	TRIGGER_LIMIT: 'quota:activeWorkflows',
	VARIABLES_LIMIT: 'quota:maxVariables',
	USERS_LIMIT: 'quota:users',
	WORKFLOW_HISTORY_PRUNE_LIMIT: 'quota:workflowHistoryPrune',
	TEAM_PROJECT_LIMIT: 'quota:maxTeamProjects',
	AI_CREDITS: 'quota:aiCredits',
	WORKFLOWS_WITH_EVALUATION_LIMIT: 'quota:evaluations:maxWorkflows',
} as const;

export const UNLIMITED_LICENSE_QUOTA = -1;

export type BooleanLicenseFeature = (typeof LICENSE_FEATURES)[keyof typeof LICENSE_FEATURES];
export type NumericLicenseFeature = (typeof LICENSE_QUOTAS)[keyof typeof LICENSE_QUOTAS];

export const MIN_PASSWORD_CHAR_LENGTH = 8;
export const MAX_PASSWORD_CHAR_LENGTH = 64;
