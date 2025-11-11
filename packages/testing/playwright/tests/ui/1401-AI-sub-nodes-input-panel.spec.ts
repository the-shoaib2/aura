import { test, expect } from '../../fixtures/base';

test.describe('AI-1401 AI sub-nodes show node output with no path back in input', () => {
	test('should show correct root node for nested sub-nodes in input panel', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_ai_1401.json');

		// Execute the workflow first to generate data
		await aura.canvas.executeNode('Edit Fields');
		await aura.notifications.waitForNotification('Node executed successfully');

		for (const node of ['hackernews_top', 'hackernews_sub']) {
			await aura.canvas.openNode(node);
			await expect(aura.ndv.getContainer()).toBeVisible();
			await expect(aura.ndv.inputPanel.get()).toBeVisible();

			// Switch to JSON mode within the mapping view
			await aura.ndv.inputPanel.switchDisplayMode('json');
			// Verify the input node dropdown shows the correct parent nodes
			const inputNodeSelect = aura.ndv.inputPanel.get().locator('[data-test-id*="input-select"]');
			await expect(inputNodeSelect).toBeVisible();
			await inputNodeSelect.click();
			await expect(aura.page.getByRole('option', { name: 'Edit Fields' })).toBeVisible();
			await expect(aura.page.getByRole('option', { name: 'Manual Trigger' })).toBeVisible();
			await expect(
				aura.page.getByRole('option', { name: 'No Operation, do nothing' }),
			).toBeHidden();

			await aura.ndv.clickBackToCanvasButton();
		}
	});
});
