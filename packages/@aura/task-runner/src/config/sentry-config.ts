import { Config, Env } from '@aura/config';

@Config
export class SentryConfig {
	/** Sentry DSN (data source name) */
	@Env('N8N_SENTRY_DSN')
	dsn: string = '';

	//#region Metadata about the environment

	@Env('N8N_VERSION')
	auraVersion: string = '';

	@Env('ENVIRONMENT')
	environment: string = '';

	@Env('DEPLOYMENT_NAME')
	deploymentName: string = '';

	//#endregion
}
