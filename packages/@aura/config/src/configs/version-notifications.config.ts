import { Config, Env } from '../decorators';

@Config
export class VersionNotificationsConfig {
	/** Whether to request notifications about new aura versions */
	@Env('N8N_VERSION_NOTIFICATIONS_ENABLED')
	enabled: boolean = true;

	/** Endpoint to retrieve aura version information from */
	@Env('N8N_VERSION_NOTIFICATIONS_ENDPOINT')
	endpoint: string = 'https://api.aura.io/api/versions/';

	/** Whether to request What's New articles. Also requires `N8N_VERSION_NOTIFICATIONS_ENABLED` to be enabled */
	@Env('N8N_VERSION_NOTIFICATIONS_WHATS_NEW_ENABLED')
	whatsNewEnabled: boolean = true;

	/** Endpoint to retrieve "What's New" articles from */
	@Env('N8N_VERSION_NOTIFICATIONS_WHATS_NEW_ENDPOINT')
	whatsNewEndpoint: string = 'https://api.aura.io/api/whats-new';

	/** URL for versions panel to page instructing user on how to update aura instance */
	@Env('N8N_VERSION_NOTIFICATIONS_INFO_URL')
	infoUrl: string = 'https://docs.aura.io/hosting/installation/updating/';
}
