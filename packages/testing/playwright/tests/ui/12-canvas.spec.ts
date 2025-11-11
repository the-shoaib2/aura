import fs from 'fs';

import {
	MANUAL_TRIGGER_NODE_NAME,
	MANUAL_TRIGGER_NODE_DISPLAY_NAME,
	SWITCH_NODE_NAME,
	EDIT_FIELDS_SET_NODE_NAME,
	MERGE_NODE_NAME,
	CODE_NODE_NAME,
	SCHEDULE_TRIGGER_NODE_NAME,
	CODE_NODE_DISPLAY_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';
import { resolveFromRoot } from '../../utils/path-helper';

const DEFAULT_ZOOM_FACTOR = 1;
const ZOOM_IN_X1_FACTOR = 1.25; // Expected zoom after 1 zoom-in click (125%)
const ZOOM_IN_X2_FACTOR = 1.5625; // Expected zoom after 2 zoom-in clicks (156.25%)
const ZOOM_OUT_X1_FACTOR = 0.8; // Expected zoom after 1 zoom-out click (80%)
const ZOOM_OUT_X2_FACTOR = 0.64; // Expected zoom after 2 zoom-out clicks (64%)
const ZOOM_TOLERANCE = 0.2; // Acceptable variance for floating-point zoom comparisons

test.describe('Canvas Node Manipulation and Navigation', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should add switch node and test connections', async ({ aura }) => {
		const desiredOutputs = 4;
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(SWITCH_NODE_NAME);

		for (let i = 0; i < desiredOutputs; i++) {
			await aura.page.getByText('Add Routing Rule').click();
		}

		await aura.ndv.close();

		for (let i = 0; i < desiredOutputs; i++) {
			await aura.canvas.clickNodePlusEndpoint(SWITCH_NODE_NAME);
			await expect(aura.canvas.nodeCreatorSearchBar()).toBeVisible();
			await aura.canvas.fillNodeCreatorSearchBar(EDIT_FIELDS_SET_NODE_NAME);
			await aura.canvas.clickNodeCreatorItemName(EDIT_FIELDS_SET_NODE_NAME);
			await aura.page.keyboard.press('Escape');
			await aura.canvas.clickZoomToFitButton();
		}

		await aura.canvas.canvasPane().click({ position: { x: 10, y: 10 } });

		await aura.canvas.clickNodePlusEndpoint('Edit Fields3');
		await aura.canvas.fillNodeCreatorSearchBar(SWITCH_NODE_NAME);
		await aura.canvas.clickNodeCreatorItemName(SWITCH_NODE_NAME);
		await aura.page.keyboard.press('Escape');

		await aura.canvas.saveWorkflow();
		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');

		await aura.canvasComposer.reloadAndWaitForCanvas();

		await expect(
			aura.canvas.connectionBetweenNodes('Edit Fields3', `${SWITCH_NODE_NAME}1`),
		).toBeAttached();

		const editFieldsNodes = ['Edit Fields', 'Edit Fields1', 'Edit Fields2', 'Edit Fields3'];
		for (const nodeName of editFieldsNodes) {
			await expect(aura.canvas.connectionBetweenNodes(SWITCH_NODE_NAME, nodeName)).toBeAttached();
		}
	});

	test('should add merge node and test connections', async ({ aura }) => {
		const editFieldsNodeCount = 2;

		const checkConnections = async () => {
			await expect(
				aura.canvas
					.connectionBetweenNodes(MANUAL_TRIGGER_NODE_DISPLAY_NAME, 'Edit Fields1')
					.first(),
			).toBeAttached();
			await expect(
				aura.canvas.connectionBetweenNodes('Edit Fields', MERGE_NODE_NAME).first(),
			).toBeAttached();
			await expect(
				aura.canvas.connectionBetweenNodes('Edit Fields1', MERGE_NODE_NAME).first(),
			).toBeAttached();
		};

		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();

		for (let i = 0; i < editFieldsNodeCount; i++) {
			await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });
			await aura.canvas.canvasPane().click({
				position: { x: (i + 1) * 200, y: (i + 1) * 200 },
				// eslint-disable-next-line playwright/no-force-option
				force: true,
			});
		}
		await aura.canvas.clickZoomToFitButton();

		await aura.canvas.addNode(MERGE_NODE_NAME, { closeNDV: true });
		await aura.canvas.clickZoomToFitButton();

		await aura.canvas.connectNodesByDrag(MANUAL_TRIGGER_NODE_DISPLAY_NAME, 'Edit Fields1', 0, 0);

		await aura.canvas.connectNodesByDrag('Edit Fields', MERGE_NODE_NAME, 0, 0);

		await aura.canvas.connectNodesByDrag('Edit Fields1', MERGE_NODE_NAME, 0, 1);

		await checkConnections();

		await aura.canvas.saveWorkflow();
		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');

		await aura.canvasComposer.reloadAndWaitForCanvas();

		await checkConnections();

		await aura.canvas.clickExecuteWorkflowButton();
		await expect(aura.canvas.stopExecutionButton()).toBeHidden();

		await aura.canvasComposer.reloadAndWaitForCanvas();

		await checkConnections();

		await aura.canvas.clickExecuteWorkflowButton();
		await expect(aura.canvas.stopExecutionButton()).toBeHidden();

		await expect(
			aura.canvas.getConnectionLabelBetweenNodes('Edit Fields1', MERGE_NODE_NAME).first(),
		).toContainText('2 items');
	});

	test('should add nodes and check execution success', async ({ aura }) => {
		const nodeCount = 3;

		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();

		for (let i = 0; i < nodeCount; i++) {
			await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		}
		await aura.canvas.clickZoomToFitButton();

		await aura.canvas.clickExecuteWorkflowButton();
		await expect(aura.canvas.stopExecutionButton()).toBeHidden();

		await expect(aura.canvas.getSuccessEdges()).toHaveCount(nodeCount);
		await expect(aura.canvas.getAllNodeSuccessIndicators()).toHaveCount(nodeCount + 1);
		await expect(aura.canvas.getCanvasHandlePlusWrapper()).toHaveAttribute(
			'data-plus-type',
			'success',
		);

		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.clickZoomToFitButton();

		await expect(aura.canvas.getCanvasHandlePlus()).not.toHaveAttribute(
			'data-plus-type',
			'success',
		);

		await expect(aura.canvas.getSuccessEdges()).toHaveCount(nodeCount + 1);
		await expect(aura.canvas.getAllNodeSuccessIndicators()).toHaveCount(nodeCount + 1);
	});

	test('should delete node using context menu', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.clickZoomToFitButton();

		await aura.canvas.deleteNodeFromContextMenu(CODE_NODE_DISPLAY_NAME);

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should delete node using keyboard shortcut', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
		await aura.page.keyboard.press('Backspace');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
		await expect(aura.canvas.nodeConnections()).toHaveCount(0);
	});

	test('should delete node between two connected nodes', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		await expect(aura.canvas.nodeConnections()).toHaveCount(2);

		await aura.canvas.nodeByName(CODE_NODE_DISPLAY_NAME).click();
		await aura.canvas.clickZoomToFitButton();
		await aura.page.keyboard.press('Backspace');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);
	});

	test('should delete multiple nodes (context menu or shortcut)', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.hitDeleteAllNodes();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);

		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.canvas.rightClickCanvas();
		await aura.canvas.getContextMenuItem('select_all').click();
		await aura.canvas.rightClickCanvas();
		await aura.canvas.getContextMenuItem('delete').click();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);
	});

	test('should move node', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.canvas.clickZoomToFitButton();

		const pos1 = await aura.canvas.getNodePosition(CODE_NODE_DISPLAY_NAME);
		await aura.canvas.dragNodeToRelativePosition(CODE_NODE_DISPLAY_NAME, 50, 150);
		const pos2 = await aura.canvas.getNodePosition(CODE_NODE_DISPLAY_NAME);

		expect(pos2.x).toBeGreaterThan(pos1.x);
		expect(pos2.y).toBeGreaterThan(pos1.y);
	});
});

