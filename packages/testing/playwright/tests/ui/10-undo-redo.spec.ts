import fs from 'fs';

import {
	SCHEDULE_TRIGGER_NODE_NAME,
	CODE_NODE_NAME,
	CODE_NODE_DISPLAY_NAME,
	EDIT_FIELDS_SET_NODE_NAME,
	MANUAL_TRIGGER_NODE_NAME,
	MANUAL_TRIGGER_NODE_DISPLAY_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';
import { resolveFromRoot } from '../../utils/path-helper';

test.describe('Undo/Redo', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();
	});

	test('should undo/redo deleting node using context menu', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.clickZoomToFitButton();

		await aura.canvas.deleteNodeFromContextMenu(CODE_NODE_DISPLAY_NAME);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should undo/redo deleting node using keyboard shortcut', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
		await aura.canvas.clickZoomToFitButton();
		await aura.page.keyboard.press('Backspace');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should undo/redo deleting node between two connected nodes', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });
		await aura.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
		await aura.canvas.clickZoomToFitButton();
		await aura.page.keyboard.press('Backspace');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		await expect(aura.canvas.nodeConnections()).toHaveCount(2);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);
	});

	test('should undo/redo deleting whole workflow', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.page.keyboard.press('Escape');
		await aura.page.keyboard.press('Escape');

		await aura.canvas.hitDeleteAllNodes();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should undo/redo moving nodes', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();

		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.canvas.clickZoomToFitButton();

		const codeNodeName = CODE_NODE_DISPLAY_NAME;

		const initialPosition = await aura.canvas.getNodePosition(codeNodeName);

		await aura.canvas.dragNodeToRelativePosition(codeNodeName, 50, 150);

		const newPosition = await aura.canvas.getNodePosition(codeNodeName);
		expect(newPosition.x).toBeGreaterThan(initialPosition.x);
		expect(newPosition.y).toBeGreaterThan(initialPosition.y);

		await aura.canvas.hitUndo();
		const undoPosition = await aura.canvas.getNodePosition(codeNodeName);
		expect(undoPosition.x).toBeCloseTo(initialPosition.x, 1);
		expect(undoPosition.y).toBeCloseTo(initialPosition.y, 1);

		await aura.canvas.hitRedo();
		const redoPosition = await aura.canvas.getNodePosition(codeNodeName);
		expect(redoPosition.x).toBeGreaterThan(initialPosition.x);
		expect(redoPosition.y).toBeGreaterThan(initialPosition.y);
	});

	test('should undo/redo deleting a connection using context menu', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.canvas.deleteConnectionBetweenNodes(
			SCHEDULE_TRIGGER_NODE_NAME,
			CODE_NODE_DISPLAY_NAME,
		);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should undo/redo disabling a node using context menu', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.canvas.disableNodeFromContextMenu(CODE_NODE_DISPLAY_NAME);
		await expect(aura.canvas.disabledNodes()).toHaveCount(1);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.disabledNodes()).toHaveCount(0);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.disabledNodes()).toHaveCount(1);
	});

	test('should undo/redo disabling a node using keyboard shortcut', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.getCanvasNodes().last().click();
		await aura.page.keyboard.press('d');

		await expect(aura.canvas.disabledNodes()).toHaveCount(1);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.disabledNodes()).toHaveCount(0);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.disabledNodes()).toHaveCount(1);
	});

	test('should undo/redo disabling multiple nodes', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.page.keyboard.press('Escape');
		await aura.page.keyboard.press('Escape');

		await aura.canvas.selectAll();
		await aura.page.keyboard.press('d');

		await expect(aura.canvas.disabledNodes()).toHaveCount(2);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.disabledNodes()).toHaveCount(0);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.disabledNodes()).toHaveCount(2);
	});

	test('should undo/redo duplicating a node', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.canvas.duplicateNode(CODE_NODE_DISPLAY_NAME);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
	});

	test('should undo/redo pasting nodes', async ({ aura }) => {
		const workflowJson = fs.readFileSync(
			resolveFromRoot('workflows', 'Test_workflow-actions_paste-data.json'),
			'utf-8',
		);

		await aura.canvas.canvasPane().click();
		await aura.clipboard.paste(workflowJson);
		await aura.canvas.clickZoomToFitButton();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(5);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);

		await aura.canvas.hitRedo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(5);
	});

	test('should be able to copy and paste pinned data nodes in workflows with dynamic Switch node', async ({
		aura,
	}) => {
		const workflowJson = fs.readFileSync(
			resolveFromRoot('workflows', 'Test_workflow_form_switch.json'),
			'utf-8',
		);

		await aura.canvas.canvasPane().click();
		await aura.clipboard.paste(workflowJson);
		await aura.canvas.clickZoomToFitButton();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);
		await expect(aura.canvas.getNodeInputHandles('Switch')).toHaveCount(1);

		// Wait for clipboard paste throttling
		await aura.page.waitForTimeout(1000);

		await aura.canvas.canvasPane().click();
		await aura.clipboard.paste(workflowJson);

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(4);
		await expect(aura.canvas.nodeConnections()).toHaveCount(2);

		await aura.canvas.hitUndo();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);
		await expect(aura.canvas.getNodeInputHandles('Switch')).toHaveCount(1);
	});

	test('should not undo/redo when NDV or a modal is open', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME);

		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await aura.ndv.clickBackToCanvasButton();

		await aura.sideBar.clickAboutMenuItem();
		await expect(aura.sideBar.getAboutModal()).toBeVisible();
		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await aura.sideBar.closeAboutModal();

		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);
	});

	test('should not undo/redo when NDV or a prompt is open', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.clickWorkflowMenu();
		await aura.canvas.clickImportFromURL();

		await aura.canvas.getImportURLInput().click();
		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);

		await aura.canvas.clickCancelImportURL();
		await aura.canvas.hitUndo();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);
	});
});
