import { EDIT_FIELDS_SET_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';

test.describe('Routing @db:reset', () => {
	test('should ask to save unsaved changes before leaving route', async ({ aura }) => {
		await aura.goHome();
		await expect(aura.workflows.getNewWorkflowCard()).toBeVisible();
		await aura.workflows.clickNewWorkflowCard();

		await aura.canvas.importWorkflow('Test_workflow_1.json', 'Test Workflow');

		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });

		await aura.sideBar.clickHomeButton();

		await expect(aura.page).toHaveURL(/workflow/);

		await expect(aura.canvas.saveChangesModal.getModal()).toBeVisible();
		await aura.canvas.saveChangesModal.clickCancel();

		await expect(aura.page).toHaveURL(/home\/workflows/);
	});

	test('should correct route after cancelling saveChangesModal', async ({ aura }) => {
		await aura.start.fromBlankCanvas();

		await aura.canvas.importWorkflow('Test_workflow_1.json', 'Test Workflow');

		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: false });

		await aura.page.goBack();

		await expect(aura.page).toHaveURL(/home\/workflows/);

		await expect(aura.canvas.saveChangesModal.getModal()).toBeVisible();
		await aura.canvas.saveChangesModal.clickClose();

		await expect(aura.page).toHaveURL(/workflow/);
	});

	test('should correct route when opening and closing NDV', async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.clickSaveWorkflowButton();

		await aura.canvas.importWorkflow('Test_workflow_1.json', 'Test Workflow');

		const baselineUrl = aura.page.url();

		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: false });

		expect(aura.page.url()).not.toBe(baselineUrl);

		await aura.page.keyboard.press('Escape');

		expect(aura.page.url()).toBe(baselineUrl);
	});

	test('should open ndv via URL', async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.clickSaveWorkflowButton();

		await aura.canvas.importWorkflow('Test_workflow_1.json', 'Test Workflow');

		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: false });
		const ndvUrl = aura.page.url();

		await aura.page.keyboard.press('Escape');
		await aura.canvas.clickSaveWorkflowButton();

		await expect(aura.ndv.getContainer()).toBeHidden();

		await aura.page.goto(ndvUrl);

		await expect(aura.ndv.getContainer()).toBeVisible();
	});

	test('should open show warning and drop nodeId from URL if it contained an unknown nodeId', async ({
		aura,
	}) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.clickSaveWorkflowButton();

		await aura.canvas.importWorkflow('Test_workflow_1.json', 'Test Workflow');

		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: false });
		const ndvUrl = aura.page.url();

		await aura.page.keyboard.press('Escape');
		await aura.canvas.clickSaveWorkflowButton();

		await expect(aura.ndv.getContainer()).toBeHidden();

		await aura.page.goto(ndvUrl + 'thisMessesUpTheNodeId');

		await expect(aura.notifications.getWarningNotifications()).toBeVisible();

		const urlWithoutNodeId = ndvUrl.split('/').slice(0, -1).join('/');
		expect(aura.page.url()).toBe(urlWithoutNodeId);
	});
});
