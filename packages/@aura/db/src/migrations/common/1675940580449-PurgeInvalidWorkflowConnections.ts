import { UserError } from 'workflow';

import { WorkflowEntity } from '../../entities';
import type { IrreversibleMigration, MigrationContext } from '../migration-types';

export class PurgeInvalidWorkflowConnections1675940580449 implements IrreversibleMigration {
	async up({ queryRunner }: MigrationContext) {
		const workflowCount = await queryRunner.manager.count(WorkflowEntity);

		if (workflowCount > 0) {
			throw new UserError(
				'Migration "PurgeInvalidWorkflowConnections1675940580449" is no longer supported. Please upgrade to aura@1.0.0 first.',
			);
		}
	}
}
