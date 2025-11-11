import { EDIT_FIELDS_SET_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';

test.describe('CAT-726 Node connectors not rendered when nodes inserted on the canvas', () => {
	test('should correctly append a No Op node when Loop Over Items node is added (from add button)', async ({
		aura,
	}) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);

		await aura.canvas.addNodeBetweenNodes(
			'When clicking ‘Execute workflow’',
			'Edit Fields',
			'Loop Over Items (Split in Batches)',
		);

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(4);
		await expect(aura.canvas.nodeConnections()).toHaveCount(4);

		await expect
			.soft(aura.canvas.connectionBetweenNodes('Loop Over Items', 'Replace Me'))
			.toBeVisible();
		await expect
			.soft(aura.canvas.connectionBetweenNodes('Loop Over Items', 'Edit Fields'))
			.toBeVisible();
		await expect
			.soft(aura.canvas.connectionBetweenNodes('Replace Me', 'Loop Over Items'))
			.toBeVisible();
	});
});
