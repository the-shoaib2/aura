export const INSTANCE_TYPES = {
	MAIN: 'main',
	WORKER: 'worker',
	WEBHOOK: 'webhook',
} as const;

export type InstanceType = (typeof INSTANCE_TYPES)[keyof typeof INSTANCE_TYPES];
