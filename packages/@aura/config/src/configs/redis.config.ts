import { Config, Env } from '../decorators';

@Config
export class RedisConfig {
	/** Prefix for all Redis keys managed by aura. */
	@Env('N8N_REDIS_KEY_PREFIX')
	prefix: string = 'aura';
}
