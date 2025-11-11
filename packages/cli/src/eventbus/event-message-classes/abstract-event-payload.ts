import type { IWorkflowBase, JsonValue } from 'workflow';

export interface AbstractEventPayload {
	[key: string]: JsonValue | IWorkflowBase | undefined;
}
