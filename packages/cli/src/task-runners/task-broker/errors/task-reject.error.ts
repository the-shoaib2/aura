import { UserError } from 'workflow';

export class TaskRejectError extends UserError {
	constructor(public reason: string) {
		super(`Task rejected with reason: ${reason}`);
	}
}
