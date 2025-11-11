import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

// Example of using helper functions inside a test
test.describe('Debug mode', () => {
	// Constants to avoid magic strings
	const URLS = {
		FAILING: 'https://foo.bar',
		SUCCESS: 'https://postman-echo.com/get?foo1=bar1&foo2=bar2',
	};

	const NOTIFICATIONS = {
		WORKFLOW_CREATED: 'Workflow successfully created',
		EXECUTION_IMPORTED: 'Execution data imported',
		PROBLEM_IN_NODE: 'Problem in node',
		SUCCESSFUL: 'Successful',
		DATA_NOT_IMPORTED: "Some execution data wasn't imported",
	};

	test.beforeEach(async ({ aura }) => {
		await aura.api.enableFeature('debugInEditor');
		await aura.goHome();
	});

	// Helper function to create basic workflow
	async function createBasicWorkflow(aura: auraPage, url = URLS.FAILING) {
		await aura.workflows.addResource.workflow();
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('HTTP Request');
		await aura.ndv.fillParameterInput('URL', url);
		await aura.ndv.close();
		await aura.canvas.clickSaveWorkflowButton();
		await aura.notifications.waitForNotificationAndClose(NOTIFICATIONS.WORKFLOW_CREATED);
	}

	// Helper function to import execution for debugging
	async function importExecutionForDebugging(aura: auraPage) {
		await aura.canvas.clickExecutionsTab();
		await aura.executions.clickDebugInEditorButton();
		await aura.notifications.waitForNotificationAndClose(NOTIFICATIONS.EXECUTION_IMPORTED);
	}

	test('should enter debug mode for failed executions', async ({ aura }) => {
		await createBasicWorkflow(aura, URLS.FAILING);
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			NOTIFICATIONS.PROBLEM_IN_NODE,
		);
		await importExecutionForDebugging(aura);
		expect(aura.page.url()).toContain('/debug');
	});

	test('should exit debug mode after successful execution', async ({ aura }) => {
		await createBasicWorkflow(aura, URLS.FAILING);
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			NOTIFICATIONS.PROBLEM_IN_NODE,
		);
		await importExecutionForDebugging(aura);

		await aura.canvas.openNode('HTTP Request');
		await aura.ndv.fillParameterInput('URL', URLS.SUCCESS);
		await aura.ndv.close();
		await aura.canvas.clickSaveWorkflowButton();

		await aura.workflowComposer.executeWorkflowAndWaitForNotification(NOTIFICATIONS.SUCCESSFUL);
		expect(aura.page.url()).not.toContain('/debug');
	});

	test('should handle pinned data conflicts during execution import', async ({ aura }) => {
		await createBasicWorkflow(aura, URLS.SUCCESS);
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(NOTIFICATIONS.SUCCESSFUL);
		await aura.canvasComposer.pinNodeData('HTTP Request');

		await aura.workflowComposer.executeWorkflowAndWaitForNotification('Successful');

		// Go to executions and try to copy execution to editor
		await aura.canvas.clickExecutionsTab();
		await aura.executions.clickLastExecutionItem();
		await aura.executions.clickCopyToEditorButton();

		// Test CANCEL dialog
		await aura.executions.handlePinnedNodesConfirmation('Cancel');

		// Try again and CONFIRM
		await aura.executions.clickLastExecutionItem();
		await aura.executions.clickCopyToEditorButton();
		await aura.executions.handlePinnedNodesConfirmation('Unpin');

		expect(aura.page.url()).toContain('/debug');

		// Verify pinned status
		const pinnedNodeNames = await aura.canvas.getPinnedNodeNames();
		expect(pinnedNodeNames).not.toContain('HTTP Request');
		expect(pinnedNodeNames).toContain('When clicking ‘Execute workflow’');
	});

	test('should show error for pinned data mismatch', async ({ aura }) => {
		// Create workflow, execute, and pin data
		await createBasicWorkflow(aura, URLS.SUCCESS);
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(NOTIFICATIONS.SUCCESSFUL);

		await aura.canvasComposer.pinNodeData('HTTP Request');
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(NOTIFICATIONS.SUCCESSFUL);

		// Delete node to create mismatch
		await aura.canvas.deleteNodeByName('HTTP Request');

		// Try to copy execution and verify error
		await attemptCopyToEditor(aura);
		await aura.notifications.waitForNotificationAndClose(NOTIFICATIONS.DATA_NOT_IMPORTED);
		expect(aura.page.url()).toContain('/debug');
	});

	async function attemptCopyToEditor(aura: auraPage) {
		await aura.canvas.clickExecutionsTab();
		await aura.executions.clickLastExecutionItem();
		await aura.executions.clickCopyToEditorButton();
	}
});
