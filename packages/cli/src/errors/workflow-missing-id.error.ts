import type { Workflow, IWorkflowBase } from 'workflow';
import { UnexpectedError } from 'workflow';

export class WorkflowMissingIdError extends UnexpectedError {
	constructor(workflow: Workflow | IWorkflowBase) {
		super('Detected ID-less worklfow', { extra: { workflow } });
	}
}
