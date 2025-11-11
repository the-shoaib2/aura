import { Service } from '@aura/di';
import { DataSource, In, Repository } from '@aura/typeorm';
import type { EntityManager } from '@aura/typeorm';
import type { QueryDeepPartialEntity } from '@aura/typeorm/query-builder/QueryPartialEntity';

import { ExecutionData } from '../entities';

@Service()
export class ExecutionDataRepository extends Repository<ExecutionData> {
	constructor(dataSource: DataSource) {
		super(ExecutionData, dataSource.manager);
	}

	async createExecutionDataForExecution(
		data: QueryDeepPartialEntity<ExecutionData>,
		transactionManager: EntityManager,
	) {
		return await transactionManager.insert(ExecutionData, data);
	}

	async findByExecutionIds(executionIds: string[]) {
		return await this.find({
			select: ['workflowData'],
			where: {
				executionId: In(executionIds),
			},
		}).then((executionData) => executionData.map(({ workflowData }) => workflowData));
	}
}
