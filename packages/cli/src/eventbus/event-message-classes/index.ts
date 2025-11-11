import type { EventMessageAiNode } from './event-message-ai-node';
import type { EventMessageAudit } from './event-message-audit';
import type { EventMessageExecution } from './event-message-execution';
import type { EventMessageGeneric } from './event-message-generic';
import type { EventMessageNode } from './event-message-node';
import type { EventMessageQueue } from './event-message-queue';
import type { EventMessageRunner } from './event-message-runner';
import type { EventMessageWorkflow } from './event-message-workflow';

export const eventNamesAiNodes = [
	'aura.ai.memory.get.messages',
	'aura.ai.memory.added.message',
	'aura.ai.output.parser.parsed',
	'aura.ai.retriever.get.relevant.documents',
	'aura.ai.embeddings.embedded.document',
	'aura.ai.embeddings.embedded.query',
	'aura.ai.document.processed',
	'aura.ai.text.splitter.split',
	'aura.ai.tool.called',
	'aura.ai.vector.store.searched',
	'aura.ai.llm.generated',
	'aura.ai.llm.error',
	'aura.ai.vector.store.populated',
	'aura.ai.vector.store.updated',
] as const;

export type EventNamesAiNodesType = (typeof eventNamesAiNodes)[number];

export const eventNamesRunner = [
	'aura.runner.task.requested',
	'aura.runner.response.received',
] as const;

export type EventNamesRunnerType = (typeof eventNamesRunner)[number];

export const eventNamesQueue = [
	'aura.queue.job.enqueued',
	'aura.queue.job.dequeued',
	'aura.queue.job.completed',
	'aura.queue.job.failed',
	'aura.queue.job.stalled',
] as const;

export type EventNamesQueueType = (typeof eventNamesQueue)[number];

export const eventNamesWorkflow = [
	'aura.workflow.started',
	'aura.workflow.success',
	'aura.workflow.failed',
] as const;
export const eventNamesGeneric = ['aura.worker.started', 'aura.worker.stopped'] as const;
export const eventNamesNode = ['aura.node.started', 'aura.node.finished'] as const;
export const eventNamesExecution = [
	'aura.execution.throttled',
	'aura.execution.started-during-bootup',
] as const;
export const eventNamesAudit = [
	'aura.audit.user.login.success',
	'aura.audit.user.login.failed',
	'aura.audit.user.signedup',
	'aura.audit.user.updated',
	'aura.audit.user.deleted',
	'aura.audit.user.invited',
	'aura.audit.user.invitation.accepted',
	'aura.audit.user.reinvited',
	'aura.audit.user.email.failed',
	'aura.audit.user.reset.requested',
	'aura.audit.user.reset',
	'aura.audit.user.credentials.created',
	'aura.audit.user.credentials.shared',
	'aura.audit.user.credentials.updated',
	'aura.audit.user.credentials.deleted',
	'aura.audit.user.api.created',
	'aura.audit.user.api.deleted',
	'aura.audit.package.installed',
	'aura.audit.package.updated',
	'aura.audit.package.deleted',
	'aura.audit.workflow.created',
	'aura.audit.workflow.deleted',
	'aura.audit.workflow.updated',
	'aura.audit.workflow.archived',
	'aura.audit.workflow.unarchived',
] as const;

export type EventNamesWorkflowType = (typeof eventNamesWorkflow)[number];
export type EventNamesAuditType = (typeof eventNamesAudit)[number];
export type EventNamesNodeType = (typeof eventNamesNode)[number];
export type EventNamesExecutionType = (typeof eventNamesExecution)[number];
export type EventNamesGenericType = (typeof eventNamesGeneric)[number];

export type EventNamesTypes =
	| EventNamesAuditType
	| EventNamesWorkflowType
	| EventNamesNodeType
	| EventNamesExecutionType
	| EventNamesGenericType
	| EventNamesAiNodesType
	| EventNamesRunnerType
	| EventNamesQueueType
	| 'aura.destination.test';

export const eventNamesAll = [
	...eventNamesAudit,
	...eventNamesWorkflow,
	...eventNamesNode,
	...eventNamesGeneric,
	...eventNamesAiNodes,
	...eventNamesRunner,
	...eventNamesQueue,
];

export type EventMessageTypes =
	| EventMessageGeneric
	| EventMessageWorkflow
	| EventMessageAudit
	| EventMessageNode
	| EventMessageExecution
	| EventMessageAiNode
	| EventMessageQueue
	| EventMessageRunner;
