import type { PushMessage } from '@aura/api-types';

export type PushMessageQueueItem = {
	message: PushMessage;
	retriesLeft: number;
};
