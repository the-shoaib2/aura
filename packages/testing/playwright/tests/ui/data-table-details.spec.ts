import { nanoid } from 'nanoid';

import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

test.describe('Data Table details view', () => {
	let testDataTableName: string;

	const COLUMN_NAMES = {
		name: 'name',
		age: 'age',
		active: 'active',
		birthday: 'birthday',
	} as const;

	const generateTestData = () => [
		{
			name: `User ${nanoid(8)}`,
			age: '30',
			active: 'true',
			birthday: '2024-01-15',
		},
		{
			name: `User ${nanoid(8)}`,
			age: '25',
			active: 'false',
			birthday: '2024-06-20',
		},
		{
			name: `User ${nanoid(8)}`,
			age: '45',
			active: 'true',
			birthday: '2024-12-10',
		},
	];

	const addColumnsAndGetIds = async (
		aura: auraPage,
		method: 'header' | 'table',
	): Promise<{
		nameColumn: string;
		ageColumn: string;
		activeColumn: string;
		birthdayColumn: string;
	}> => {
		const addColumnFn =
			method === 'header'
				? aura.dataTableDetails.addColumn.bind(aura.dataTableDetails)
				: aura.dataTableDetails.addColumn.bind(aura.dataTableDetails);

		await addColumnFn(COLUMN_NAMES.name, 'string', method);
		await addColumnFn(COLUMN_NAMES.age, 'number', method);
		await addColumnFn(COLUMN_NAMES.active, 'boolean', method);
		await addColumnFn(COLUMN_NAMES.birthday, 'date', method);

		const visibleColumns = aura.dataTableDetails.getVisibleColumns();
		await expect(visibleColumns).toHaveCount(7);

		await expect(aura.dataTableDetails.getColumnHeaderByName(COLUMN_NAMES.name)).toBeVisible();
		await expect(aura.dataTableDetails.getColumnHeaderByName(COLUMN_NAMES.age)).toBeVisible();
		await expect(aura.dataTableDetails.getColumnHeaderByName(COLUMN_NAMES.active)).toBeVisible();
		await expect(aura.dataTableDetails.getColumnHeaderByName(COLUMN_NAMES.birthday)).toBeVisible();

		return {
			nameColumn: await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.name),
			ageColumn: await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.age),
			activeColumn: await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.active),
			birthdayColumn: await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.birthday),
		};
	};

	const fillRowData = async (
		aura: auraPage,
		rowIndex: number,
		columnIds: {
			nameColumn: string;
			ageColumn: string;
			activeColumn: string;
			birthdayColumn: string;
		},
		data: { name: string; age: string; active: string; birthday: string },
		skipFirstDoubleClick: boolean = false,
	) => {
		await aura.dataTableDetails.setCellValue(rowIndex, columnIds.nameColumn, data.name, 'string', {
			skipDoubleClick: skipFirstDoubleClick,
		});
		await aura.dataTableDetails.setCellValue(rowIndex, columnIds.ageColumn, data.age, 'number');
		await aura.dataTableDetails.setCellValue(
			rowIndex,
			columnIds.activeColumn,
			data.active,
			'boolean',
		);
		await aura.dataTableDetails.setCellValue(
			rowIndex,
			columnIds.birthdayColumn,
			data.birthday,
			'date',
		);
	};

	const verifyCellValues = async (
		aura: auraPage,
		columnIds: {
			nameColumn: string;
			ageColumn: string;
			activeColumn: string;
			birthdayColumn: string;
		},
		testData: Array<{ name: string; age: string; active: string; birthday: string }>,
	) => {
		const firstRowNameValue = await aura.dataTableDetails.getCellValue(
			0,
			columnIds.nameColumn,
			'string',
		);
		expect(firstRowNameValue).toContain(testData[0].name);

		const secondRowAgeValue = await aura.dataTableDetails.getCellValue(
			1,
			columnIds.ageColumn,
			'number',
		);
		expect(secondRowAgeValue).toContain(testData[1].age);

		const thirdRowActiveValue = await aura.dataTableDetails.getCellValue(
			2,
			columnIds.activeColumn,
			'boolean',
		);
		expect(thirdRowActiveValue).toBe(testData[2].active);

		const firstRowBirthdayValue = await aura.dataTableDetails.getCellValue(
			0,
			columnIds.birthdayColumn,
			'date',
		);
		expect(firstRowBirthdayValue).toContain(testData[0].birthday);
	};

	test.beforeEach(async ({ aura, api }) => {
		await api.enableFeature('sharing');
		await api.enableFeature('folders');
		await api.enableFeature('advancedPermissions');
		await api.enableFeature('projectRole:admin');
		await api.enableFeature('projectRole:editor');
		await api.setMaxTeamProjectsQuota(-1);
		await aura.goHome();

		testDataTableName = `Data Table ${nanoid(8)}`;
		await aura.page.goto('projects/home/datatables');
		await aura.dataTable.clickAddDataTableAction();
		await aura.dataTableComposer.createNewDataTable(testDataTableName);
	});

	test('Should display empty state with default columns', async ({ aura }) => {
		const dataTableDetailsContainer = aura.dataTableDetails.getPageWrapper();
		await expect(dataTableDetailsContainer).toBeVisible();

		const emptyStateMessage = aura.dataTableDetails.getNoRowsMessage();
		await expect(emptyStateMessage).toBeVisible();

		const visibleColumns = aura.dataTableDetails.getVisibleColumns();
		await expect(visibleColumns).toHaveCount(3);

		await expect(aura.dataTableDetails.getColumnHeaderByName('id')).toBeVisible();
		await expect(aura.dataTableDetails.getColumnHeaderByName('createdAt')).toBeVisible();
		await expect(aura.dataTableDetails.getColumnHeaderByName('updatedAt')).toBeVisible();
	});

	test('Should add columns of different types and rows from the header buttons', async ({
		aura,
	}) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		const columnIds = await addColumnsAndGetIds(aura, 'header');
		const testData = generateTestData();

		await aura.dataTableDetails.addRow();
		await expect(aura.dataTableDetails.getNoRowsMessage()).toBeHidden();
		await fillRowData(aura, 0, columnIds, testData[0], true);

		await aura.dataTableDetails.addRow();
		await fillRowData(aura, 1, columnIds, testData[1], true);

		await aura.dataTableDetails.addRow();
		await fillRowData(aura, 2, columnIds, testData[2], true);

		await verifyCellValues(aura, columnIds, testData);
	});

	test('Should add columns of different types and rows from the table buttons', async ({
		aura,
	}) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		const columnIds = await addColumnsAndGetIds(aura, 'table');
		const testData = generateTestData();

		await aura.dataTableDetails.addRowFromTable();
		await expect(aura.dataTableDetails.getNoRowsMessage()).toBeHidden();
		await fillRowData(aura, 0, columnIds, testData[0], true);

		await aura.dataTableDetails.addRowFromTable();
		await fillRowData(aura, 1, columnIds, testData[1], true);

		await aura.dataTableDetails.addRowFromTable();
		await fillRowData(aura, 2, columnIds, testData[2], true);

		await verifyCellValues(aura, columnIds, testData);
	});

	test('Should automatically move to second page when adding 21st row', async ({ aura }) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		await aura.dataTableDetails.addColumn(COLUMN_NAMES.name, 'string', 'header');

		for (let i = 0; i < 20; i++) {
			await aura.dataTableDetails.addRow();
		}

		const rowsOnPage1 = aura.dataTableDetails.getDataRows();
		await expect(rowsOnPage1).toHaveCount(20);

		await aura.dataTableDetails.addRow();

		const rowsOnPage2 = aura.dataTableDetails.getDataRows();
		await expect(rowsOnPage2).toHaveCount(1);
	});

	test('Should select and delete rows', async ({ aura }) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		await aura.dataTableDetails.addColumn(COLUMN_NAMES.name, 'string', 'header');
		const nameColumn = await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.name);

		const rowData = ['Row 1', 'Row 2', 'Row 3', 'Row 4', 'Row 5'];
		for (let i = 0; i < rowData.length; i++) {
			await aura.dataTableDetails.addRow();
			await aura.dataTableDetails.setCellValue(i, nameColumn, rowData[i], 'string', {
				skipDoubleClick: true,
			});
		}

		const initialRows = aura.dataTableDetails.getDataRows();
		await expect(initialRows).toHaveCount(5);

		await aura.dataTableDetails.selectRow(1);
		await aura.dataTableDetails.selectRow(3);

		const selectedItemsInfo = aura.dataTableDetails.getSelectedItemsInfo();
		await expect(selectedItemsInfo).toBeVisible();
		await expect(selectedItemsInfo).toContainText('2');

		await aura.dataTableDetails.deleteSelectedRows();

		const remainingRows = aura.dataTableDetails.getDataRows();
		await expect(remainingRows).toHaveCount(3);

		await expect(selectedItemsInfo).toBeHidden();

		const row0Value = await aura.dataTableDetails.getCellValue(0, nameColumn, 'string');
		expect(row0Value).toContain('Row 1');

		const row1Value = await aura.dataTableDetails.getCellValue(1, nameColumn, 'string');
		expect(row1Value).toContain('Row 3');

		const row2Value = await aura.dataTableDetails.getCellValue(2, nameColumn, 'string');
		expect(row2Value).toContain('Row 5');
	});

	test('Should clear selection', async ({ aura }) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		await aura.dataTableDetails.addColumn(COLUMN_NAMES.name, 'string', 'header');
		const nameColumn = await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.name);

		for (let i = 0; i < 3; i++) {
			await aura.dataTableDetails.addRow();
			await aura.dataTableDetails.setCellValue(i, nameColumn, `Row ${i + 1}`, 'string', {
				skipDoubleClick: true,
			});
		}

		await aura.dataTableDetails.selectRow(0);
		await aura.dataTableDetails.selectRow(1);
		await aura.dataTableDetails.selectRow(2);

		const selectedItemsInfo = aura.dataTableDetails.getSelectedItemsInfo();
		await expect(selectedItemsInfo).toBeVisible();
		await expect(selectedItemsInfo).toContainText('3');

		await aura.dataTableDetails.clearSelection();

		await expect(selectedItemsInfo).toBeHidden();

		const rows = aura.dataTableDetails.getDataRows();
		await expect(rows).toHaveCount(3);
	});

	test('Should add columns of each type with rows and then delete all columns', async ({
		aura,
	}) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		const columnIds = await addColumnsAndGetIds(aura, 'header');
		const testData = generateTestData().slice(0, 2);

		await aura.dataTableDetails.addRow();
		await fillRowData(aura, 0, columnIds, testData[0], true);

		await aura.dataTableDetails.addRow();
		await fillRowData(aura, 1, columnIds, testData[1], true);

		const rows = aura.dataTableDetails.getDataRows();
		await expect(rows).toHaveCount(2);

		await aura.dataTableDetails.deleteColumn(COLUMN_NAMES.name);
		await expect(aura.dataTableDetails.getVisibleColumns()).toHaveCount(6);

		await aura.dataTableDetails.deleteColumn(COLUMN_NAMES.age);
		await expect(aura.dataTableDetails.getVisibleColumns()).toHaveCount(5);

		await aura.dataTableDetails.deleteColumn(COLUMN_NAMES.active);
		await expect(aura.dataTableDetails.getVisibleColumns()).toHaveCount(4);

		await aura.dataTableDetails.deleteColumn(COLUMN_NAMES.birthday);

		await expect(aura.dataTableDetails.getVisibleColumns()).toHaveCount(3);

		await expect(aura.dataTableDetails.getColumnHeaderByName('id')).toBeVisible();
		await expect(aura.dataTableDetails.getColumnHeaderByName('createdAt')).toBeVisible();
		await expect(aura.dataTableDetails.getColumnHeaderByName('updatedAt')).toBeVisible();

		await expect(rows).toHaveCount(2);
	});

	test('Should rename data table from breadcrumbs', async ({ aura }) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		const nameBreadcrumb = aura.dataTableDetails.getDataTableBreadcrumb();
		const initialName = (await nameBreadcrumb.textContent())?.toString();

		const newName = `Renamed Table ${nanoid(8)}`;

		await aura.dataTableDetails.renameDataTable(newName);

		await expect(nameBreadcrumb).toContainText(newName);

		expect(initialName).not.toEqual(newName);
	});

	// eslint-disable-next-line playwright/no-skipped-test
	test.skip('Should filter correctly using column filters', async ({ aura }) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		await aura.dataTableDetails.setPageSize('10');

		await aura.dataTableDetails.addColumn(COLUMN_NAMES.name, 'string', 'header');
		await aura.dataTableDetails.addColumn(COLUMN_NAMES.age, 'number', 'header');
		await aura.dataTableDetails.addColumn(COLUMN_NAMES.active, 'boolean', 'header');
		await aura.dataTableDetails.addColumn(COLUMN_NAMES.birthday, 'date', 'header');

		const nameColumn = await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.name);
		const ageColumn = await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.age);
		const activeColumn = await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.active);
		const birthdayColumn = await aura.dataTableDetails.getColumnIdByName(COLUMN_NAMES.birthday);

		const rowsData = [
			{ name: 'User 1', age: '20', active: 'true', birthday: '2024-01-01' },
			{ name: 'User 2', age: '21', active: 'true', birthday: '2024-01-02' },
			{ name: 'User 3', age: '22', active: 'true', birthday: '2024-01-03' },
			{ name: 'User 4', age: '23', active: 'true', birthday: '2024-01-04' },
			{ name: 'User 5', age: '24', active: 'true', birthday: '2024-01-05' },
			{ name: 'User 6', age: '25', active: 'false', birthday: '2024-01-06' },
			{ name: 'User 7', age: '20', active: 'false', birthday: '2024-01-07' },
			{ name: 'User 8', age: '21', active: 'false', birthday: '2024-01-08' },
			{ name: 'User 9', age: '22', active: 'false', birthday: '2024-01-09' },
			{ name: 'User 10', age: '23', active: 'false', birthday: '2024-01-10' },
			{ name: 'User 11', age: '24', active: 'true', birthday: '2024-01-11' },
			{ name: 'User 12', age: '25', active: 'true', birthday: '2024-01-12' },
			{ name: 'User 13', age: '20', active: 'true', birthday: '2024-01-13' },
			{ name: 'User 14', age: '21', active: 'false', birthday: '2024-01-14' },
			{ name: 'User 15', age: '22', active: 'false', birthday: '2024-01-15' },
		] as const;

		for (let i = 0; i < 15; i++) {
			await aura.dataTableDetails.addRow();
			const rowIndexOnPage = i % 10;
			await aura.dataTableDetails.setCellValue(
				rowIndexOnPage,
				nameColumn,
				rowsData[i].name,
				'string',
				{
					skipDoubleClick: true,
				},
			);
			await aura.dataTableDetails.setCellValue(
				rowIndexOnPage,
				ageColumn,
				rowsData[i].age,
				'number',
			);
			await aura.dataTableDetails.setCellValue(
				rowIndexOnPage,
				activeColumn,
				rowsData[i].active,
				'boolean',
			);
			await aura.dataTableDetails.setCellValue(
				rowIndexOnPage,
				birthdayColumn,
				rowsData[i].birthday,
				'date',
			);
		}

		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(5);

		await aura.dataTableDetails.setTextFilter(COLUMN_NAMES.name, 'User 1');
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(7);
		await aura.dataTableDetails.clearColumnFilter(COLUMN_NAMES.name);
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(10);

		await aura.dataTableDetails.setNumberFilter(COLUMN_NAMES.age, '22', 'greaterThan');
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(6);
		await aura.dataTableDetails.clearColumnFilter(COLUMN_NAMES.age);
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(10);

		await aura.dataTableDetails.setBooleanFilter(COLUMN_NAMES.active, true);
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(8);
		await aura.dataTableDetails.clearColumnFilter(COLUMN_NAMES.active);
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(10);

		await aura.dataTableDetails.setDateFilter(COLUMN_NAMES.birthday, '2024-01-10', 'greaterThan');
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(5);
		await aura.dataTableDetails.clearColumnFilter(COLUMN_NAMES.birthday);
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(10);

		await aura.dataTableDetails.setBooleanFilter(COLUMN_NAMES.active, true);
		await aura.dataTableDetails.setNumberFilter(COLUMN_NAMES.age, '22', 'greaterThan');
		await expect(aura.dataTableDetails.getDataRows()).toHaveCount(4);
	});

	test('Should reorder columns using drag and drop', async ({ aura }) => {
		await expect(aura.dataTableDetails.getPageWrapper()).toBeVisible();

		await aura.dataTableDetails.addColumn(COLUMN_NAMES.name, 'string', 'header');
		await aura.dataTableDetails.addColumn(COLUMN_NAMES.age, 'number', 'header');
		await aura.dataTableDetails.addColumn(COLUMN_NAMES.active, 'boolean', 'header');
		await aura.dataTableDetails.addColumn(COLUMN_NAMES.birthday, 'date', 'header');
		await aura.dataTableDetails.addColumn('email', 'string', 'header');

		const initialOrder = await aura.dataTableDetails.getColumnOrder();
		expect(initialOrder).toContain(COLUMN_NAMES.name);
		expect(initialOrder).toContain(COLUMN_NAMES.age);
		expect(initialOrder).toContain(COLUMN_NAMES.active);
		expect(initialOrder).toContain(COLUMN_NAMES.birthday);
		expect(initialOrder).toContain('email');

		const nameIndex = initialOrder.indexOf(COLUMN_NAMES.name);
		const activeIndex = initialOrder.indexOf(COLUMN_NAMES.active);
		const emailIndex = initialOrder.indexOf('email');

		await aura.dataTableDetails.dragColumnToPosition(COLUMN_NAMES.active, COLUMN_NAMES.name);

		const orderAfterFirstDrag = await aura.dataTableDetails.getColumnOrder();
		const newActiveIndex = orderAfterFirstDrag.indexOf(COLUMN_NAMES.active);
		const newNameIndex = orderAfterFirstDrag.indexOf(COLUMN_NAMES.name);

		expect(newActiveIndex).toBeLessThan(newNameIndex);
		expect(activeIndex).toBeGreaterThan(nameIndex);

		await aura.dataTableDetails.dragColumnToPosition('email', COLUMN_NAMES.age);

		const orderAfterSecondDrag = await aura.dataTableDetails.getColumnOrder();
		const emailIndexAfter = orderAfterSecondDrag.indexOf('email');
		const ageIndexAfter = orderAfterSecondDrag.indexOf(COLUMN_NAMES.age);

		expect(emailIndexAfter).toBeLessThan(ageIndexAfter);
		expect(emailIndex).toBeGreaterThan(initialOrder.indexOf(COLUMN_NAMES.age));

		await aura.dataTableDetails.dragColumnToPosition(COLUMN_NAMES.birthday, COLUMN_NAMES.name);

		const finalOrder = await aura.dataTableDetails.getColumnOrder();
		const birthdayFinalIndex = finalOrder.indexOf(COLUMN_NAMES.birthday);
		const nameFinalIndex = finalOrder.indexOf(COLUMN_NAMES.name);

		expect(birthdayFinalIndex).toBeLessThan(nameFinalIndex);
	});
});
