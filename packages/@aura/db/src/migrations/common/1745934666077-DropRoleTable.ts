import type { IrreversibleMigration, MigrationContext } from '../migration-types';

/**
 * Drop the `role` table introduced by `CreateUserManagement1646992772331` and later
 * abandoned with the move to `@aura/permissions` in https://github.com/aura/pull/7650
 *
 * Irreversible as there is no use case for restoring a long unused table.
 */
export class DropRoleTable1745934666077 implements IrreversibleMigration {
	async up({ schemaBuilder: { dropTable } }: MigrationContext) {
		await dropTable('role');
	}
}
