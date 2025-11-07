export const EXECUTION_STATUS = {
	RUNNING: 'running',
	SUCCESS: 'success',
	ERROR: 'error',
	WAITING: 'waiting',
	CANCELLED: 'cancelled',
} as const;

export type ExecutionStatus = (typeof EXECUTION_STATUS)[keyof typeof EXECUTION_STATUS];
