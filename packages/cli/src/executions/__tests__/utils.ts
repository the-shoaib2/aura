import type { EventMessageTypes as EventMessage } from '@/eventbus/event-message-classes';
import { EventMessageNode } from '@/eventbus/event-message-classes/event-message-node';
import { EventMessageWorkflow } from '@/eventbus/event-message-classes/event-message-workflow';

export const setupMessages = (executionId: string, workflowName: string): EventMessage[] => {
	return [
		new EventMessageWorkflow({
			eventName: 'aura.workflow.started',
			payload: { executionId },
		}),
		new EventMessageNode({
			eventName: 'aura.node.started',
			payload: {
				executionId,
				workflowName,
				nodeName: 'When clicking "Execute workflow"',
				nodeType: 'aura-nodes-base.manualTrigger',
				nodeId: '123',
			},
		}),
		new EventMessageNode({
			eventName: 'aura.node.finished',
			payload: {
				executionId,
				workflowName,
				nodeName: 'When clicking "Execute workflow"',
				nodeType: 'aura-nodes-base.manualTrigger',
				nodeId: '123',
			},
		}),
		new EventMessageNode({
			eventName: 'aura.node.started',
			payload: {
				executionId,
				workflowName,
				nodeName: 'DebugHelper',
				nodeType: 'aura-nodes-base.debugHelper',
				nodeId: '123',
			},
		}),
	];
};
