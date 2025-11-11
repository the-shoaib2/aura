import { MANUAL_TRIGGER_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';
import { auraPage } from '../../pages/auraPage';

const EXECUTE_WORKFLOW_NODE_NAME = 'Execute Sub-workflow';

test.describe('Workflow Selector Parameter @db:reset', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromNewProjectBlankCanvas();

		const subWorkflows = [
			{ file: 'Test_Subworkflow_Get_Weather.json', name: 'Get_Weather' },
			{ file: 'Test_Subworkflow_Search_DB.json', name: 'Search_DB' },
		];

		for (const { file } of subWorkflows) {
			await aura.api.workflows.importWorkflowFromFile(file);
		}

		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(EXECUTE_WORKFLOW_NODE_NAME, { action: 'Execute A Sub Workflow' });
	});

	test('should render sub-workflows list', async ({ aura }) => {
		await aura.ndv.openResourceLocator('workflowId');

		await expect(aura.ndv.getResourceLocatorItems()).toHaveCount(2);
		await expect(aura.ndv.getAddResourceItem()).toHaveCount(1);
	});

	test('should show required parameter warning', async ({ aura }) => {
		await aura.ndv.openResourceLocator('workflowId');
		await expect(aura.ndv.getParameterInputIssues()).toBeVisible();
	});

	test('should filter sub-workflows list', async ({ aura }) => {
		await aura.ndvComposer.filterWorkflowList('workflowId', 'Weather');
		await expect(aura.ndv.getResourceLocatorItems()).toHaveCount(1);

		await aura.ndvComposer.selectFirstFilteredWorkflow();
		const inputField = aura.ndv.getResourceLocatorInput('workflowId').locator('input');
		await expect(inputField).toHaveValue(/Get Weather.*Test/);
	});

	test('should render sub-workflow links correctly', async ({ aura }) => {
		await aura.ndvComposer.selectWorkflowFromList('workflowId', 'Search DB');
		const link = aura.ndv.getResourceLocatorInput('workflowId').locator('a');
		await expect(link).toBeVisible();

		await aura.ndv.getExpressionModeToggle().click();
		await expect(link).toBeHidden();
	});

	test('should switch to ID mode on expression', async ({ aura }) => {
		await aura.ndvComposer.selectWorkflowFromList('workflowId', 'Search DB');
		const modeSelector = aura.ndv.getResourceLocatorModeSelector('workflowId').locator('input');
		await expect(modeSelector).toHaveValue('From list');

		await aura.ndvComposer.switchToExpressionMode('workflowId');
		await expect(modeSelector).toHaveValue('By ID');
	});

	test('should render add resource option and redirect to the correct route when clicked', async ({
		aura,
	}) => {
		await aura.ndv.openResourceLocator('workflowId');

		const addResourceItem = aura.ndv.getAddResourceItem();
		await expect(addResourceItem).toHaveCount(1);
		await expect(addResourceItem.getByText(/Create a/)).toBeVisible();

		const { request, page } = await aura.ndvComposer.createNewSubworkflowWithRedirect('workflowId');
		const requestBody = request.postDataJSON();

		expect(requestBody).toHaveProperty('name');
		expect(requestBody.name).toContain('Sub-Workflow');
		expect(requestBody.nodes).toBeInstanceOf(Array);
		expect(requestBody.nodes).toHaveLength(2);
		expect(requestBody.nodes[0]).toHaveProperty('name', 'When Executed by Another Workflow');
		expect(requestBody.nodes[1]).toHaveProperty('name', 'Replace me with your logic');

		const newPage = new auraPage(page);
		expect(newPage.page.url()).toMatch(/\/workflow\/.+/);
		await newPage.page.close();
	});
});
