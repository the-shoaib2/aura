import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

const NODE_NAMES = {
	PROCESS_THE_DATA: 'Process The Data',
	START_ON_SCHEDULE: 'Start on Schedule',
	EDIT_FIELDS: 'Edit Fields',
	IF: 'If',
	NO_OP_2: 'NoOp2',
	WEBHOOK: 'Webhook',
	TEST_EXPRESSION: 'Test Expression',
};

const NOTIFICATIONS = {
	WORKFLOW_EXECUTED_SUCCESSFULLY: 'Workflow executed successfully',
	EXECUTION_STOPPED: 'Execution stopped',
	EXECUTION_DELETED: 'Execution deleted',
};

const TIMEOUTS = {
	NODE_SUCCESS_WAIT: 5000,
};

/**
 * Helper function to assert node execution states (success/running indicators)
 */
async function assertNodeExecutionStates(
	aura: auraPage,
	checks: Array<{
		nodeName: string;
		success?: 'visible' | 'hidden';
		running?: 'visible' | 'hidden';
	}>,
) {
	for (const check of checks) {
		if (check.success !== undefined) {
			const assertion = check.success === 'visible' ? 'toBeVisible' : 'toBeHidden';
			await expect(aura.canvas.getNodeSuccessStatusIndicator(check.nodeName))[assertion]();
		}
		if (check.running !== undefined) {
			const assertion = check.running === 'visible' ? 'toBeVisible' : 'toBeHidden';
			await expect(aura.canvas.getNodeRunningStatusIndicator(check.nodeName))[assertion]();
		}
	}
}

