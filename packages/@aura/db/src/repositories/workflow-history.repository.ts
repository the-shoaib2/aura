import { Service } from '@aura/di';
import { DataSource, LessThan, Repository } from '@aura/typeorm';

import { WorkflowHistory } from '../entities';

@Service()
export class WorkflowHistoryRepository extends Repository<WorkflowHistory> {
	constructor(dataSource: DataSource) {
		super(WorkflowHistory, dataSource.manager);
	}

	async deleteEarlierThan(date: Date) {
		return await this.delete({ createdAt: LessThan(date) });
	}
}
