import { MANUAL_TRIGGER_NODE_DISPLAY_NAME } from '../../../config/constants';
import { test, expect } from '../../../fixtures/base';

test.describe('Node Creator Special Nodes', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should correctly append a No Op node when Loop Over Items node is added (from add button)', async ({
		aura,
	}) => {
		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor('Loop Over Items');
		await aura.canvas.nodeCreator.selectItem('Loop Over Items');
		await aura.ndv.close();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		await expect(aura.canvas.nodeConnections()).toHaveCount(3);
		await expect(aura.canvas.nodeByName('Loop Over Items')).toBeVisible();
		await expect(aura.canvas.nodeByName('Replace Me')).toBeVisible();
	});

	test('should correctly append a No Op node when Loop Over Items node is added (from connection)', async ({
		aura,
	}) => {
		await aura.canvas.addNode('Manual Trigger');

		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await aura.canvas.nodeCreator.searchFor('Loop Over Items');
		await aura.canvas.nodeCreator.selectItem('Loop Over Items');
		await aura.ndv.close();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		await expect(aura.canvas.nodeConnections()).toHaveCount(3);
		await expect(aura.canvas.nodeByName('Loop Over Items')).toBeVisible();
		await expect(aura.canvas.nodeByName('Replace Me')).toBeVisible();
	});

	test('should add a Send and Wait for Response node', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);

		await aura.canvas.nodeCreator.selectItem('Human in the loop');

		await aura.canvas.nodeCreator.selectItem('Slack');
		await aura.ndv.setupHelper.setParameter('operation', 'Send and Wait for Response');
		await aura.ndv.close();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});
});
