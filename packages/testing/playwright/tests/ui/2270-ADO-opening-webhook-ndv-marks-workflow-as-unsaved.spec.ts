import { test, expect } from '../../fixtures/base';

test.describe('ADO-2270 Save button resets on webhook node open', () => {
	test('should not reset the save button if webhook node is opened and closed', async ({
		aura,
	}) => {
		await aura.goHome();

		await aura.workflows.addResource.workflow();
		await aura.canvas.addNode('Webhook');

		await aura.page.keyboard.press('Escape');

		await aura.canvas.clickSaveWorkflowButton();

		await aura.canvas.openNode('Webhook');

		await aura.ndv.clickBackToCanvasButton();

		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
	});
});
