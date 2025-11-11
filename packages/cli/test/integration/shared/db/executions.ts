import { mockInstance } from '@aura/backend-test-utils';
import type { ExecutionEntity, ExecutionData } from '@aura/db';
import {
	ExecutionDataRepository,
	ExecutionMetadataRepository,
	ExecutionRepository,
	AnnotationTagRepository,
} from '@aura/db';
import { Container } from '@aura/di';
import type { AnnotationVote, ExecutionStatus, IWorkflowBase } from 'workflow';

import { ExecutionService } from '@/executions/execution.service';
import { Telemetry } from '@/telemetry';

mockInstance(Telemetry);

export async function createManyExecutions(
	amount: number,
	workflow: IWorkflowBase,
	callback: (workflow: IWorkflowBase) => Promise<ExecutionEntity>,
) {
	const executionsRequests = [...Array(amount)].map(async (_) => await callback(workflow));
	return await Promise.all(executionsRequests);
}

/**
 * Store a execution in the DB and assign it to a workflow.
 */
export async function createExecution(
	attributes: Partial<
		Omit<ExecutionEntity, 'metadata'> &
			ExecutionData & { metadata: Array<{ key: string; value: string }> }
	>,
	workflow: IWorkflowBase,
) {
	const {
		data,
		finished,
		mode,
		startedAt,
		stoppedAt,
		waitTill,
		status,
		deletedAt,
		metadata,
		createdAt,
	} = attributes;

	const execution = await Container.get(ExecutionRepository).save({
		finished: finished ?? true,
		mode: mode ?? 'manual',
		createdAt: createdAt ?? new Date(),
		startedAt: startedAt === undefined ? new Date() : startedAt,
		...(workflow !== undefined && { workflowId: workflow.id }),
		stoppedAt: stoppedAt ?? new Date(),
		waitTill: waitTill ?? null,
		status: status ?? 'success',
		deletedAt,
	});

	if (metadata?.length) {
		const metadataToSave = metadata.map(({ key, value }) => ({
			key,
			value,
			execution: { id: execution.id },
		}));

		await Container.get(ExecutionMetadataRepository).save(metadataToSave);
	}

	await Container.get(ExecutionDataRepository).save({
		data: data ?? '[]',
		workflowData: workflow ?? {},
		executionId: execution.id,
	});

	return execution;
}

/**
 * Store a successful execution in the DB and assign it to a workflow.
 */
export async function createSuccessfulExecution(workflow: IWorkflowBase) {
	return await createExecution({ finished: true, status: 'success' }, workflow);
}

/**
 * Store an error execution in the DB and assign it to a workflow.
 */
export async function createErrorExecution(workflow: IWorkflowBase) {
	return await createExecution(
		{ finished: false, stoppedAt: new Date(), status: 'error' },
		workflow,
	);
}

/**
 * Store a waiting execution in the DB and assign it to a workflow.
 */
export async function createWaitingExecution(workflow: IWorkflowBase) {
	return await createExecution(
		{ finished: false, waitTill: new Date(), status: 'waiting' },
		workflow,
	);
}

/**
 * Store an execution with a given status in the DB and assign it to a workflow.
 */
export async function createdExecutionWithStatus(workflow: IWorkflowBase, status: ExecutionStatus) {
	const execution: Partial<ExecutionEntity> = {
		status,
		finished: status === 'success' ? true : false,
		stoppedAt: ['crashed', 'error'].includes(status) ? new Date() : undefined,
		waitTill: status === 'waiting' ? new Date() : undefined,
	};

	return await createExecution(execution, workflow);
}

export async function annotateExecution(
	executionId: string,
	annotation: { vote?: AnnotationVote | null; tags?: string[] },
	sharedWorkflowIds: string[],
) {
	await Container.get(ExecutionService).annotate(executionId, annotation, sharedWorkflowIds);
}

export async function getAllExecutions() {
	return await Container.get(ExecutionRepository).find();
}

export async function createAnnotationTags(annotationTags: string[]) {
	const tagRepository = Container.get(AnnotationTagRepository);
	return await tagRepository.save(annotationTags.map((name) => tagRepository.create({ name })));
}
