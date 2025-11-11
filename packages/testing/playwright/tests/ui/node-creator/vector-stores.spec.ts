import { MANUAL_TRIGGER_NODE_DISPLAY_NAME } from '../../../config/constants';
import { test, expect } from '../../../fixtures/base';

test.describe('Node Creator Vector Stores', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.addNode('Manual Trigger');
	});

	test('should show vector stores actions', async ({ aura }) => {
		const expectedActions = [
			'Get ranked documents from vector store',
			'Add documents to vector store',
			'Retrieve documents for Chain/Tool as Vector Store',
			'Retrieve documents for AI Agent as Tool',
		];

		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await aura.canvas.nodeCreator.searchFor('Vector Store');

		await expect(aura.canvas.nodeCreator.getNodeItems().first()).toBeVisible();

		await aura.canvas.nodeCreator.getItem('Simple Vector Store').click();

		for (const action of expectedActions) {
			await expect(aura.canvas.nodeCreator.getItem(action)).toBeVisible();
		}

		await aura.canvas.nodeCreator.goBackFromSubcategory();
		await expect(aura.canvas.nodeCreator.getNodeItems().first()).toBeVisible();
	});

	test('should find vector store nodes in creator', async ({ aura }) => {
		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await aura.canvas.nodeCreator.searchFor('Vector Store');

		await expect(aura.canvas.nodeCreator.getNodeItems().first()).toBeVisible();
	});

	test('should search for specific vector store nodes', async ({ aura }) => {
		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await aura.canvas.nodeCreator.searchFor('Simple Vector Store');

		await expect(aura.canvas.nodeCreator.getItem('Simple Vector Store')).toBeVisible();
	});
});
