import {
	MANUAL_TRIGGER_NODE_NAME,
	MANUAL_TRIGGER_NODE_DISPLAY_NAME,
} from '../../../config/constants';
import { test, expect } from '../../../fixtures/base';

test.describe('Canvas Node Actions', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();
	});

	test.describe('Node Search and Add', () => {
		test('should search and add a basic node', async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
			await expect(aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME)).toBeVisible();
		});

		test('should search and add Linear node with action', async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.addNode('Linear', { action: 'Create an issue' });

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
			await expect(aura.canvas.nodeConnections()).toHaveCount(1);
			await expect(aura.canvas.nodeByName('Create an issue')).toBeVisible();
		});

		test('should search and add Webhook node (no actions)', async ({ aura }) => {
			await aura.canvas.addNode('Webhook');

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
			await expect(aura.canvas.nodeByName('Webhook')).toBeVisible();
		});

		test('should search and add Jira node with trigger', async ({ aura }) => {
			await aura.canvas.addNode('Jira Software', { trigger: 'On issue created' });
			await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
			await expect(aura.canvas.nodeByName('Jira Trigger')).toBeVisible();
		});

		test('should clear search and show all nodes', async ({ aura }) => {
			await aura.canvas.clickCanvasPlusButton();
			await aura.canvas.fillNodeCreatorSearchBar('Linear');
			const searchCount = await aura.canvas.nodeCreatorNodeItems().count();
			await expect(aura.canvas.nodeCreatorNodeItems()).toHaveCount(1);

			await aura.canvas.nodeCreatorSearchBar().clear();
			const nodeCount = await aura.canvas.nodeCreatorNodeItems().count();
			expect(nodeCount).toBeGreaterThan(searchCount);
		});

		test('should add connected node via plus endpoint', async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);

			await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
			await aura.canvas.fillNodeCreatorSearchBar('Code');
			await aura.page.keyboard.press('Enter');

			await aura.canvas.clickNodeCreatorItemName('Code in JavaScript');
			await aura.page.keyboard.press('Enter');
			await aura.page.keyboard.press('Escape');

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
			await expect(aura.canvas.nodeConnections()).toHaveCount(1);
		});

		test('should add disconnected node when nothing selected', async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.deselectAll();
			await aura.canvas.addNode('Code', { action: 'Code in JavaScript', closeNDV: true });
			await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
			await expect(aura.canvas.nodeConnections()).toHaveCount(0);
		});
	});

	test.describe('Node Creator Interactions', () => {
		test('should close node creator with escape key', async ({ aura }) => {
			await aura.canvas.clickCanvasPlusButton();
			await expect(aura.canvas.nodeCreatorSearchBar()).toBeVisible();

			await aura.page.keyboard.press('Escape');
			await expect(aura.canvas.nodeCreatorSearchBar()).toBeHidden();
		});

		test('should filter nodes by search term', async ({ aura }) => {
			await aura.canvas.clickCanvasPlusButton();
			await aura.canvas.fillNodeCreatorSearchBar('HTTP');

			const filteredItems = aura.canvas.nodeCreatorNodeItems();
			await expect(filteredItems.first()).toContainText('HTTP');
		});
	});
});
