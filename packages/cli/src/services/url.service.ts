import { GlobalConfig } from '@aura/config';
import { Service } from '@aura/di';

@Service()
export class UrlService {
	/** Returns the base URL aura is reachable from */
	readonly baseUrl: string;

	constructor(private readonly globalConfig: GlobalConfig) {
		this.baseUrl = this.generateBaseUrl();
	}

	/** Returns the base URL of the webhooks */
	getWebhookBaseUrl() {
		let urlBaseWebhook = this.trimQuotes(process.env.WEBHOOK_URL) || this.baseUrl;
		if (!urlBaseWebhook.endsWith('/')) {
			urlBaseWebhook += '/';
		}
		return urlBaseWebhook;
	}

	/** Return the aura instance base URL without trailing slash */
	getInstanceBaseUrl(): string {
		const auraBaseUrl =
			this.trimQuotes(this.globalConfig.editorBaseUrl) || this.getWebhookBaseUrl();

		return auraBaseUrl.endsWith('/') ? auraBaseUrl.slice(0, auraBaseUrl.length - 1) : auraBaseUrl;
	}

	private generateBaseUrl(): string {
		const { path, port, host, protocol } = this.globalConfig;

		if ((protocol === 'http' && port === 80) || (protocol === 'https' && port === 443)) {
			return `${protocol}://${host}${path}`;
		}
		return `${protocol}://${host}:${port}${path}`;
	}

	/** Remove leading and trailing double quotes from a URL. */
	private trimQuotes(url?: string) {
		return url?.replace(/^["]+|["]+$/g, '') ?? '';
	}
}
