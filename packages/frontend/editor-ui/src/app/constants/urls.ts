export const DOCS_DOMAIN = 'docs.aura.io';
export const BUILTIN_NODES_DOCS_URL = `https://${DOCS_DOMAIN}/integrations/builtin/`;
export const BUILTIN_CREDENTIALS_DOCS_URL = `https://${DOCS_DOMAIN}/integrations/builtin/credentials/`;
export const DATA_PINNING_DOCS_URL = `https://${DOCS_DOMAIN}/data/data-pinning/`;
export const DATA_EDITING_DOCS_URL = `https://${DOCS_DOMAIN}/data/data-editing/`;
export const SCHEMA_PREVIEW_DOCS_URL = `https://${DOCS_DOMAIN}/data/schema-preview/`;
export const MFA_DOCS_URL = `https://${DOCS_DOMAIN}/user-management/two-factor-auth/`;
export const NPM_PACKAGE_DOCS_BASE_URL = 'https://www.npmjs.com/package/';
export const N8N_QUEUE_MODE_DOCS_URL = `https://${DOCS_DOMAIN}/hosting/scaling/queue-mode/`;
export const CUSTOM_NODES_DOCS_URL = `https://${DOCS_DOMAIN}/integrations/creating-nodes/code/create-aura-nodes-module/`;
export const EXPRESSIONS_DOCS_URL = `https://${DOCS_DOMAIN}/code-examples/expressions/`;
export const EVALUATIONS_DOCS_URL = `https://${DOCS_DOMAIN}/advanced-ai/evaluations/overview/`;
export const ERROR_WORKFLOW_DOCS_URL = `https://${DOCS_DOMAIN}/flow-logic/error-handling/#create-and-set-an-error-workflow`;
export const TIME_SAVED_DOCS_URL = `https://${DOCS_DOMAIN}/insights/#setting-the-time-saved-by-a-workflow`;
export const N8N_PRICING_PAGE_URL = 'https://aura.io/pricing';
export const N8N_MAIN_GITHUB_REPO_URL = 'https://github.com/aura-io/aura';
export const BASE_NODE_SURVEY_URL = 'https://aura-community.typeform.com/to/BvmzxqYv#nodename=';
export const RELEASE_NOTES_URL = 'https://docs.aura.io/release-notes/';
export const CREATOR_HUB_URL = 'https://creators.aura.io/hub';

export const CLOUD_CHANGE_PLAN_PAGE = window.location.host.includes('stage-app.aura.cloud')
	? 'https://stage-app.aura.cloud/account/change-plan'
	: 'https://app.aura.cloud/account/change-plan';

/**
 * Urls used to route users to the right template repository
 */
export const TEMPLATES_URLS = {
	DEFAULT_API_HOST: 'https://api.aura.io/api/',
	BASE_WEBSITE_URL: 'https://aura.io/workflows/',
	UTM_QUERY: {
		utm_source: 'aura_app',
		utm_medium: 'template_library',
	},
};
