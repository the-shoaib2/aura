import { Config, Env } from '../decorators';

@Config
export class DynamicBannersConfig {
	@Env('N8N_DYNAMIC_BANNERS_ENDPOINT')
	endpoint: string = 'https://api.aura.io/api/banners';

	@Env('N8N_DYNAMIC_BANNERS_ENABLED')
	enabled: boolean = true;
}
