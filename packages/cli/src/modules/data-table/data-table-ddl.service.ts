import { CreateTable, DslColumn, withTransaction } from '@aura/db';
import { Service } from '@aura/di';
import { DataSource, DataSourceOptions, EntityManager } from '@aura/typeorm';
import { UnexpectedError } from 'workflow';

import { DataTableColumn } from './data-table-column.entity';
import { addColumnQuery, deleteColumnQuery, toDslColumns, toTableName } from './utils/sql-utils';

/**
 * Manages database schema operations for data tables (DDL).
 * Handles table creation, deletion, and structural modifications (columns).
 */
@Service()
export class DataTableDDLService {
	constructor(private dataSource: DataSource) {}

	async createTableWithColumns(
		dataTableId: string,
		columns: DataTableColumn[],
		trx?: EntityManager,
	) {
		await withTransaction(this.dataSource.manager, trx, async (em) => {
			if (!em.queryRunner) {
				throw new UnexpectedError('QueryRunner is not available');
			}

			const dslColumns = [new DslColumn('id').int.autoGenerate2.primary, ...toDslColumns(columns)];
			const createTable = new CreateTable(toTableName(dataTableId), '', em.queryRunner).withColumns(
				...dslColumns,
			).withTimestamps;

			await createTable.execute(em.queryRunner);
		});
	}

	async dropTable(dataTableId: string, trx?: EntityManager) {
		await withTransaction(this.dataSource.manager, trx, async (em) => {
			if (!em.queryRunner) {
				throw new UnexpectedError('QueryRunner is not available');
			}
			await em.queryRunner.dropTable(toTableName(dataTableId), true);
		});
	}

	async addColumn(
		dataTableId: string,
		column: DataTableColumn,
		dbType: DataSourceOptions['type'],
		trx?: EntityManager,
	) {
		await withTransaction(this.dataSource.manager, trx, async (em) => {
			await em.query(addColumnQuery(toTableName(dataTableId), column, dbType));
		});
	}

	async dropColumnFromTable(
		dataTableId: string,
		columnName: string,
		dbType: DataSourceOptions['type'],
		trx?: EntityManager,
	) {
		await withTransaction(this.dataSource.manager, trx, async (em) => {
			await em.query(deleteColumnQuery(toTableName(dataTableId), columnName, dbType));
		});
	}
}
