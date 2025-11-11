import { test, expect } from '../../fixtures/base';

// Node name constants
const NODES = {
	MANUAL_TRIGGER: 'When clicking ‘Execute workflow’',
	CODE: 'Code',
	LOOP_OVER_ITEMS: 'Loop Over Items',
	WAIT: 'Wait',
	CODE1: 'Code1',
	SCHEDULE_TRIGGER: 'Schedule Trigger',
	EDIT_FIELDS: 'Edit Fields',
	IF: 'If',
	WAIT_NODE: 'Wait node',
};

test.describe('Logs', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
	});

	test('should populate logs as manual execution progresses', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements({ workflow: 'Workflow_loop.json' });

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.logsPanel.open();
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(0);

		await aura.canvas.clickExecuteWorkflowButton();

		await expect(
			aura.canvas.logsPanel.getOverviewStatus().filter({ hasText: 'Running' }),
		).toBeVisible();

		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(4);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(0)).toContainText(NODES.MANUAL_TRIGGER);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(1)).toContainText(NODES.CODE);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(2)).toContainText(NODES.LOOP_OVER_ITEMS);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(3)).toContainText(NODES.WAIT);

		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(6);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(4)).toContainText(NODES.LOOP_OVER_ITEMS);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(5)).toContainText(NODES.WAIT);

		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(8);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(6)).toContainText(NODES.LOOP_OVER_ITEMS);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(7)).toContainText(NODES.WAIT);

		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(10);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(8)).toContainText(NODES.LOOP_OVER_ITEMS);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(9)).toContainText(NODES.CODE1);
		await expect(
			aura.canvas.logsPanel.getOverviewStatus().filter({ hasText: /Error in [\d.]+s/ }),
		).toBeVisible();
		await expect(aura.canvas.logsPanel.getSelectedLogEntry()).toContainText(NODES.CODE1); // Errored node is automatically selected
		await expect(aura.canvas.logsPanel.outputPanel.getNodeErrorMessageHeader()).toContainText(
			'test!!! [line 1]',
		);
		await expect(aura.canvas.getNodeIssuesByName(NODES.CODE1)).toBeVisible();

		await aura.canvas.logsPanel.getClearExecutionButton().click();
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(0);
		await expect(aura.canvas.getNodeIssuesByName(NODES.CODE1)).not.toBeVisible();
	});

	test('should allow to trigger partial execution', async ({ aura, setupRequirements }) => {
		await setupRequirements({ workflow: 'Workflow_if.json' });

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.logsPanel.open();

		await aura.workflowComposer.executeWorkflowAndWaitForNotification('Successful');
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(6);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(0)).toContainText(
			NODES.SCHEDULE_TRIGGER,
		);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(1)).toContainText(NODES.CODE);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(2)).toContainText(NODES.EDIT_FIELDS);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(3)).toContainText(NODES.IF);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(4)).toContainText(NODES.EDIT_FIELDS);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(5)).toContainText(NODES.EDIT_FIELDS);

		await aura.canvas.logsPanel.clickTriggerPartialExecutionAtRow(3);
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(3);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(0)).toContainText(
			NODES.SCHEDULE_TRIGGER,
		);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(1)).toContainText(NODES.CODE);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(2)).toContainText(NODES.IF);
	});

	// TODO: make it possible to test workflows with AI model end-to-end
	test.skip('should show input and output data in the selected display mode', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements({ workflow: 'Workflow_ai_agent.json' });

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.logsPanel.open();
		await aura.canvas.logsPanel.sendManualChatMessage('Hi!');
		await aura.workflowComposer.executeWorkflowAndWaitForNotification('Successful');
		await expect(aura.canvas.logsPanel.getManualChatMessages().nth(0)).toContainText('Hi!');
		await expect(aura.canvas.logsPanel.getManualChatMessages().nth(1)).toContainText(
			'Hello from e2e model!!!',
		);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(2)).toHaveText('E2E Chat Model');
		await aura.canvas.logsPanel.getLogEntries().nth(2).click();

		await expect(aura.canvas.logsPanel.outputPanel.get()).toContainText('Hello from e2e model!!!');
		await aura.canvas.logsPanel.outputPanel.switchDisplayMode('table');
		await expect(aura.canvas.logsPanel.outputPanel.getTbodyCell(0, 0)).toContainText(
			'text:Hello from **e2e** model!!!',
		);
		await expect(aura.canvas.logsPanel.outputPanel.getTbodyCell(0, 1)).toContainText(
			'completionTokens:20',
		);
		await aura.canvas.logsPanel.outputPanel.switchDisplayMode('schema');
		await expect(aura.canvas.logsPanel.outputPanel.get()).toContainText('generations[0]');
		await expect(aura.canvas.logsPanel.outputPanel.get()).toContainText(
			'Hello from **e2e** model!!!',
		);
		await aura.canvas.logsPanel.outputPanel.switchDisplayMode('json');
		await expect(aura.canvas.logsPanel.outputPanel.get()).toContainText(
			'[{"response": {"generations": [',
		);

		await aura.canvas.logsPanel.toggleInputPanel();
		await expect(aura.canvas.logsPanel.inputPanel.get()).toContainText('Human: Hi!');
		await aura.canvas.logsPanel.inputPanel.switchDisplayMode('table');
		await expect(aura.canvas.logsPanel.inputPanel.getTbodyCell(0, 0)).toContainText('0:Human: Hi!');
		await aura.canvas.logsPanel.inputPanel.switchDisplayMode('schema');
		await expect(aura.canvas.logsPanel.inputPanel.get()).toContainText('messages[0]');
		await expect(aura.canvas.logsPanel.inputPanel.get()).toContainText('Human: Hi!');
		await aura.canvas.logsPanel.inputPanel.switchDisplayMode('json');
		await expect(aura.canvas.logsPanel.inputPanel.get()).toContainText(
			'[{"messages": ["Human: Hi!"],',
		);
	});

	test('should show input and output data of correct run index and branch', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements({ workflow: 'Workflow_if.json' });

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.logsPanel.open();
		await aura.canvas.clickExecuteWorkflowButton();

		await aura.canvas.logsPanel.clickLogEntryAtRow(2); // Run #1 of 'Edit Fields' node; input is 'Code' node
		await aura.canvas.logsPanel.toggleInputPanel();
		await aura.canvas.logsPanel.inputPanel.get().hover();
		await aura.canvas.logsPanel.inputPanel.switchDisplayMode('table');
		await expect(aura.canvas.logsPanel.inputPanel.getTableRows()).toHaveCount(11);
		await expect(aura.canvas.logsPanel.inputPanel.getTbodyCell(0, 0)).toContainText('0');
		await expect(aura.canvas.logsPanel.inputPanel.getTbodyCell(9, 0)).toContainText('9');
		await aura.canvas.logsPanel.clickOpenNdvAtRow(2);
		await aura.ndv.inputPanel.switchDisplayMode('table');
		await expect(aura.ndv.getInputSelect()).toHaveValue(`${NODES.CODE} `);
		await expect(aura.ndv.inputPanel.getTableRows()).toHaveCount(11);
		await expect(aura.ndv.inputPanel.getTbodyCell(0, 0)).toContainText('0');
		await expect(aura.ndv.inputPanel.getTbodyCell(9, 0)).toContainText('9');
		await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue('1 of 3 (10 items)');

		await aura.ndv.clickBackToCanvasButton();

		await aura.canvas.logsPanel.clickLogEntryAtRow(4); // Run #2 of 'Edit Fields' node; input is false branch of 'If' node
		await expect(aura.canvas.logsPanel.inputPanel.getTableRows()).toHaveCount(6);
		await expect(aura.canvas.logsPanel.inputPanel.getTbodyCell(0, 0)).toContainText('5');
		await expect(aura.canvas.logsPanel.inputPanel.getTbodyCell(4, 0)).toContainText('9');
		await aura.canvas.logsPanel.clickOpenNdvAtRow(4);
		await expect(aura.ndv.getInputSelect()).toHaveValue(`${NODES.IF} `);
		await expect(aura.ndv.inputPanel.getTableRows()).toHaveCount(6);
		await expect(aura.ndv.inputPanel.getTbodyCell(0, 0)).toContainText('5');
		await expect(aura.ndv.inputPanel.getTbodyCell(4, 0)).toContainText('9');
		await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue('2 of 3 (5 items)');

		await aura.ndv.clickBackToCanvasButton();

		await aura.canvas.logsPanel.clickLogEntryAtRow(5); // Run #3 of 'Edit Fields' node; input is true branch of 'If' node
		await expect(aura.canvas.logsPanel.inputPanel.getTableRows()).toHaveCount(6);
		await expect(aura.canvas.logsPanel.inputPanel.getTbodyCell(0, 0)).toContainText('0');
		await expect(aura.canvas.logsPanel.inputPanel.getTbodyCell(4, 0)).toContainText('4');
		await aura.canvas.logsPanel.clickOpenNdvAtRow(5);
		await expect(aura.ndv.getInputSelect()).toHaveValue(`${NODES.IF} `);
		await expect(aura.ndv.inputPanel.getTableRows()).toHaveCount(6);
		await expect(aura.ndv.inputPanel.getTbodyCell(0, 0)).toContainText('0');
		await expect(aura.ndv.inputPanel.getTbodyCell(4, 0)).toContainText('4');
		await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue('3 of 3 (5 items)');
	});

	test('should keep populated logs unchanged when workflow get edits after the execution', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements({ workflow: 'Workflow_if.json' });

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.logsPanel.open();

		await aura.workflowComposer.executeWorkflowAndWaitForNotification('Successful');
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(6);
		await aura.canvas.nodeDisableButton(NODES.EDIT_FIELDS).click();
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(6);
		await aura.canvas.deleteNodeByName(NODES.IF);
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(6);
	});

	// TODO: make it possible to test workflows with AI model end-to-end
	test.skip('should show logs for a past execution', async ({ aura, setupRequirements }) => {
		await setupRequirements({ workflow: 'Workflow_ai_agent.json' });

		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.logsPanel.open();

		await aura.canvas.logsPanel.sendManualChatMessage('Hi!');
		await aura.workflowComposer.executeWorkflowAndWaitForNotification('Successful');
		await aura.canvas.openExecutions();
		await aura.executions.getAutoRefreshButton().click();
		await expect(aura.executions.logsPanel.getManualChatMessages().nth(0)).toContainText('Hi!');
		await expect(aura.executions.logsPanel.getManualChatMessages().nth(1)).toContainText(
			'Hello from e2e model!!!',
		);
		await expect(
			aura.executions.logsPanel.getOverviewStatus().filter({ hasText: /Success in [\d.]+m?s/ }),
		).toBeVisible();
		await expect(aura.executions.logsPanel.getLogEntries()).toHaveCount(3);
		await expect(aura.executions.logsPanel.getLogEntries().nth(0)).toContainText(
			'When chat message received',
		);
		await expect(aura.executions.logsPanel.getLogEntries().nth(1)).toContainText('AI Agent');
		await expect(aura.executions.logsPanel.getLogEntries().nth(2)).toContainText('E2E Chat Model');
	});

	test('should show logs for a workflow with a node that waits for webhook', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Workflow_wait_for_webhook.json');
		await aura.canvas.deselectAll();
		await aura.canvas.logsPanel.open();

		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.getWaitingNodes()).toContainText(NODES.WAIT_NODE);
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(2);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(1)).toContainText(NODES.WAIT_NODE);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(1)).toContainText('Waiting');

		await aura.canvas.openNode(NODES.WAIT_NODE);
		const webhookUrl = await aura.ndv.outputPanel
			.getDataContainer()
			.locator('a')
			.getAttribute('href');
		await aura.ndv.clickBackToCanvasButton();

		// [CAT-1454] Assert that no duplicate logs added at this point
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(2);

		// Trigger the webhook
		const response = await aura.page.request.get(webhookUrl!);
		expect(response.status()).toBe(200);

		await expect(aura.canvas.getWaitingNodes()).toBeHidden();
		await expect(
			aura.canvas.logsPanel.getOverviewStatus().filter({ hasText: /Success in [\d.]+m?s/ }),
		).toBeVisible();
		await aura.canvas.logsPanel.getLogEntries().nth(1).click(); // click selected row to deselect
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(2);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(1)).toContainText(NODES.WAIT_NODE);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(1)).toContainText('Success');
	});

	test('should allow to cancel a workflow with a node that waits for webhook', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Workflow_wait_for_webhook.json');
		await aura.canvas.deselectAll();
		await aura.canvas.logsPanel.open();

		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.getWaitingNodes()).toContainText(NODES.WAIT_NODE);
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(2);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(0)).toContainText(
			'When clicking ‘Test workflow’',
		);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(1)).toContainText(NODES.WAIT_NODE);

		await aura.canvas.stopExecutionButton().click();
		await expect(aura.canvas.stopExecutionButton()).toBeHidden();
		await expect(aura.canvas.logsPanel.getOverviewStatus()).toContainText('Canceled in');
		await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(1);
		await expect(aura.canvas.logsPanel.getLogEntries().nth(0)).toContainText(
			'When clicking ‘Test workflow’',
		);
	});
});
