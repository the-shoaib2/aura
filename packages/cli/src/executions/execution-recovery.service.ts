import { Logger } from '@aura/backend-common';
import type { IExecutionResponse } from '@aura/db';
import { ExecutionRepository } from '@aura/db';
import { Service } from '@aura/di';
import type { DateTime } from 'luxon';
import { InstanceSettings } from 'aura-core';
import { sleep } from 'workflow';
import type { IRun, ITaskData } from 'workflow';

import { ARTIFICIAL_TASK_DATA } from '@/constants';
import { NodeCrashedError } from '@/errors/node-crashed.error';
import { WorkflowCrashedError } from '@/errors/workflow-crashed.error';
import { getLifecycleHooksForRegularMain } from '@/execution-lifecycle/execution-lifecycle-hooks';
import { Push } from '@/push';

import type { EventMessageTypes } from '../eventbus/event-message-classes';

/**
 * Service for recovering key properties in executions.
 */
@Service()
export class ExecutionRecoveryService {
	constructor(
		private readonly logger: Logger,
		private readonly instanceSettings: InstanceSettings,
		private readonly push: Push,
		private readonly executionRepository: ExecutionRepository,
	) {}

	/**
	 * Recover key properties of a truncated execution using event logs.
	 */
	async recoverFromLogs(executionId: string, messages: EventMessageTypes[]) {
		if (this.instanceSettings.isFollower) return;

		const amendedExecution = await this.amend(executionId, messages);

		if (!amendedExecution) return null;

		this.logger.info('[Recovery] Logs available, amended execution', {
			executionId: amendedExecution.id,
		});

		await this.executionRepository.updateExistingExecution(executionId, amendedExecution);

		await this.runHooks(amendedExecution);

		this.push.once('editorUiConnected', async () => {
			await sleep(1000);
			this.push.broadcast({ type: 'executionRecovered', data: { executionId } });
		});

		return amendedExecution;
	}

	// ----------------------------------
	//             private
	// ----------------------------------

	/**
	 * Amend `status`, `stoppedAt`, and (if possible) `data` of an execution using event logs.
	 */
	private async amend(executionId: string, messages: EventMessageTypes[]) {
		if (messages.length === 0) return await this.amendWithoutLogs(executionId);

		const { nodeMessages, workflowMessages } = this.toRelevantMessages(messages);

		if (nodeMessages.length === 0) return null;

		const execution = await this.executionRepository.findSingleExecution(executionId, {
			includeData: true,
			unflattenData: true,
		});

		/**
		 * The event bus is unable to correctly identify unfinished executions in workers,
		 * because execution lifecycle hooks cause worker event logs to be partitioned.
		 * Hence we need to filter out finished executions here.
		 * */
		if (
			!execution ||
			(['success', 'error', 'canceled'].includes(execution.status) && execution.data)
		) {
			return null;
		}

		const runExecutionData = execution.data ?? { resultData: { runData: {} } };

		let lastNodeRunTimestamp: DateTime | undefined;

		for (const node of execution.workflowData.nodes) {
			const nodeStartedMessage = nodeMessages.find(
				(m) => m.payload.nodeName === node.name && m.eventName === 'aura.node.started',
			);

			if (!nodeStartedMessage) continue;

			const nodeHasRunData = runExecutionData.resultData.runData[node.name] !== undefined;

			if (nodeHasRunData) continue; // when saving execution progress

			const nodeFinishedMessage = nodeMessages.find(
				(m) => m.payload.nodeName === node.name && m.eventName === 'aura.node.finished',
			);

			const taskData: ITaskData = {
				startTime: nodeStartedMessage.ts.toUnixInteger(),
				executionIndex: 0,
				executionTime: -1,
				source: [null],
			};

			if (nodeFinishedMessage) {
				taskData.executionStatus = 'success';
				taskData.data ??= ARTIFICIAL_TASK_DATA;
				taskData.executionTime = nodeFinishedMessage.ts.diff(nodeStartedMessage.ts).toMillis();
				lastNodeRunTimestamp = nodeFinishedMessage.ts;
			} else {
				taskData.executionStatus = 'crashed';
				taskData.error = new NodeCrashedError(node);
				taskData.executionTime = 0;
				runExecutionData.resultData.error = new WorkflowCrashedError();
				lastNodeRunTimestamp = nodeStartedMessage.ts;
			}

			runExecutionData.resultData.lastNodeExecuted = node.name;
			runExecutionData.resultData.runData[node.name] = [taskData];
		}

		return {
			...execution,
			status: execution.status === 'error' ? 'error' : 'crashed',
			stoppedAt: this.toStoppedAt(lastNodeRunTimestamp, workflowMessages),
			data: runExecutionData,
		} as IExecutionResponse;
	}

	private async amendWithoutLogs(executionId: string) {
		const exists = await this.executionRepository.exists({ where: { id: executionId } });

		if (!exists) return null;

		await this.executionRepository.markAsCrashed(executionId);

		const execution = await this.executionRepository.findSingleExecution(executionId, {
			includeData: true,
			unflattenData: true,
		});

		return execution ?? null;
	}

	private toRelevantMessages(messages: EventMessageTypes[]) {
		return messages.reduce<{
			nodeMessages: EventMessageTypes[];
			workflowMessages: EventMessageTypes[];
		}>(
			(acc, cur) => {
				if (cur.eventName.startsWith('aura.node.')) {
					acc.nodeMessages.push(cur);
				} else if (cur.eventName.startsWith('aura.workflow.')) {
					acc.workflowMessages.push(cur);
				}

				return acc;
			},
			{ nodeMessages: [], workflowMessages: [] },
		);
	}

	private toStoppedAt(timestamp: DateTime | undefined, messages: EventMessageTypes[]) {
		if (timestamp) return timestamp.toJSDate();

		const WORKFLOW_END_EVENTS = new Set([
			'aura.workflow.success',
			'aura.workflow.crashed',
			'aura.workflow.failed',
		]);

		return (
			messages.find((m) => WORKFLOW_END_EVENTS.has(m.eventName)) ??
			messages.find((m) => m.eventName === 'aura.workflow.started')
		)?.ts.toJSDate();
	}

	private async runHooks(execution: IExecutionResponse) {
		execution.data ??= { resultData: { runData: {} } };

		const lifecycleHooks = getLifecycleHooksForRegularMain(
			{
				userId: '',
				workflowData: execution.workflowData,
				executionMode: execution.mode,
				executionData: execution.data,
				runData: execution.data.resultData.runData,
				retryOf: execution.retryOf ?? undefined,
			},
			execution.id,
		);

		const run: IRun = {
			data: execution.data,
			finished: false,
			mode: execution.mode,
			waitTill: execution.waitTill ?? undefined,
			startedAt: execution.startedAt,
			stoppedAt: execution.stoppedAt,
			status: execution.status,
		};

		await lifecycleHooks.runHook('workflowExecuteAfter', [run]);
	}
}
