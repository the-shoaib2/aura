import { StatisticsNames, type WorkflowStatistics } from '@aura/db';
import { WorkflowStatisticsRepository } from '@aura/db';
import { Container } from '@aura/di';
import type { Workflow } from 'workflow';

export async function createWorkflowStatisticsItem(
	workflowId: Workflow['id'],
	data?: Partial<WorkflowStatistics>,
) {
	const entity = Container.get(WorkflowStatisticsRepository).create({
		count: 0,
		latestEvent: new Date().toISOString(),
		name: StatisticsNames.manualSuccess,
		...(data ?? {}),
		workflowId,
	});

	await Container.get(WorkflowStatisticsRepository).insert(entity);

	return entity;
}
