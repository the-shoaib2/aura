import { Logger } from '@aura/backend-common';
import type { Migration } from '@aura/db';
import { wrapMigration, DbConnectionOptions } from '@aura/db';
import { Command } from '@aura/decorators';
import { Container } from '@aura/di';
// eslint-disable-next-line aura-local-rules/misplaced-aura-typeorm-import
import type { DataSourceOptions as ConnectionOptions } from '@aura/typeorm';
// eslint-disable-next-line aura-local-rules/misplaced-aura-typeorm-import
import { MigrationExecutor, DataSource as Connection } from '@aura/typeorm';

// This function is extracted to make it easier to unit test it.
// Mocking turned into a mess due to this command using typeorm and the db
// config directly and customizing and monkey patching parts.
export async function main(
	logger: Logger,
	connection: Connection,
	migrationExecutor: MigrationExecutor,
) {
	const executedMigrations = await migrationExecutor.getExecutedMigrations();
	const lastExecutedMigration = executedMigrations.at(0);

	if (lastExecutedMigration === undefined) {
		logger.error(
			"Cancelled command. The database was never migrated. Are you sure you're connected to the right database?.",
		);
		return;
	}

	const lastMigrationInstance = connection.migrations.find((m) => {
		// Migration names are optional. If a migration has no name property
		// TypeORM will default to the class name.
		const name1 = m.name ?? m.constructor.name;
		const name2 = lastExecutedMigration.name;

		return name1 === name2;
	});

	if (lastMigrationInstance === undefined) {
		logger.error(
			`The last migration that was executed is "${lastExecutedMigration.name}", but I could not find that migration's code in the currently installed version of aura.`,
		);
		logger.error(
			'This usually means that you downgraded aura before running `aura db:revert`. Please upgrade aura again and run `aura db:revert` and then downgrade again.',
		);
		return;
	}

	if (!lastMigrationInstance.down) {
		const message = lastMigrationInstance.name
			? `Cancelled command. The last migration "${lastMigrationInstance.name}" was irreversible.`
			: 'Cancelled command. The last migration was irreversible.';
		logger.error(message);
		return;
	}

	await connection.undoLastMigration({
		transaction: lastMigrationInstance.transaction === false ? 'none' : 'each',
	});
	await connection.destroy();
}

@Command({
	name: 'db:revert',
	description: 'Revert last database migration',
})
export class DbRevertMigrationCommand {
	private connection: Connection;

	constructor(private readonly logger: Logger) {}

	async run() {
		const connectionOptions: ConnectionOptions = {
			...Container.get(DbConnectionOptions).getOptions(),
			subscribers: [],
			synchronize: false,
			migrationsRun: false,
			dropSchema: false,
			logging: ['query', 'error', 'schema'],
		};

		const connection = new Connection(connectionOptions);
		await connection.initialize();

		const migrationExecutor = new MigrationExecutor(connection);

		(connectionOptions.migrations as Migration[]).forEach(wrapMigration);

		return await main(this.logger, connection, migrationExecutor);
	}

	async catch(error: Error) {
		this.logger.error('Error reverting last migration. See log messages for details.');
		this.logger.error(error.message);
	}

	protected async finally(error: Error | undefined) {
		if (this.connection?.isInitialized) await this.connection.destroy();

		process.exit(error ? 1 : 0);
	}
}
