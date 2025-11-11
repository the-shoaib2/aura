import { test, expect } from '../../fixtures/base';

const SCHEDULE_TRIGGER_NODE_NAME = 'Schedule Trigger';

test.describe('Workflow Production Checklist', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();
	});

	test('should show suggested actions automatically when workflow is first activated', async ({
		aura,
	}) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();

		await expect(aura.canvas.getProductionChecklistButton()).toBeHidden();

		await aura.canvas.activateWorkflow();

		await expect(aura.workflowActivationModal.getModal()).toBeVisible();
		await aura.workflowActivationModal.close();

		await expect(aura.canvas.getProductionChecklistButton()).toBeVisible();
		await expect(aura.canvas.getProductionChecklistPopover()).toBeVisible();
		await expect(aura.canvas.getProductionChecklistActionItem()).toHaveCount(2);
		await expect(aura.canvas.getErrorActionItem()).toBeVisible();
		await expect(aura.canvas.getTimeSavedActionItem()).toBeVisible();
	});

	test('should display evaluations action when AI node exists and feature is enabled', async ({
		aura,
	}) => {
		await aura.api.enableFeature('evaluation');

		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.addNode('OpenAI', { action: 'Message a model', closeNDV: true });

		await aura.canvas.nodeDisableButton('Message a model').click();

		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();
		await expect(aura.workflowActivationModal.getModal()).toBeVisible();
		await aura.workflowActivationModal.close();

		await expect(aura.canvas.getProductionChecklistPopover()).toBeVisible();
		await expect(aura.canvas.getProductionChecklistActionItem()).toHaveCount(3);

		await expect(aura.canvas.getEvaluationsActionItem()).toBeVisible();
		await aura.canvas.getEvaluationsActionItem().click();

		await expect(aura.page).toHaveURL(/\/evaluation/);
	});

	test('should open workflow settings modal when error workflow action is clicked', async ({
		aura,
	}) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();
		await expect(aura.workflowActivationModal.getModal()).toBeVisible();
		await aura.workflowActivationModal.close();

		await expect(aura.canvas.getProductionChecklistPopover()).toBeVisible();

		const errorAction = aura.canvas.getErrorActionItem();
		await expect(errorAction).toBeVisible();
		await errorAction.click();

		await expect(aura.page.getByTestId('workflow-settings-dialog')).toBeVisible();
		await expect(aura.page.getByTestId('workflow-settings-error-workflow')).toBeVisible();
	});

	test('should open workflow settings modal when time saved action is clicked', async ({
		aura,
	}) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();
		await expect(aura.workflowActivationModal.getModal()).toBeVisible();
		await aura.workflowActivationModal.close();

		await expect(aura.canvas.getProductionChecklistPopover()).toBeVisible();

		const timeAction = aura.canvas.getTimeSavedActionItem();
		await expect(timeAction).toBeVisible();
		await timeAction.click();

		await expect(aura.page.getByTestId('workflow-settings-dialog')).toBeVisible();
	});

	test('should allow ignoring individual actions', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();
		await expect(aura.workflowActivationModal.getModal()).toBeVisible();
		await aura.workflowActivationModal.close();

		await expect(aura.canvas.getProductionChecklistPopover()).toBeVisible();

		await expect(aura.canvas.getProductionChecklistActionItem().first()).toContainText('error');
		await aura.canvas.getProductionChecklistActionItem().first().getByTitle('Ignore').click();
		await expect(aura.canvas.getErrorActionItem()).toBeHidden();

		await aura.page.locator('body').click({ position: { x: 0, y: 0 } });
		await aura.canvas.clickProductionChecklistButton();

		await expect(aura.canvas.getErrorActionItem()).toBeHidden();
		await expect(aura.canvas.getTimeSavedActionItem()).toBeVisible();
	});

	test('should show completed state for configured actions', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();
		await expect(aura.workflowActivationModal.getModal()).toBeVisible();
		await aura.workflowActivationModal.close();

		await aura.workflowSettingsModal.open();
		await expect(aura.workflowSettingsModal.getModal()).toBeVisible();

		await aura.workflowSettingsModal.selectErrorWorkflow('My workflow');
		await aura.workflowSettingsModal.clickSave();
		await expect(aura.page.getByTestId('workflow-settings-dialog')).toBeHidden();

		await aura.canvas.clickProductionChecklistButton();
		await expect(aura.canvas.getProductionChecklistPopover()).toBeVisible();

		await expect(
			aura.canvas
				.getProductionChecklistActionItem()
				.first()
				.locator('svg[data-icon="circle-check"]'),
		).toBeVisible();
	});

	test('should allow ignoring all actions with confirmation', async ({ aura }) => {
		await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });
		await aura.canvas.saveWorkflow();
		await aura.canvas.activateWorkflow();
		await expect(aura.workflowActivationModal.getModal()).toBeVisible();
		await aura.workflowActivationModal.close();

		await expect(aura.canvas.getProductionChecklistPopover()).toBeVisible();

		await aura.canvas.clickProductionChecklistIgnoreAll();

		await expect(aura.page.locator('.el-message-box')).toBeVisible();
		await aura.page
			.locator('.el-message-box__btns button')
			.filter({ hasText: /ignore for all workflows/i })
			.click();

		await expect(aura.canvas.getProductionChecklistButton()).toBeHidden();
	});
});
