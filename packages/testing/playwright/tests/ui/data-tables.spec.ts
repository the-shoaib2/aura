import { nanoid } from 'nanoid';

import { test, expect } from '../../fixtures/base';

test.describe('Data Table list view', () => {
	test.beforeEach(async ({ aura, api }) => {
		await api.enableFeature('sharing');
		await api.enableFeature('folders');
		await api.enableFeature('advancedPermissions');
		await api.enableFeature('projectRole:admin');
		await api.enableFeature('projectRole:editor');
		await api.setMaxTeamProjectsQuota(-1);
		await aura.goHome();
	});

	test('Should correctly render project data tables in project and everything in overview', async ({
		aura,
	}) => {
		const TEST_PROJECTS = [
			{
				name: `Project ${nanoid(8)}`,
				dataTable: `Data Table ${nanoid(8)}`,
			},
			{
				name: `Project ${nanoid(8)}`,
				dataTable: `Data Table ${nanoid(8)}`,
			},
		];

		// Create projects and check that they only render their own data tables
		for (const project of TEST_PROJECTS) {
			await aura.dataTableComposer.createDataTableInNewProject(
				project.name,
				project.dataTable,
				'empty-state',
			);

			await expect(aura.dataTable.getDataTableCardByName(project.dataTable)).toBeVisible();
			await expect(aura.dataTable.getDataTableCards()).toHaveCount(1);
		}

		// Go to overview, both data tables should be visible
		await aura.sideBar.clickHomeMenuItem();
		await aura.dataTable.clickDataTableOverviewTab();

		for (const project of TEST_PROJECTS) {
			await expect(aura.dataTable.getDataTableCardByName(project.dataTable)).toBeVisible();
		}
	});

	test('Should create data table in personal project when created from Overview', async ({
		aura,
	}) => {
		const TEST_DATA_TABLE_NAME = `Data Table ${nanoid(8)}`;

		await aura.page.goto('projects/home/datatables');

		await aura.dataTable.clickAddDataTableAction();

		const newDataTableModal = aura.dataTable.getNewDataTableModal();
		await expect(newDataTableModal).toBeVisible();

		await aura.dataTableComposer.createNewDataTable(TEST_DATA_TABLE_NAME);

		const dataTableDetailsContainer = aura.dataTableDetails.getPageWrapper();
		await expect(dataTableDetailsContainer).toBeVisible();

		const dataTableProjectBreadcrumb = aura.dataTableDetails.getDataTableProjectBreadcrumb();
		await expect(dataTableProjectBreadcrumb).toHaveText('Personal');

		const dataTableBreadcrumb = aura.dataTableDetails.getDataTableBreadcrumb();
		await expect(dataTableBreadcrumb).toContainText(TEST_DATA_TABLE_NAME);
	});

	test('Should create data table from project empty state', async ({ aura }) => {
		const TEST_PROJECT_NAME = `Project ${nanoid(8)}`;
		const TEST_DATA_TABLE_NAME = `Data Table ${nanoid(8)}`;

		await aura.dataTableComposer.createDataTableInNewProject(
			TEST_PROJECT_NAME,
			TEST_DATA_TABLE_NAME,
			'empty-state',
		);

		await expect(aura.dataTable.getDataTableCardByName(TEST_DATA_TABLE_NAME)).toBeVisible();
	});

	test('Should create project data table from header dropdown', async ({ aura }) => {
		const TEST_PROJECT_NAME = `Project ${nanoid(8)}`;
		const TEST_DATA_TABLE_NAME = `Data Table ${nanoid(8)}`;

		await aura.dataTableComposer.createDataTableInNewProject(
			TEST_PROJECT_NAME,
			TEST_DATA_TABLE_NAME,
			'header-dropdown',
		);

		await expect(aura.dataTable.getDataTableCardByName(TEST_DATA_TABLE_NAME)).toBeVisible();
	});

	test('Should create data table from workflows tab', async ({ aura }) => {
		const TEST_PROJECT_NAME = `Project ${nanoid(8)}`;
		const TEST_DATA_TABLE_NAME = `Data Table ${nanoid(8)}`;

		await aura.dataTableComposer.createDataTableInNewProject(
			TEST_PROJECT_NAME,
			TEST_DATA_TABLE_NAME,
			'header-dropdown',
			false,
		);

		await expect(aura.dataTable.getDataTableCardByName(TEST_DATA_TABLE_NAME)).toBeVisible();
	});

	test('Should delete data table from card actions', async ({ aura }) => {
		const TEST_PROJECT_NAME = `Project ${nanoid(8)}`;
		const TEST_DATA_TABLE_NAME = `Data Table ${nanoid(8)}`;

		await aura.dataTableComposer.createDataTableInNewProject(
			TEST_PROJECT_NAME,
			TEST_DATA_TABLE_NAME,
			'empty-state',
		);

		await aura.dataTable.clickDataTableCardActionsButton(TEST_DATA_TABLE_NAME);
		await aura.dataTable.getDataTableCardAction('delete').click();

		await expect(aura.dataTable.getDeleteDataTableModal()).toBeVisible();
		await aura.dataTable.clickDeleteDataTableConfirmButton();

		await expect(aura.dataTable.getDataTableCardByName(TEST_DATA_TABLE_NAME)).toBeHidden();
	});

	test('Should paginate data table list correctly', async ({ aura }) => {
		const TEST_PROJECT_NAME = `Project ${nanoid(8)}`;
		const TOTAL_DATA_TABLES = 11;
		const PAGE_SIZE = 10;

		const { projectId } = await aura.projectComposer.createProject(TEST_PROJECT_NAME);
		await aura.page.goto(`projects/${projectId}/datatables`);

		// Create just enough data tables to require pagination
		for (let i = 0; i < TOTAL_DATA_TABLES; i++) {
			await aura.dataTable.clickAddDataTableAction();
			await aura.dataTableComposer.createNewDataTable(`Data Table ${i + 1}`);
			await aura.sideBar.clickProjectMenuItem(TEST_PROJECT_NAME);
			await aura.dataTable.clickDataTableProjectTab();
		}
		// Change page size to PAGE_SIZE
		await aura.dataTable.selectDataTablePageSize(PAGE_SIZE.toString());
		// First page should only have PAGE_SIZE items
		await expect(aura.dataTable.getDataTableCards()).toHaveCount(PAGE_SIZE);

		// Forward to next page, should show the rest
		await aura.dataTable.getPaginationNextButton().click();
		await expect(aura.dataTable.getDataTableCards()).toHaveCount(TOTAL_DATA_TABLES - PAGE_SIZE);
	});
});