test.describe('Execution', () => {
	test('should test manual workflow', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Manual_wait_set.json');

		await expect(aura.canvas.getExecuteWorkflowButton()).toBeVisible();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionWaitingForWebhookButton()).toBeHidden();

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.getExecuteWorkflowButtonSpinner()).toBeVisible();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionButton()).toBeVisible();
		await expect(aura.canvas.stopExecutionWaitingForWebhookButton()).toBeHidden();

		await assertNodeExecutionStates(aura, [
			{ nodeName: 'Manual', success: 'visible' },
			{ nodeName: 'Wait', success: 'hidden', running: 'visible' },
			{ nodeName: 'Set', success: 'hidden' },
		]);

		await assertNodeExecutionStates(aura, [
			{ nodeName: 'Manual', success: 'visible' },
			{ nodeName: 'Wait', success: 'visible' },
			{ nodeName: 'Set', success: 'visible' },
		]);

		await expect(aura.canvas.getNodeSuccessStatusIndicator('Wait')).toBeVisible({
			timeout: TIMEOUTS.NODE_SUCCESS_WAIT,
		});

		await aura.notifications.waitForNotificationAndClose(
			NOTIFICATIONS.WORKFLOW_EXECUTED_SUCCESSFULLY,
		);

		await expect(aura.canvas.clearExecutionDataButton()).toBeVisible();
		await aura.canvas.clearExecutionData();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
	});

	test('should test manual workflow stop', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Manual_wait_set.json');

		await expect(aura.canvas.getExecuteWorkflowButton()).toBeVisible();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionWaitingForWebhookButton()).toBeHidden();

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.getExecuteWorkflowButtonSpinner()).toBeVisible();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionButton()).toBeVisible();
		await expect(aura.canvas.stopExecutionWaitingForWebhookButton()).toBeHidden();

		await assertNodeExecutionStates(aura, [
			{ nodeName: 'Manual', success: 'visible' },
			{ nodeName: 'Wait', running: 'visible' },
		]);

		await aura.canvas.stopExecutionButton().click();

		await aura.notifications.waitForNotificationAndClose(NOTIFICATIONS.EXECUTION_STOPPED);

		await assertNodeExecutionStates(aura, [
			{ nodeName: 'Manual', success: 'visible' },
			{ nodeName: 'Wait', running: 'hidden' },
			{ nodeName: 'Set', success: 'hidden' },
		]);

		await expect(aura.canvas.clearExecutionDataButton()).toBeVisible();
		await aura.canvas.clearExecutionData();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
	});

	test('should test webhook workflow', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Webhook_wait_set.json');

		await expect(aura.canvas.getExecuteWorkflowButton()).toBeVisible();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionWaitingForWebhookButton()).toBeHidden();

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.getExecuteWorkflowButtonSpinner()).toBeVisible();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionButton()).toBeHidden();
		await expect(aura.canvas.stopExecutionWaitingForWebhookButton()).toBeVisible();

		await aura.canvas.openNode('Webhook');

		await aura.clipboard.grant();
		await aura.page.getByTestId('copy-input').click();
		await aura.ndv.clickBackToCanvasButton();

		const webhookUrl = await aura.clipboard.readText();
		const response = await aura.page.request.get(webhookUrl);
		expect(response.status()).toBe(200);

		await assertNodeExecutionStates(aura, [
			{ nodeName: 'Webhook', success: 'visible' },
			{ nodeName: 'Wait', success: 'hidden', running: 'visible' },
			{ nodeName: 'Set', success: 'hidden' },
		]);

		await expect(aura.canvas.getNodeSuccessStatusIndicator('Wait')).toBeVisible({
			timeout: TIMEOUTS.NODE_SUCCESS_WAIT,
		});
		await assertNodeExecutionStates(aura, [
			{ nodeName: 'Webhook', success: 'visible' },
			{ nodeName: 'Wait', success: 'visible' },
			{ nodeName: 'Set', success: 'visible' },
		]);

		await aura.notifications.waitForNotificationAndClose(
			NOTIFICATIONS.WORKFLOW_EXECUTED_SUCCESSFULLY,
		);

		await expect(aura.canvas.clearExecutionDataButton()).toBeVisible();
		await aura.canvas.clearExecutionData();
		await expect(aura.canvas.clearExecutionDataButton()).toBeHidden();
	});

	test('should execute workflow from specific trigger nodes independently', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Two_schedule_triggers.json');

		await aura.canvas.clickZoomToFitButton();
		await expect(aura.canvas.getExecuteWorkflowButton('Trigger A')).toHaveCSS('opacity', '0');
		await expect(aura.canvas.getExecuteWorkflowButton('Trigger B')).toHaveCSS('opacity', '0');

		await aura.canvas.nodeByName('Trigger A').hover();
		await expect(aura.canvas.getExecuteWorkflowButton('Trigger A')).toHaveCSS('opacity', '1');
		await expect(aura.canvas.getExecuteWorkflowButton('Trigger B')).toHaveCSS('opacity', '0');
		await aura.canvas.clickExecuteWorkflowButton('Trigger A');

		await aura.notifications.waitForNotificationAndClose(
			NOTIFICATIONS.WORKFLOW_EXECUTED_SUCCESSFULLY,
		);
		await aura.canvas.openNode('Edit Fields');
		await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toContainText('Trigger A');

		await aura.ndv.clickBackToCanvasButton();
		await expect(aura.ndv.getContainer()).toBeHidden();

		await aura.canvas.nodeByName('Trigger B').hover();
		await expect(aura.canvas.getExecuteWorkflowButton('Trigger A')).toHaveCSS('opacity', '0');
		await expect(aura.canvas.getExecuteWorkflowButton('Trigger B')).toHaveCSS('opacity', '1');
		await aura.canvas.clickExecuteWorkflowButton('Trigger B');

		await aura.notifications.waitForNotificationAndClose(
			NOTIFICATIONS.WORKFLOW_EXECUTED_SUCCESSFULLY,
		);
		await aura.canvas.openNode('Edit Fields');
		await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toContainText('Trigger B');
	});

	test.describe('execution preview', () => {
		test('when deleting the last execution, it should show empty state', async ({ aura }) => {
			await aura.start.fromBlankCanvas();
			await aura.canvas.addInitialNodeToCanvas('Manual Trigger');
			await aura.canvas.clickExecuteWorkflowButton();

			await aura.notifications.waitForNotification(NOTIFICATIONS.WORKFLOW_EXECUTED_SUCCESSFULLY);

			await aura.canvas.openExecutions();

			await aura.executions.deleteExecutionInPreview();

			await expect(aura.executions.getSuccessfulExecutionItems()).toHaveCount(0);
			await aura.notifications.waitForNotificationAndClose(NOTIFICATIONS.EXECUTION_DELETED);
		});
	});

	/**
	 * @TODO New Canvas: Different classes for pinned states on edges and nodes
	 */
	// eslint-disable-next-line aura-local-rules/no-skipped-tests
	test.describe.skip('connections should be colored differently for pinned data', () => {
		test('when executing the workflow', async () => {
			// Not yet migrated - waiting for New Canvas implementation
		});

		test('when executing a node', async () => {
			// Not yet migrated - waiting for New Canvas implementation
		});

		test('when connecting pinned node by output drag and drop', async () => {
			// Not yet migrated - waiting for New Canvas implementation
		});

		test('when connecting pinned node after adding an unconnected node', async () => {
			// Not yet migrated - waiting for New Canvas implementation
		});
	});

	test('should send proper payload for node rerun', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Multiple_trigger_node_rerun.json');
		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.clickExecuteWorkflowButton();
		await expect(aura.canvas.clearExecutionDataButton()).toBeVisible();

		const payload = await aura.executionsComposer.executeNodeAndCapturePayload(
			NODE_NAMES.PROCESS_THE_DATA,
		);

		expect(payload).toHaveProperty('runData');
		expect(payload.runData).toBeInstanceOf(Object);
		expect(payload.runData).toEqual({
			[NODE_NAMES.START_ON_SCHEDULE]: expect.any(Array),
			[NODE_NAMES.EDIT_FIELDS]: expect.any(Array),
			[NODE_NAMES.PROCESS_THE_DATA]: expect.any(Array),
		});
	});

	test('should send proper payload for manual node run', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Check_manual_node_run_for_pinned_and_rundata.json');
		await aura.canvas.clickZoomToFitButton();

		const firstPayload = await aura.executionsComposer.executeNodeAndCapturePayload(NODE_NAMES.IF);

		expect(firstPayload).not.toHaveProperty('runData');
		expect(firstPayload).toHaveProperty('workflowData');
		expect(firstPayload.workflowData).toBeInstanceOf(Object);
		expect(firstPayload.workflowData).toHaveProperty('pinData');
		expect(firstPayload.workflowData.pinData).toBeInstanceOf(Object);
		expect(firstPayload.workflowData.pinData).toEqual({
			[NODE_NAMES.WEBHOOK]: expect.anything(),
		});

		await expect(aura.canvas.clearExecutionDataButton()).toBeVisible();

		const secondPayload = await aura.executionsComposer.executeNodeAndCapturePayload(
			NODE_NAMES.NO_OP_2,
		);

		expect(secondPayload).toHaveProperty('runData');
		expect(secondPayload.runData).toBeInstanceOf(Object);
		expect(secondPayload).toHaveProperty('workflowData');
		expect(secondPayload.workflowData).toBeInstanceOf(Object);
		expect(secondPayload.workflowData).toHaveProperty('pinData');
		expect(secondPayload.workflowData.pinData).toBeInstanceOf(Object);

		expect(secondPayload.runData).toEqual({
			[NODE_NAMES.IF]: expect.any(Array),
			[NODE_NAMES.WEBHOOK]: expect.any(Array),
		});

		expect(secondPayload.workflowData.pinData).toEqual({
			[NODE_NAMES.WEBHOOK]: expect.anything(),
		});
	});

	test('should successfully execute partial executions with nodes attached to the second output', async ({
		aura,
	}) => {
		await aura.start.fromImportedWorkflow('Test_Workflow_pairedItem_incomplete_manual_bug.json');
		await aura.canvas.clickZoomToFitButton();

		const workflowRunPromise = aura.page.waitForRequest(
			(request) =>
				request.url().includes('/rest/workflows/') &&
				request.url().includes('/run') &&
				request.method() === 'POST',
		);

		await aura.canvas.clickExecuteWorkflowButton();
		await aura.canvas.executeNode(NODE_NAMES.TEST_EXPRESSION);
		await workflowRunPromise;

		await expect(aura.notifications.getErrorNotifications()).toHaveCount(0);
	});

	test('should execute workflow partially up to the node that has issues', async ({ aura }) => {
		await aura.start.fromImportedWorkflow(
			'Test_workflow_partial_execution_with_missing_credentials.json',
		);

		const workflowRunPromise = aura.page.waitForRequest(
			(request) =>
				request.url().includes('/rest/workflows/') &&
				request.url().includes('/run') &&
				request.method() === 'POST',
		);

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.clickExecuteWorkflowButton();

		await workflowRunPromise;

		await assertNodeExecutionStates(aura, [
			{ nodeName: 'DebugHelper', success: 'visible' },
			{ nodeName: 'Filter', success: 'visible' },
		]);

		await expect(aura.notifications.getErrorNotifications()).toContainText(
			/Problem in node.*Telegram/,
		);
	});

	test('Paired items should be correctly mapped after passed through the merge node with more than two inputs', async ({
		aura,
	}) => {
		await aura.start.fromImportedWorkflow('merge_node_inputs_paired_items.json');

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.clickExecuteWorkflowButton();

		await aura.notifications.waitForNotificationAndClose(
			NOTIFICATIONS.WORKFLOW_EXECUTED_SUCCESSFULLY,
		);

		await expect(aura.canvas.getNodeSuccessStatusIndicator('Edit Fields')).toBeVisible();

		await aura.canvas.openNode('Edit Fields');
		await aura.ndv.outputPanel.switchDisplayMode('json');
		await expect(aura.ndv.outputPanel.get()).toContainText('Branch 1 Value');
		await expect(aura.ndv.outputPanel.get()).toContainText('Branch 2 Value');
		await expect(aura.ndv.outputPanel.get()).toContainText('Branch 3 Value');
	});
});
