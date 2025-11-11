import { EDIT_FIELDS_SET_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';

const NOTIFICATIONS = {
	WORKFLOW_EXECUTED_SUCCESSFULLY: 'Workflow executed successfully',
};

test.describe('Inject previous execution', () => {
	test('can map keys from previous execution', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('NDV-debug-generate-data.json');

		await expect(aura.canvas.getExecuteWorkflowButton()).toBeVisible();

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.getExecuteWorkflowButtonSpinner()).toBeVisible();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionButton()).toBeVisible();
		await expect(aura.canvas.stopExecutionWaitingForWebhookButton()).toBeHidden();

		await aura.notifications.waitForNotificationAndClose(
			NOTIFICATIONS.WORKFLOW_EXECUTED_SUCCESSFULLY,
		);

		await aura.page.reload();

		await aura.canvas.clickNodePlusEndpoint('DebugHelper');
		await expect(aura.canvas.nodeCreatorSearchBar()).toBeVisible();
		await aura.canvas.fillNodeCreatorSearchBar(EDIT_FIELDS_SET_NODE_NAME);
		await aura.canvas.clickNodeCreatorItemName(EDIT_FIELDS_SET_NODE_NAME);
		await aura.page.keyboard.press('Escape');

		await aura.canvas.openNode('Edit Fields');

		expect(await aura.ndv.getInputPanel().innerText()).toContain(
			'The fields below come from the last successful execution.',
		);

		await expect(aura.ndv.inputPanel.getSchemaItemText('id')).toBeVisible();
		await expect(aura.ndv.inputPanel.getSchemaItemText('firstName')).toBeVisible();
	});

	test('can pin data from previous execution', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('NDV-debug-generate-data.json');

		await expect(aura.canvas.getExecuteWorkflowButton()).toBeVisible();

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.getExecuteWorkflowButtonSpinner()).toBeVisible();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionButton()).toBeVisible();
		await expect(aura.canvas.stopExecutionWaitingForWebhookButton()).toBeHidden();

		await aura.notifications.waitForNotificationAndClose(
			NOTIFICATIONS.WORKFLOW_EXECUTED_SUCCESSFULLY,
		);

		await aura.page.reload();
		await aura.canvas.openNode('DebugHelper');

		await aura.ndv.getEditPinnedDataButton().click();
		const editor = aura.ndv.outputPanel.get().locator('[contenteditable="true"]');
		await expect(editor).toContainText('"password":');
		await expect(editor).toContainText('"uid":');
	});
});
