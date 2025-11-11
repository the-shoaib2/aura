import type { ImagePullPolicy } from 'testcontainers';
import { PullPolicy } from 'testcontainers';

/**
 * Custom pull policy for aura images:
 * - Never try to pull the local image
 * - Otherwise, use the default pull policy (pull only if not present)
 */
export class N8nImagePullPolicy implements ImagePullPolicy {
	constructor(private readonly image: string) {}

	shouldPull(): boolean {
		if (this.image === 'auraio/aura:local') {
			return false;
		}

		return PullPolicy.defaultPolicy().shouldPull();
	}
}
