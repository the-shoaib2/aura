import { initDbUpToMigration, runSingleMigration } from '@aura/backend-test-utils';
import { DbConnection } from '@aura/db';
import { Container } from '@aura/di';
import { DataSource } from '@aura/typeorm';
import { UnexpectedError } from 'workflow';

describe('Migration Test Helpers', () => {
	let dataSource: DataSource;

	beforeEach(async () => {
		// Initialize connection without running migrations
		const dbConnection = Container.get(DbConnection);
		await dbConnection.init();
		dataSource = Container.get(DataSource);
	});

	afterEach(async () => {
		const dbConnection = Container.get(DbConnection);
		await dbConnection.close();
	});

	describe('initDbUpToMigration', () => {
		it('should throw error if migration not found', async () => {
			await expect(initDbUpToMigration('NonExistentMigration')).rejects.toThrow(
				new UnexpectedError('Migration "NonExistentMigration" not found'),
			);
		});

		it('should stop before specified migration', async () => {
			const migrations = dataSource.options.migrations as Array<{ name: string }>;
			expect(migrations.length).toBeGreaterThan(1);

			const secondMigrationName = migrations[1].name;
			console.log('Running migrations up to ' + secondMigrationName);
			await initDbUpToMigration(secondMigrationName);
			console.log('Migrations executed up to ' + secondMigrationName);

			// Verify only first migration was executed
			const executed = await dataSource.query('SELECT * FROM migrations ORDER BY timestamp');
			expect(executed).toHaveLength(1);
			expect(executed[0].name).toBe(migrations[0].name);
		});
	});

	describe('runSingleMigration', () => {
		it('should throw error if migration not found', async () => {
			await expect(runSingleMigration('NonExistentMigration')).rejects.toThrow(
				new UnexpectedError('Migration "NonExistentMigration" not found'),
			);
		});

		it('should run specific migration', async () => {
			const migrations = dataSource.options.migrations as Array<{ name: string }>;
			expect(migrations.length).toBeGreaterThan(1);

			const secondMigrationName = migrations[1].name;
			console.log('Running migrations up to ' + secondMigrationName);
			await initDbUpToMigration(secondMigrationName);
			console.log('Migrations executed up to ' + secondMigrationName);

			await runSingleMigration(secondMigrationName);

			const executed = await dataSource.query('SELECT * FROM migrations ORDER BY timestamp');
			expect(executed).toHaveLength(2);
			expect(executed[0].name).toBe(migrations[0].name);
			expect(executed[1].name).toBe(secondMigrationName);
		});
	});
});