test.describe('Canvas Zoom Functionality', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	const expectZoomLevel = async (aura: auraPage, expectedFactor: number) => {
		const actual = await aura.canvas.getCanvasZoomLevel();
		expect(actual).toBeGreaterThanOrEqual(expectedFactor - ZOOM_TOLERANCE);
		expect(actual).toBeLessThanOrEqual(expectedFactor + ZOOM_TOLERANCE);
	};

	test('should zoom in', async ({ aura }) => {
		await expect(aura.canvas.getZoomInButton()).toBeVisible();

		const initialZoom = await aura.canvas.getCanvasZoomLevel();

		await aura.canvas.clickZoomInButton();
		await expectZoomLevel(aura, initialZoom * ZOOM_IN_X1_FACTOR);

		await aura.canvas.clickZoomInButton();
		await expectZoomLevel(aura, initialZoom * ZOOM_IN_X2_FACTOR);
	});

	test('should zoom out', async ({ aura }) => {
		await aura.canvas.clickZoomOutButton();
		await expectZoomLevel(aura, ZOOM_OUT_X1_FACTOR);

		await aura.canvas.clickZoomOutButton();
		const finalZoom = await aura.canvas.getCanvasZoomLevel();
		expect(finalZoom).toBeGreaterThanOrEqual(ZOOM_OUT_X2_FACTOR - ZOOM_TOLERANCE);
		expect(finalZoom).toBeLessThanOrEqual(ZOOM_OUT_X2_FACTOR + ZOOM_TOLERANCE);
	});

	test('should reset zoom', async ({ aura }) => {
		await expect(aura.canvas.getResetZoomButton()).not.toBeAttached();

		await aura.canvas.clickZoomInButton();

		await expect(aura.canvas.getResetZoomButton()).toBeVisible();
		await aura.canvas.getResetZoomButton().click();

		await expectZoomLevel(aura, DEFAULT_ZOOM_FACTOR);
	});

	test('should zoom to fit', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.canvas.clickZoomOutButton();
		await aura.canvas.clickZoomOutButton();

		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.canvas.clickZoomInButton();
		await aura.canvas.clickZoomInButton();

		await expect(aura.canvas.getCanvasNodes().last()).not.toBeInViewport();

		await aura.canvas.clickZoomToFitButton();

		await expect(aura.canvas.getCanvasNodes().last()).toBeInViewport();
	});

	test('should disable node (context menu or shortcut)', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.getCanvasNodes().last().click();
		await aura.page.keyboard.press('d');
		await expect(aura.canvas.disabledNodes()).toHaveCount(1);

		await aura.canvas.disableNodeFromContextMenu(CODE_NODE_DISPLAY_NAME);
		await expect(aura.canvas.disabledNodes()).toHaveCount(0);
	});

	test('should disable multiple nodes (context menu or shortcut)', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
		await aura.page.keyboard.press('Escape');
		await aura.page.keyboard.press('Escape');

		await aura.canvas.selectAll();
		await aura.page.keyboard.press('d');
		await expect(aura.canvas.disabledNodes()).toHaveCount(2);
		await aura.page.keyboard.press('d');
		await expect(aura.canvas.disabledNodes()).toHaveCount(0);
		await aura.canvas.deselectAll();
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.page.keyboard.press('d');
		await expect(aura.canvas.disabledNodes()).toHaveCount(1);
		await aura.canvas.selectAll();
		await aura.page.keyboard.press('d');
		await expect(aura.canvas.disabledNodes()).toHaveCount(2);

		await aura.canvas.selectAll();
		await aura.canvas.rightClickCanvas();
		await aura.canvas.getContextMenuItem('toggle_activation').click();
		await expect(aura.canvas.disabledNodes()).toHaveCount(0);
		await aura.canvas.rightClickCanvas();
		await aura.canvas.getContextMenuItem('toggle_activation').click();
		await expect(aura.canvas.disabledNodes()).toHaveCount(2);
		await aura.canvas.deselectAll();
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.rightClickCanvas();
		await aura.canvas.getContextMenuItem('toggle_activation').click();
		await expect(aura.canvas.disabledNodes()).toHaveCount(1);
		await aura.canvas.selectAll();
		await aura.canvas.rightClickCanvas();
		await aura.canvas.getContextMenuItem('toggle_activation').click();
		await expect(aura.canvas.disabledNodes()).toHaveCount(2);
	});

	test('should rename node (context menu or shortcut)', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvasComposer.renameNodeViaShortcut(CODE_NODE_DISPLAY_NAME, 'Something else');
		await expect(aura.canvas.nodeByName('Something else')).toBeAttached();

		await aura.canvas.rightClickNode('Something else');
		await aura.canvas.getContextMenuItem('rename').click();
		await expect(aura.canvas.getRenamePrompt()).toBeVisible();
		await aura.page.keyboard.type('Something different');
		await aura.page.keyboard.press('Enter');
		await expect(aura.canvas.nodeByName('Something different')).toBeAttached();
	});

	test('should not allow empty strings for node names', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.getCanvasNodes().last().click();
		await aura.page.keyboard.press('F2');
		await expect(aura.canvas.getRenamePrompt()).toBeVisible();
		await aura.page.keyboard.press('Backspace');
		await aura.page.keyboard.press('Enter');
		await expect(aura.canvas.getRenamePrompt()).toContainText('Invalid Name');
	});

	test('should duplicate nodes (context menu or shortcut)', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.nodeByName(MANUAL_TRIGGER_NODE_DISPLAY_NAME).click();
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.duplicateNode(CODE_NODE_DISPLAY_NAME);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);

		await aura.canvas.selectAll();
		await aura.page.keyboard.press('ControlOrMeta+d');
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(5);
	});

	test('should preserve connections after rename & node-view switch', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });
		await aura.canvas.clickExecuteWorkflowButton();

		await expect(
			aura.notifications.getNotificationByTitleOrContent('Workflow executed successfully'),
		).toBeVisible();
		await aura.notifications.closeNotificationByText('Workflow executed successfully');

		await aura.canvas.openExecutions();
		await expect(aura.executions.getSuccessfulExecutionItems()).toHaveCount(1);

		await aura.canvas.clickEditorTab();

		await aura.canvas.openExecutions();
		await expect(aura.executions.getSuccessfulExecutionItems()).toHaveCount(1);

		await aura.canvas.clickEditorTab();
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);

		await aura.canvasComposer.renameNodeViaShortcut(CODE_NODE_DISPLAY_NAME, 'Something else');
		await expect(aura.canvas.nodeByName('Something else')).toBeAttached();

		await aura.canvas.saveWorkflow();
		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');

		await aura.canvasComposer.reloadAndWaitForCanvas();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);
	});

	test('should remove unknown credentials on pasting workflow', async ({ aura }) => {
		const workflowJson = fs.readFileSync(
			resolveFromRoot('workflows', 'workflow-with-unknown-credentials.json'),
			'utf-8',
		);

		await aura.canvas.canvasPane().click();

		await aura.clipboard.paste(workflowJson);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);

		await aura.canvas.nodeByName('aura').hover();
		await aura.canvas.nodeByName('aura').getByTestId('overflow-node-button').click();
		await aura.page.getByTestId('context-menu-item-open').click();

		await expect(aura.ndv.getNodesWithIssues()).toHaveCount(1);
	});

	test.skip('should open and close the about modal on keyboard shortcut', async ({ aura }) => {
		await aura.sideBar.openAboutModalViaShortcut();
		await expect(aura.sideBar.getAboutModal()).toBeVisible();
		await aura.sideBar.closeAboutModal();
	});
});
