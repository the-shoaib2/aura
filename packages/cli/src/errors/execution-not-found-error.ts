import { UnexpectedError } from 'workflow';

export class ExecutionNotFoundError extends UnexpectedError {
	constructor(executionId: string) {
		super('No active execution found', { extra: { executionId } });
	}
}
