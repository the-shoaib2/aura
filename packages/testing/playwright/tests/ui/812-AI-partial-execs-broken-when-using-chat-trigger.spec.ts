import { test, expect } from '../../fixtures/base';

test.describe('AI-812-partial-execs-broken-when-using-chat-trigger', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_chat_partial_execution.json');
		await aura.notifications.quickCloseAll();
		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.deselectAll();
	});

	test.afterEach(async ({ aura }) => {
		await aura.notifications.quickCloseAll();
		await aura.canvas.logsPanel.clearExecutionData();
		await aura.canvas.logsPanel.sendManualChatMessage('Test Full Execution');

		await expect(aura.canvas.logsPanel.getManualChatMessages()).toHaveCount(4);

		await expect(aura.canvas.logsPanel.getManualChatMessages().last()).toContainText(
			'Set 3 with chatInput: Test Full Execution',
		);
	});

	test('should do partial execution when using chat trigger and clicking NDV execute node', async ({
		aura,
	}) => {
		await aura.canvas.openNode('Edit Fields1');
		await aura.ndv.execute();

		await expect(aura.canvas.logsPanel.getManualChatModal()).toBeVisible();
		await aura.canvas.logsPanel.sendManualChatMessage('Test Partial Execution');

		await expect(aura.canvas.logsPanel.getManualChatMessages()).toHaveCount(2);
		await expect(aura.canvas.logsPanel.getManualChatMessages().first()).toContainText(
			'Test Partial Execution',
		);
		await expect(aura.canvas.logsPanel.getManualChatMessages().last()).toContainText(
			'Set 2 with chatInput: Test Partial Execution',
		);
	});

	test('should do partial execution when using chat trigger and context-menu execute node', async ({
		aura,
	}) => {
		await aura.canvas.executeNodeFromContextMenu('Edit Fields');

		await expect(aura.canvas.logsPanel.getManualChatModal()).toBeVisible();
		await aura.canvas.logsPanel.sendManualChatMessage('Test Partial Execution');

		await expect(aura.canvas.logsPanel.getManualChatMessages()).toHaveCount(2);
		await expect(aura.canvas.logsPanel.getManualChatMessages().first()).toContainText(
			'Test Partial Execution',
		);
		await expect(aura.canvas.logsPanel.getManualChatMessages().last()).toContainText(
			'Set 1 with chatInput: Test Partial Execution',
		);
	});
});
