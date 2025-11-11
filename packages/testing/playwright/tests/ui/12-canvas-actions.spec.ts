import {
	MANUAL_TRIGGER_NODE_NAME,
	MANUAL_TRIGGER_NODE_DISPLAY_NAME,
	CODE_NODE_NAME,
	HTTP_REQUEST_NODE_NAME,
	CODE_NODE_DISPLAY_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';

test.describe('Canvas Actions', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();
	});

	test('should add first step', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
	});

	test('should add a connected node using plus endpoint', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await aura.canvas.fillNodeCreatorSearchBar(CODE_NODE_NAME);
		await aura.page.keyboard.press('Enter');
		await aura.canvas.clickNodeCreatorItemName(CODE_NODE_DISPLAY_NAME);
		await aura.page.keyboard.press('Enter');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);
	});

	test('should add a connected node dragging from node creator', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await aura.canvas.fillNodeCreatorSearchBar(CODE_NODE_NAME);
		await aura.page.keyboard.press('Enter');
		await aura.canvas
			.nodeCreatorSubItem(CODE_NODE_DISPLAY_NAME)
			.dragTo(aura.canvas.canvasPane(), { targetPosition: { x: 100, y: 100 } });

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);
	});

	test('should open a category when trying to drag and drop it on the canvas', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await aura.canvas.fillNodeCreatorSearchBar(CODE_NODE_NAME);

		const categoryItem = aura.canvas.nodeCreatorActionItems().first();
		await categoryItem.dragTo(aura.canvas.canvasPane(), {
			targetPosition: { x: 100, y: 100 },
		});

		await expect(aura.canvas.nodeCreatorCategoryItems()).toHaveCount(1);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should add disconnected node if nothing is selected', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.deselectAll();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should add node between two connected nodes', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);

		await aura.canvas.addNodeBetweenNodes(
			MANUAL_TRIGGER_NODE_DISPLAY_NAME,
			CODE_NODE_DISPLAY_NAME,
			HTTP_REQUEST_NODE_NAME,
		);

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		await expect(aura.canvas.nodeConnections()).toHaveCount(2);
	});

	test('should delete node by pressing keyboard backspace', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.page.keyboard.press('Backspace');

		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should delete connections by clicking on the delete button', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.deleteConnectionBetweenNodes(
			MANUAL_TRIGGER_NODE_DISPLAY_NAME,
			CODE_NODE_DISPLAY_NAME,
		);

		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});

	test.describe('Node hover actions', () => {
		test('should execute node', async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.deselectAll();
			await aura.canvas.executeNode(MANUAL_TRIGGER_NODE_DISPLAY_NAME);

			await expect(
				aura.notifications.getNotificationByTitle('Node executed successfully'),
			).toHaveCount(1);
			await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
			await expect(aura.canvas.selectedNodes()).toHaveCount(0);
		});

		test('should disable and enable node', async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
			await aura.canvas.deselectAll();

			const disableButton = aura.canvas.nodeDisableButton(CODE_NODE_DISPLAY_NAME);
			await disableButton.click();

			await expect(aura.canvas.disabledNodes()).toHaveCount(1);
			await expect(aura.canvas.selectedNodes()).toHaveCount(0);

			await disableButton.click();

			await expect(aura.canvas.disabledNodes()).toHaveCount(0);
			await expect(aura.canvas.selectedNodes()).toHaveCount(0);
		});

		test('should delete node', async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
			await aura.canvas.deleteNodeByName(CODE_NODE_DISPLAY_NAME);

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
			await expect(aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME)).toBeVisible();
		});
	});

	test('should copy selected nodes', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvasComposer.selectAllAndCopy();
		await aura.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
		await aura.canvasComposer.copySelectedNodesWithToast();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});

	test('should select/deselect all nodes', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.selectAll();

		await expect(aura.canvas.selectedNodes()).toHaveCount(2);

		await aura.canvas.deselectAll();
		await expect(aura.canvas.selectedNodes()).toHaveCount(0);
	});

	test('should select nodes using arrow keys', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.getCanvasNodes().first().waitFor();
		await aura.canvas.navigateNodesWithArrows('left');

		const selectedNodes = aura.canvas.selectedNodes();
		await expect(selectedNodes.first()).toHaveClass(/selected/);

		await aura.canvas.navigateNodesWithArrows('right');

		await expect(selectedNodes.last()).toHaveClass(/selected/);
	});

	test('should select nodes using shift and arrow keys', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.getCanvasNodes().first().waitFor();
		await aura.canvas.extendSelectionWithArrows('left');

		await expect(aura.canvas.selectedNodes()).toHaveCount(2);
	});
});
