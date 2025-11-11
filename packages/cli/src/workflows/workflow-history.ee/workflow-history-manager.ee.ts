import { Time } from '@aura/constants';
import { WorkflowHistoryRepository } from '@aura/db';
import { Service } from '@aura/di';
import { DateTime } from 'luxon';

import {
	getWorkflowHistoryPruneTime,
	isWorkflowHistoryEnabled,
} from './workflow-history-helper.ee';

@Service()
export class WorkflowHistoryManager {
	pruneTimer?: NodeJS.Timeout;

	constructor(private workflowHistoryRepo: WorkflowHistoryRepository) {}

	init() {
		if (this.pruneTimer !== undefined) {
			clearInterval(this.pruneTimer);
		}

		this.pruneTimer = setInterval(async () => await this.prune(), 1 * Time.hours.toMilliseconds);
	}

	shutdown() {
		if (this.pruneTimer !== undefined) {
			clearInterval(this.pruneTimer);
			this.pruneTimer = undefined;
		}
	}

	async prune() {
		if (!isWorkflowHistoryEnabled()) {
			return;
		}

		const pruneHours = getWorkflowHistoryPruneTime();
		// No prune time set
		if (pruneHours === -1) {
			return;
		}
		const pruneDateTime = DateTime.now().minus({ hours: pruneHours }).toJSDate();

		await this.workflowHistoryRepo.deleteEarlierThan(pruneDateTime);
	}
}
