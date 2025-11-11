import fs from 'fs';

import {
	CODE_NODE_NAME,
	EDIT_FIELDS_SET_NODE_NAME,
	MANUAL_TRIGGER_NODE_NAME,
	NOTION_NODE_NAME,
	SCHEDULE_TRIGGER_NODE_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';
import { resolveFromRoot } from '../../utils/path-helper';

test.describe('Workflow Actions', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should be able to save on button click', async ({ aura }) => {
		const saveButton = aura.canvas.getWorkflowSaveButton();

		await expect(saveButton).toContainText('Save');

		await aura.canvas.saveWorkflow();

		await expect(saveButton).toContainText('Saved');

		const tagName = await saveButton.evaluate((el) => el.tagName);
		expect(tagName).toBe('SPAN');

		await expect(aura.page).not.toHaveURL(/\/workflow\/new$/);
		await expect(aura.page).toHaveURL(/\/workflow\/[a-zA-Z0-9]+$/);
	});

	test('should save workflow on keyboard shortcut', async ({ aura }) => {
		const saveButton = aura.canvas.getWorkflowSaveButton();

		await aura.canvas.deselectAll();

		await aura.canvas.hitSaveWorkflow();

		await expect(saveButton).toContainText('Saved');

		const tagName = await saveButton.evaluate((el) => el.tagName);
		expect(tagName).toBe('SPAN');
	});

	test('should not save already saved workflow', async ({ aura }) => {
		const patchRequests: string[] = [];
		aura.page.on('request', (request) => {
			if (request.method() === 'PATCH' && request.url().includes('/rest/workflows/')) {
				patchRequests.push(request.url());
			}
		});

		const saveButton = aura.canvas.getWorkflowSaveButton();
		await expect(saveButton).toContainText('Save');
		await aura.canvas.saveWorkflow();
		await expect(saveButton).toContainText('Saved');

		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);

		const patchPromise = aura.page.waitForRequest(
			(req) => req.method() === 'PATCH' && req.url().includes('/rest/workflows/'),
		);
		await aura.canvas.saveWorkflow();
		await patchPromise;
		await expect(saveButton).toContainText('Saved');

		expect(await saveButton.evaluate((el) => el.tagName)).toBe('SPAN');

		await aura.canvas.hitSaveWorkflow();
		await aura.canvas.hitSaveWorkflow();

		expect(patchRequests).toHaveLength(1);
	});

	test('should not be able to activate unsaved workflow', async ({ aura }) => {
		await expect(aura.canvas.getWorkflowActivatorSwitch().locator('input').first()).toBeDisabled();
	});

	test('should not be able to activate workflow without trigger node', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.saveWorkflow();

		await expect(aura.canvas.getWorkflowActivatorSwitch().locator('input').first()).toBeDisabled();
	});

	test('should be able to activate workflow', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();

		await expect(aura.canvas.getWorkflowActivatorSwitch()).toHaveClass(/is-checked/);
	});

	test('should not be able to activate workflow when nodes have errors', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(NOTION_NODE_NAME, { action: 'Append a block', closeNDV: true });
		await aura.canvas.saveWorkflow();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();

		await aura.canvas.getWorkflowActivatorSwitch().click();

		await expect(aura.notifications.getErrorNotifications().first()).toBeVisible();
	});

	test('should be able to activate workflow when nodes with errors are disabled', async ({
		aura,
	}) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(NOTION_NODE_NAME, { action: 'Append a block', closeNDV: true });
		await aura.canvas.saveWorkflow();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();

		await aura.canvas.getWorkflowActivatorSwitch().click();

		await expect(aura.notifications.getErrorNotifications().first()).toBeVisible();

		const nodeName = await aura.canvas.getCanvasNodes().last().getAttribute('data-node-name');
		await aura.canvas.toggleNodeEnabled(nodeName!);

		await aura.canvas.activateWorkflow();

		await expect(aura.canvas.getWorkflowActivatorSwitch()).toHaveClass(/is-checked/);
	});

	test('should save new workflow after renaming', async ({ aura }) => {
		await aura.canvas.setWorkflowName('Something else');
		await aura.canvas.getWorkflowNameInput().press('Enter');

		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
	});

	test('should rename workflow', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();

		await aura.canvas.setWorkflowName('Something else');
		await aura.canvas.getWorkflowNameInput().press('Enter');

		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
		await expect(aura.canvas.getWorkflowName()).toHaveAttribute('title', 'Something else');
	});

	test('should not save workflow if canvas is loading', async ({ aura }) => {
		let patchCount = 0;

		aura.page.on('request', (req) => {
			if (req.method() === 'PATCH' && req.url().includes('/rest/workflows/')) {
				patchCount++;
			}
		});

		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.saveWorkflow();

		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
		const workflowId = aura.canvas.getWorkflowIdFromUrl();

		await aura.canvasComposer.delayWorkflowLoad(workflowId);

		await aura.page.reload();
		await expect(aura.canvas.getLoadingMask()).toBeVisible();

		await aura.canvas.hitSaveWorkflow();
		await aura.canvas.hitSaveWorkflow();
		await aura.canvas.hitSaveWorkflow();

		expect(patchCount).toBe(0);

		await expect(aura.page.getByTestId('node-view-loader')).not.toBeAttached();
		await expect(aura.canvas.getLoadingMask()).not.toBeAttached();
		await aura.canvasComposer.undelayWorkflowLoad(workflowId);

		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });

		const patchPromise = aura.page.waitForRequest(
			(req) => req.method() === 'PATCH' && req.url().includes('/rest/workflows/'),
		);
		await aura.canvas.hitSaveWorkflow();
		await patchPromise;

		expect(patchCount).toBe(1);
	});

	test('should not save workflow twice when save is in progress', async ({ aura }) => {
		const oldName = await aura.canvas.getWorkflowNameInput().inputValue();

		await aura.canvas.getWorkflowName().click();
		await aura.canvas.getWorkflowNameInput().press('ControlOrMeta+a');
		await aura.canvas.getWorkflowNameInput().pressSequentially('Test');
		await aura.canvas.getWorkflowSaveButton().click();

		await expect(aura.canvas.getWorkflowNameInput()).toHaveValue('Test');

		await aura.navigate.toHome();

		await expect(aura.workflows.cards.getWorkflow(oldName)).toBeHidden();
	});

	test('should copy nodes', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);

		await expect(aura.canvas.nodeCreator.getRoot()).not.toBeAttached();

		await aura.clipboard.grant();

		await aura.canvas.selectAll();
		await aura.canvas.copyNodes();

		await aura.notifications.waitForNotificationAndClose('Copied to clipboard');
		const clipboardText = await aura.clipboard.readText();
		const copiedWorkflow = JSON.parse(clipboardText);

		expect(copiedWorkflow.nodes).toHaveLength(2);
	});

	test('should paste nodes (both current and old node versions)', async ({ aura }) => {
		const workflowJson = fs.readFileSync(
			resolveFromRoot('workflows', 'Test_workflow-actions_paste-data.json'),
			'utf-8',
		);

		await aura.canvas.canvasPane().click();
		await aura.clipboard.paste(workflowJson);
		await aura.canvas.clickZoomToFitButton();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(5);
		await expect(aura.canvas.nodeConnections()).toHaveCount(5);
	});

	test('should allow importing nodes without names', async ({ aura }) => {
		const workflowJson = fs.readFileSync(
			resolveFromRoot('workflows', 'Test_workflow-actions_import_nodes_empty_name.json'),
			'utf-8',
		);

		await aura.canvas.canvasPane().click();
		await aura.clipboard.paste(workflowJson);
		await aura.canvas.clickZoomToFitButton();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		await expect(aura.canvas.nodeConnections()).toHaveCount(2);

		const nodes = aura.canvas.getCanvasNodes();
		const count = await nodes.count();
		for (let i = 0; i < count; i++) {
			await expect(nodes.nth(i)).toHaveAttribute('data-node-name');
		}
	});

	test('should update workflow settings', async ({ aura }) => {
		await aura.navigate.toHome();

		const workflowsResponsePromise = aura.page.waitForResponse(
			(response) =>
				response.url().includes('/rest/workflows') && response.request().method() === 'GET',
		);

		await aura.workflows.addResource.workflow();

		const workflowsResponse = await workflowsResponsePromise;
		const responseBody = await workflowsResponse.json();
		const totalWorkflows = responseBody.count;

		await aura.canvas.saveWorkflow();

		await aura.workflowSettingsModal.open();
		await expect(aura.workflowSettingsModal.getModal()).toBeVisible();

		await aura.workflowSettingsModal.getErrorWorkflowField().click();
		await expect(aura.page.getByRole('option')).toHaveCount(totalWorkflows + 2);
		await aura.page.getByRole('option').last().click();

		await aura.workflowSettingsModal.getTimezoneField().click();
		await expect(aura.page.getByRole('option').first()).toBeVisible();
		await aura.page.getByRole('option').nth(1).click();

		await aura.workflowSettingsModal.getSaveFailedExecutionsField().click();
		await expect(aura.page.getByRole('option')).toHaveCount(3);
		await aura.page.getByRole('option').last().click();

		await aura.workflowSettingsModal.getSaveSuccessExecutionsField().click();
		await expect(aura.page.getByRole('option')).toHaveCount(3);
		await aura.page.getByRole('option').last().click();

		await aura.workflowSettingsModal.getSaveManualExecutionsField().click();
		await expect(aura.page.getByRole('option')).toHaveCount(3);
		await aura.page.getByRole('option').last().click();

		await aura.workflowSettingsModal.getSaveExecutionProgressField().click();
		await expect(aura.page.getByRole('option')).toHaveCount(3);
		await aura.page.getByRole('option').last().click();

		await aura.workflowSettingsModal.getTimeoutSwitch().click();
		await aura.workflowSettingsModal.getTimeoutInput().fill('1');

		await aura.workflowSettingsModal.clickSave();

		await expect(aura.workflowSettingsModal.getModal()).toBeHidden();
		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
	});

	test('should not be able to archive or delete unsaved workflow', async ({ aura }) => {
		await expect(aura.workflowSettingsModal.getWorkflowMenu()).toBeVisible();
		await aura.workflowSettingsModal.getWorkflowMenu().click();

		await expect(aura.workflowSettingsModal.getDeleteMenuItem()).toBeHidden();
		await expect(aura.workflowSettingsModal.getArchiveMenuItem().locator('..')).toHaveClass(
			/is-disabled/,
		);
	});

	test('should archive nonactive workflow and then delete it', async ({ aura }) => {
		await aura.canvas.saveWorkflow();
		await expect(aura.canvas.getArchivedTag()).not.toBeAttached();

		await expect(aura.workflowSettingsModal.getWorkflowMenu()).toBeVisible();
		await aura.workflowSettingsModal.getWorkflowMenu().click();
		await aura.workflowSettingsModal.clickArchiveMenuItem();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
		await expect(aura.page).toHaveURL(/\/workflows$/);

		await aura.page.goBack();

		await expect(aura.canvas.getArchivedTag()).toBeVisible();
		await expect(aura.canvas.getNodeCreatorPlusButton()).not.toBeAttached();

		await expect(aura.workflowSettingsModal.getWorkflowMenu()).toBeVisible();
		await aura.workflowSettingsModal.getWorkflowMenu().click();
		await aura.workflowSettingsModal.clickDeleteMenuItem();
		await aura.workflowSettingsModal.confirmDeleteModal();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
		await expect(aura.page).toHaveURL(/\/workflows$/);
	});

	test('should archive active workflow and then delete it', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();
		await aura.page.keyboard.press('Escape');

		await expect(aura.canvas.getWorkflowActivatorSwitch()).toHaveClass(/is-checked/);
		await expect(aura.canvas.getArchivedTag()).not.toBeAttached();

		await expect(aura.workflowSettingsModal.getWorkflowMenu()).toBeVisible();
		await aura.workflowSettingsModal.getWorkflowMenu().click();
		await aura.workflowSettingsModal.clickArchiveMenuItem();
		await aura.workflowSettingsModal.confirmArchiveModal();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
		await expect(aura.page).toHaveURL(/\/workflows$/);

		await aura.page.goBack();

		await expect(aura.canvas.getArchivedTag()).toBeVisible();
		await expect(aura.canvas.getNodeCreatorPlusButton()).not.toBeAttached();
		await expect(aura.canvas.getWorkflowActivatorSwitch()).not.toHaveClass(/is-checked/);

		await expect(aura.workflowSettingsModal.getWorkflowMenu()).toBeVisible();
		await aura.workflowSettingsModal.getWorkflowMenu().click();
		await aura.workflowSettingsModal.clickDeleteMenuItem();
		await aura.workflowSettingsModal.confirmDeleteModal();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
		await expect(aura.page).toHaveURL(/\/workflows$/);
	});

	test('should archive nonactive workflow and then unarchive it', async ({ aura }) => {
		await aura.canvas.saveWorkflow();
		await expect(aura.canvas.getArchivedTag()).not.toBeAttached();

		await expect(aura.workflowSettingsModal.getWorkflowMenu()).toBeVisible();
		await aura.workflowSettingsModal.getWorkflowMenu().click();
		await aura.workflowSettingsModal.clickArchiveMenuItem();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
		await expect(aura.page).toHaveURL(/\/workflows$/);

		await aura.page.goBack();

		await expect(aura.canvas.getArchivedTag()).toBeVisible();
		await expect(aura.canvas.getNodeCreatorPlusButton()).not.toBeAttached();

		await expect(aura.workflowSettingsModal.getWorkflowMenu()).toBeVisible();
		await aura.workflowSettingsModal.getWorkflowMenu().click();
		await aura.workflowSettingsModal.clickUnarchiveMenuItem();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
		await expect(aura.canvas.getArchivedTag()).not.toBeAttached();
		await expect(aura.canvas.getNodeCreatorPlusButton()).toBeVisible();
	});

	test('should deactivate active workflow on archive', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();
		await aura.page.keyboard.press('Escape');

		await expect(aura.canvas.getWorkflowActivatorSwitch()).toHaveClass(/is-checked/);

		await aura.workflowSettingsModal.getWorkflowMenu().click();
		await aura.workflowSettingsModal.clickArchiveMenuItem();
		await aura.workflowSettingsModal.confirmArchiveModal();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
		await expect(aura.page).toHaveURL(/\/workflows$/);

		await aura.page.goBack();

		await expect(aura.canvas.getArchivedTag()).toBeVisible();
		await expect(aura.canvas.getWorkflowActivatorSwitch()).not.toHaveClass(/is-checked/);
		await expect(aura.canvas.getWorkflowActivatorSwitch().locator('input').first()).toBeDisabled();

		await expect(aura.workflowSettingsModal.getWorkflowMenu()).toBeVisible();
		await aura.workflowSettingsModal.getWorkflowMenu().click();
		await aura.workflowSettingsModal.clickUnarchiveMenuItem();

		await expect(aura.notifications.getSuccessNotifications().first()).toBeVisible();
		await expect(aura.canvas.getArchivedTag()).not.toBeAttached();

		await aura.canvas.activateWorkflow();
		await aura.page.keyboard.press('Escape');

		await expect(aura.canvas.getWorkflowActivatorSwitch()).toHaveClass(/is-checked/);
	});

	test.describe('duplicate workflow', () => {
		const DUPLICATE_WORKFLOW_NAME = 'Duplicated workflow';
		const DUPLICATE_WORKFLOW_TAG = 'Duplicate';

		test.beforeEach(async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		});

		test('should duplicate unsaved workflow', async ({ aura }) => {
			await aura.workflowComposer.duplicateWorkflow(
				DUPLICATE_WORKFLOW_NAME,
				DUPLICATE_WORKFLOW_TAG,
			);

			await expect(aura.notifications.getErrorNotifications()).toHaveCount(0);
		});

		test('should duplicate saved workflow', async ({ aura }) => {
			await aura.canvas.saveWorkflow();
			await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');

			await aura.workflowComposer.duplicateWorkflow(
				DUPLICATE_WORKFLOW_NAME,
				DUPLICATE_WORKFLOW_TAG,
			);

			await expect(aura.notifications.getErrorNotifications()).toHaveCount(0);
		});
	});

	test('should keep endpoint click working when switching between execution and editor tab', async ({
		aura,
	}) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();

		await aura.canvas.clickNodePlusEndpoint('Edit Fields');
		await expect(aura.canvas.nodeCreatorSearchBar()).toBeVisible();
		await aura.page.keyboard.press('Escape');

		const executionsResponsePromise = aura.page.waitForResponse((response) =>
			response.url().includes('/rest/executions?filter='),
		);
		await aura.canvas.clickExecutionsTab();
		await executionsResponsePromise;

		await aura.canvas.clickEditorTab();

		await aura.canvas.clickNodePlusEndpoint('Edit Fields');
		await expect(aura.canvas.nodeCreatorSearchBar()).toBeVisible();
	});

	test('should run workflow on button click', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.saveWorkflow();

		await aura.canvas.clickExecuteWorkflowButton();
		await expect(
			aura.notifications.getNotificationByTitle('Workflow executed successfully'),
		).toBeVisible();
	});

	test('should run workflow using keyboard shortcut', async ({ aura }) => {
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.saveWorkflow();

		await aura.canvas.hitExecuteWorkflow();
		await expect(
			aura.notifications.getNotificationByTitle('Workflow executed successfully'),
		).toBeVisible();
	});

	test('should not run empty workflows', async ({ aura }) => {
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);

		await expect(aura.canvas.getExecuteWorkflowButton()).not.toBeAttached();

		await aura.canvas.hitExecuteWorkflow();
		await expect(aura.notifications.getSuccessNotifications()).toHaveCount(0);
	});

	test.describe('Menu entry Push To Git', () => {
		test('should not show up in the menu for members @auth:member', async ({ aura }) => {
			await aura.workflowSettingsModal.getWorkflowMenu().click();
			await expect(aura.workflowSettingsModal.getPushToGitMenuItem()).not.toBeAttached();
		});

		test('should show up for owners @auth:owner', async ({ aura }) => {
			await aura.workflowSettingsModal.getWorkflowMenu().click();
			await expect(aura.workflowSettingsModal.getPushToGitMenuItem()).toBeVisible();
		});
	});
});
