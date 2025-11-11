import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

const NODES = {
	MANUAL_TRIGGER: 'Manual Trigger',
	SCHEDULE_TRIGGER: 'Schedule Trigger',
	WEBHOOK: 'Webhook',
	HTTP_REQUEST: 'HTTP Request',
	PIPEDRIVE: 'Pipedrive',
	EDIT_FIELDS: 'Edit Fields (Set)', // Use the full node name that appears in the Node List, although when it's added to the canvas it's called "Edit Fields"
	CODE: 'Code',
	END: 'End',
};

const webhookTestRequirements: TestRequirements = {
	workflow: {
		'Test_workflow_webhook_with_pin_data.json': 'Test',
	},
};

const pinnedWebhookRequirements: TestRequirements = {
	workflow: {
		'Pinned_webhook_node.json': 'Test',
	},
};

test.describe('Data pinning', () => {
	const maxPinnedDataSize = 16384;

	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
	});

	test.describe('Pin data operations', () => {
		test('should be able to pin node output', async ({ aura }) => {
			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode(NODES.SCHEDULE_TRIGGER);

			await aura.ndv.execute();
			await expect(aura.ndv.outputPanel.get()).toBeVisible();

			const prevValue = await aura.ndv.outputPanel.getTbodyCell(0, 0).textContent();

			await aura.ndv.togglePinData();
			await aura.ndv.close();

			// Execute workflow and verify pinned data persists
			await aura.canvas.clickExecuteWorkflowButton();
			await aura.canvas.openNode(NODES.SCHEDULE_TRIGGER);

			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toHaveText(prevValue ?? '');
		});

		test('should be able to set custom pinned data', async ({ aura }) => {
			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode(NODES.SCHEDULE_TRIGGER);

			await expect(aura.ndv.getEditPinnedDataButton()).toBeVisible();
			await expect(aura.ndv.outputPanel.getPinDataButton()).toBeHidden();

			await aura.ndv.setPinnedData([{ test: 1 }]);

			await expect(aura.ndv.outputPanel.getTableRows()).toHaveCount(2);
			await expect(aura.ndv.outputPanel.getTableHeaders()).toHaveCount(2);
			await expect(aura.ndv.outputPanel.getTableHeaders().first()).toContainText('test');
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toContainText('1');

			await aura.ndv.close();
			await aura.canvas.clickSaveWorkflowButton();
			await aura.canvas.openNode(NODES.SCHEDULE_TRIGGER);

			await expect(aura.ndv.outputPanel.getTableHeaders().first()).toContainText('test');
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toContainText('1');
		});

		test('should display pin data edit button for Webhook node', async ({ aura }) => {
			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode(NODES.WEBHOOK);

			const runDataHeader = aura.ndv.getRunDataPaneHeader();
			const editButton = runDataHeader.getByRole('button', { name: 'Edit Output' });
			await expect(editButton).toBeVisible();
		});

		test('should duplicate pinned data when duplicating node', async ({ aura }) => {
			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode(NODES.SCHEDULE_TRIGGER);
			await aura.ndv.close();

			await aura.canvas.addNode(NODES.EDIT_FIELDS);

			await expect(aura.ndv.getContainer()).toBeVisible();

			await expect(aura.ndv.getEditPinnedDataButton()).toBeVisible();
			await expect(aura.ndv.outputPanel.getPinDataButton()).toBeHidden();

			await aura.ndv.setPinnedData([{ test: 1 }]);
			await aura.ndv.close();

			await aura.canvas.duplicateNode('Edit Fields');
			await aura.canvas.clickSaveWorkflowButton();
			await aura.canvas.openNode('Edit Fields1');

			await expect(aura.ndv.outputPanel.getTableHeader(0)).toContainText('test');
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toContainText('1');
		});
	});

	test.describe('Error handling', () => {
		test('should show error when maximum pin data size is exceeded', async ({ aura }) => {
			await aura.page.evaluate((maxSize) => {
				(window as { maxPinnedDataSize?: number }).maxPinnedDataSize = maxSize;
			}, maxPinnedDataSize);

			const actualMaxSize = await aura.page.evaluate(() => {
				return (window as { maxPinnedDataSize?: number }).maxPinnedDataSize;
			});
			expect(actualMaxSize).toBe(maxPinnedDataSize);

			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode(NODES.SCHEDULE_TRIGGER);
			await aura.ndv.close();

			await aura.canvas.addNode(NODES.EDIT_FIELDS);

			await expect(aura.ndv.getContainer()).toBeVisible();
			await expect(aura.ndv.getEditPinnedDataButton()).toBeVisible();
			await expect(aura.ndv.outputPanel.getPinDataButton()).toBeHidden();

			const largeData = [{ test: '1'.repeat(maxPinnedDataSize + 1000) }];
			await aura.ndv.setPinnedData(largeData);

			await expect(
				aura.notifications.getNotificationByContent(
					'Workflow has reached the maximum allowed pinned data size',
				),
			).toBeVisible();
		});

		test('should show error when pin data JSON is invalid', async ({ aura }) => {
			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode(NODES.SCHEDULE_TRIGGER);
			await aura.ndv.close();

			await aura.canvas.addNode(NODES.EDIT_FIELDS);

			await expect(aura.ndv.getContainer()).toBeVisible();
			await expect(aura.ndv.getEditPinnedDataButton()).toBeVisible();
			await expect(aura.ndv.outputPanel.getPinDataButton()).toBeHidden();

			await aura.ndv.setPinnedData('[ { "name": "First item", "code": 2dsa }]');

			await expect(
				aura.notifications.getNotificationByTitle('Unable to save due to invalid JSON'),
			).toBeVisible();
		});
	});

	test.describe('Advanced pinning scenarios', () => {
		test('should be able to reference paired items in node before pinned data', async ({
			aura,
		}) => {
			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode(NODES.MANUAL_TRIGGER);

			await aura.canvas.addNode(NODES.HTTP_REQUEST);
			await aura.ndv.setPinnedData([{ http: 123 }]);
			await aura.ndv.close();

			await aura.canvas.addNode(NODES.PIPEDRIVE, { action: 'Create an activity' });
			await aura.ndv.setPinnedData(Array(3).fill({ pipedrive: 123 }));
			await aura.ndv.close();

			await aura.canvas.addNode(NODES.EDIT_FIELDS);

			await aura.ndv.execute();

			await expect(aura.ndv.getNodeParameters()).toBeVisible();

			await expect(aura.ndv.getAssignmentCollectionAdd('assignments')).toBeVisible();
			await aura.ndv.getAssignmentCollectionAdd('assignments').click();
			await aura.ndv.getAssignmentValue('assignments').getByText('Expression').click();

			const expressionInput = aura.ndv.getInlineExpressionEditorInput();
			await expressionInput.click();
			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor(`{{ $('${NODES.HTTP_REQUEST}').item`);
			await aura.page.keyboard.press('Escape');

			const expectedOutput = '[Object: {"json": {"http": 123}, "pairedItem": {"item": 0}}]';
			await expect(aura.ndv.getParameterInputHint().getByText(expectedOutput)).toBeVisible();
		});

		test('should use pin data in manual webhook executions', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(webhookTestRequirements);
			await aura.canvas.clickExecuteWorkflowButton();
			await expect(aura.canvas.getExecuteWorkflowButton()).toHaveText(
				'Waiting for trigger event from Webhook',
			);

			const webhookPath = '/webhook-test/b0d79ddb-df2d-49b1-8555-9fa2b482608f';
			const response = await aura.ndv.makeWebhookRequest(webhookPath);
			expect(response.status()).toBe(200);

			await aura.canvas.openNode(NODES.END);

			await expect(aura.ndv.outputPanel.getTableRow(1)).toBeVisible();
			await expect(aura.ndv.outputPanel.getTableRow(1)).toContainText('pin-overwritten');
		});

		test('should not use pin data in production webhook executions', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(webhookTestRequirements);
			await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
			await aura.canvas.activateWorkflow();
			const webhookUrl = '/webhook/b0d79ddb-df2d-49b1-8555-9fa2b482608f';
			const response = await aura.ndv.makeWebhookRequest(webhookUrl);
			expect(response.status(), 'Webhook response is: ' + (await response.text())).toBe(200);

			const responseBody = await response.json();
			expect(responseBody).toEqual({ nodeData: 'pin' });
		});

		test('should not show pinned data tooltip', async ({ aura, setupRequirements }) => {
			await setupRequirements(pinnedWebhookRequirements);
			await aura.canvas.clickExecuteWorkflowButton();

			await aura.canvas.getCanvasNodes().first().click();

			const poppers = aura.ndv.getVisiblePoppers();
			await expect(poppers).toHaveCount(0);
		});
	});
});
