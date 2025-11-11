import { IF_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';

const FILTER_PARAM_NAME = 'conditions';

test.describe('If Node (filter component)', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should be able to create and delete multiple conditions', async ({ aura }) => {
		await aura.canvas.addNode(IF_NODE_NAME, { closeNDV: false });

		// Default state
		await expect(aura.ndv.getFilterComponent(FILTER_PARAM_NAME)).toBeVisible();
		await expect(aura.ndv.getFilterConditions(FILTER_PARAM_NAME)).toHaveCount(1);
		await expect(
			aura.ndv.getFilterConditionOperator(FILTER_PARAM_NAME).locator('input'),
		).toHaveValue('is equal to');

		// Add
		await aura.ndv.addFilterCondition(FILTER_PARAM_NAME);
		await aura.ndv.getFilterConditionLeft(FILTER_PARAM_NAME, 0).locator('input').fill('first left');
		await aura.ndv
			.getFilterConditionLeft(FILTER_PARAM_NAME, 1)
			.locator('input')
			.fill('second left');
		await aura.ndv.addFilterCondition(FILTER_PARAM_NAME);
		await expect(aura.ndv.getFilterConditions(FILTER_PARAM_NAME)).toHaveCount(3);

		// Delete
		await aura.ndv.removeFilterCondition(FILTER_PARAM_NAME, 0);
		await expect(aura.ndv.getFilterConditions(FILTER_PARAM_NAME)).toHaveCount(2);
		await expect(
			aura.ndv.getFilterConditionLeft(FILTER_PARAM_NAME, 0).locator('input'),
		).toHaveValue('second left');
		await aura.ndv.removeFilterCondition(FILTER_PARAM_NAME, 1);
		await expect(aura.ndv.getFilterConditions(FILTER_PARAM_NAME)).toHaveCount(1);
	});

	test('should correctly evaluate conditions', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_filter.json');

		await aura.canvas.clickExecuteWorkflowButton();

		await aura.canvas.openNode('Then');
		await expect(aura.ndv.outputPanel.get()).toContainText('3 items');
		await aura.ndv.close();

		await aura.canvas.openNode('Else');
		await expect(aura.ndv.outputPanel.get()).toContainText('1 item');
	});
});
