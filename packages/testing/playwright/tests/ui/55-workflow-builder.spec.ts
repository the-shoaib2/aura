import { workflowBuilderEnabledRequirements } from '../../config/ai-builder-fixtures';
import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

// Helper to open workflow builder and click a specific suggestion pill
async function openBuilderAndClickSuggestion(aura: auraPage, suggestionText: string) {
	await aura.aiBuilder.getCanvasBuildWithAIButton().click();
	await expect(aura.aiAssistant.getAskAssistantChat()).toBeVisible();
	await expect(aura.aiBuilder.getWorkflowSuggestions()).toBeVisible();

	// Wait for suggestions to load
	await aura.aiBuilder.getSuggestionPills().first().waitFor({ state: 'visible' });

	// Find and click the specific suggestion pill by text
	const targetPill = aura.aiBuilder.getSuggestionPills().filter({ hasText: suggestionText });
	await expect(targetPill).toBeVisible();
	await targetPill.click();

	// Suggestion pill already populated the input, just submit with Enter
	await aura.aiAssistant.sendMessage('', 'enter-key');
}

// Enable proxy server for recording/replaying Anthropic API calls
test.use({
	addContainerCapability: {
		proxyServerEnabled: true,
		env: {
			N8N_AI_ANTHROPIC_KEY: 'sk-ant-test-key-for-mocked-tests',
		},
	},
});

test.describe('Workflow Builder @auth:owner @ai @capability:proxy', () => {
	test.beforeEach(async ({ setupRequirements, proxyServer }) => {
		await setupRequirements(workflowBuilderEnabledRequirements);
		await proxyServer.clearAllExpectations();
		await proxyServer.loadExpectations('workflow-builder');
	});

	test('should show Build with AI button on empty canvas', async ({ aura }) => {
		await aura.page.goto('/workflow/new');

		await expect(aura.aiBuilder.getCanvasBuildWithAIButton()).toBeVisible();
	});

	test('should open workflow builder and show suggestions', async ({ aura }) => {
		await aura.page.goto('/workflow/new');

		await aura.aiBuilder.getCanvasBuildWithAIButton().click();

		await expect(aura.aiAssistant.getAskAssistantSidebar()).toBeVisible();
		await expect(aura.aiAssistant.getAskAssistantChat()).toBeVisible();
		await expect(aura.aiBuilder.getWorkflowSuggestions()).toBeVisible();

		await aura.aiBuilder.getSuggestionPills().first().waitFor({ state: 'visible' });
		const suggestions = aura.aiBuilder.getSuggestionPills();
		await expect(suggestions).toHaveCount(8);
	});

	test('should build workflow from suggested prompt', async ({ aura }) => {
		await aura.page.goto('/workflow/new');
		await openBuilderAndClickSuggestion(aura, 'YouTube video chapters');

		await expect(aura.aiAssistant.getChatMessagesUser().first()).toBeVisible();

		// Wait for workflow to be built
		await aura.aiBuilder.waitForWorkflowBuildComplete();

		await expect(aura.canvas.getCanvasNodes().first()).toBeVisible();

		const nodeCount = await aura.canvas.getCanvasNodes().count();
		expect(nodeCount).toBeGreaterThan(0);

		// Verify "Execute and refine" button appears after workflow is built
		await expect(aura.page.getByRole('button', { name: 'Execute and refine' })).toBeVisible();
	});

	test('should display assistant messages during workflow generation', async ({ aura }) => {
		await aura.page.goto('/workflow/new');
		await openBuilderAndClickSuggestion(aura, 'YouTube video chapters');

		await expect(aura.aiAssistant.getChatMessagesUser().first()).toBeVisible();
		await aura.aiAssistant.waitForStreamingComplete();

		const assistantMessages = aura.aiAssistant.getChatMessagesAssistant();
		await expect(assistantMessages.first()).toBeVisible();

		const messageCount = await assistantMessages.count();
		expect(messageCount).toBeGreaterThan(0);
	});

	test('should stop workflow generation and show task aborted message', async ({ aura }) => {
		await aura.page.goto('/workflow/new');
		await openBuilderAndClickSuggestion(aura, 'YouTube video chapters');

		await expect(aura.aiAssistant.getChatMessagesUser().first()).toBeVisible();

		// Wait for streaming to start (assistant begins responding)
		await expect(aura.aiAssistant.getChatMessagesAssistant().first()).toBeVisible({
			timeout: 30000,
		});

		// Click the stop button (send button becomes stop button during streaming)
		const stopButton = aura.aiAssistant.getSendMessageButton();
		await stopButton.click();

		// Verify "Task aborted" message appears (search by text, not test-id)
		await expect(aura.page.getByText('Task aborted')).toBeVisible();

		// Verify canvas returns to default state (no nodes added)
		const nodeCount = await aura.canvas.getCanvasNodes().count();
		expect(nodeCount).toBe(0);

		// Verify the Build with AI button is still visible (canvas is back to default)
		await expect(aura.aiBuilder.getCanvasBuildWithAIButton()).toBeVisible();
	});
});
