import { UnexpectedError } from 'workflow';

export class AbortedExecutionRetryError extends UnexpectedError {
	constructor() {
		super('The execution was aborted before starting, so it cannot be retried');
	}
}
