import { test, expect } from '../../fixtures/base';

const WORKFLOW_FILE = 'Subworkflow-debugging-execute-workflow.json';

test.describe('Subworkflow debugging', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromImportedWorkflow(WORKFLOW_FILE);

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(11);
		await aura.canvas.clickZoomToFitButton();

		await aura.canvas.clickExecuteWorkflowButton();
	});

	test.describe('can inspect sub executed workflow', () => {
		test('(Run once with all items/ Wait for Sub-workflow completion) (default behavior)', async ({
			aura,
		}) => {
			await aura.canvas.openNode('Execute Workflow with param');

			await expect(aura.ndv.outputPanel.getItemsCount()).toContainText('2 items, 1 sub-execution');
			await expect(aura.ndv.outputPanel.getRelatedExecutionLink()).toContainText(
				'View sub-execution',
			);
			await expect(aura.ndv.outputPanel.getRelatedExecutionLink()).toHaveAttribute('href', /.+/);

			await expect(aura.ndv.outputPanel.getTableHeaders()).toHaveCount(2);
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toHaveText('world Natalie Moore');
		});

		test('(Run once for each item/ Wait for Sub-workflow completion) param1', async ({ aura }) => {
			await aura.canvas.openNode('Execute Workflow with param1');

			await expect(aura.ndv.outputPanel.getItemsCount()).toContainText('2 items, 2 sub-execution');
			await expect(aura.ndv.outputPanel.getRelatedExecutionLink()).not.toBeAttached();

			await expect(aura.ndv.outputPanel.getTableHeaders()).toHaveCount(3);
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0).locator('a')).toHaveAttribute(
				'href',
				/.+/,
			);
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 1)).toHaveText('world Natalie Moore');
		});

		test('(Run once with all items/ Wait for Sub-workflow completion) param2', async ({ aura }) => {
			await aura.canvas.openNode('Execute Workflow with param2');

			await expect(aura.ndv.outputPanel.getItemsCount()).not.toBeAttached();
			await expect(aura.ndv.outputPanel.getRelatedExecutionLink()).toContainText(
				'View sub-execution',
			);
			await expect(aura.ndv.outputPanel.getRelatedExecutionLink()).toHaveAttribute('href', /.+/);

			await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue(
				'2 of 2 (3 items, 1 sub-execution)',
			);
			await expect(aura.ndv.outputPanel.getTableHeaders()).toHaveCount(6);
			await expect(aura.ndv.outputPanel.getTableHeader(0)).toHaveText('uid');
			await expect(aura.ndv.outputPanel.getTableRows()).toHaveCount(4);
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 1)).toContainText('Jon_Ebert@yahoo.com');

			await aura.ndv.changeOutputRunSelector('1 of 2 (2 items, 1 sub-execution)');
			await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue(
				'1 of 2 (2 items, 1 sub-execution)',
			);
			await expect(aura.ndv.outputPanel.getTableHeaders()).toHaveCount(6);
			await expect(aura.ndv.outputPanel.getTableHeader(0)).toHaveText('uid');
			await expect(aura.ndv.outputPanel.getTableRows()).toHaveCount(3);
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 1)).toContainText('Terry.Dach@hotmail.com');
		});

		test('(Run once for each item/ Wait for Sub-workflow completion) param3', async ({ aura }) => {
			await aura.canvas.openNode('Execute Workflow with param3');

			await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue(
				'2 of 2 (3 items, 3 sub-executions)',
			);
			await expect(aura.ndv.outputPanel.getTableHeaders()).toHaveCount(7);
			await expect(aura.ndv.outputPanel.getTableHeader(1)).toHaveText('uid');
			await expect(aura.ndv.outputPanel.getTableRows()).toHaveCount(4);
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0).locator('a')).toHaveAttribute(
				'href',
				/.+/,
			);
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 2)).toContainText('Jon_Ebert@yahoo.com');

			await aura.ndv.changeOutputRunSelector('1 of 2 (2 items, 2 sub-executions)');
			await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue(
				'1 of 2 (2 items, 2 sub-executions)',
			);
			await expect(aura.ndv.outputPanel.getTableHeaders()).toHaveCount(7);
			await expect(aura.ndv.outputPanel.getTableHeader(1)).toHaveText('uid');
			await expect(aura.ndv.outputPanel.getTableRows()).toHaveCount(3);

			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0).locator('a')).toHaveAttribute(
				'href',
				/.+/,
			);
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 2)).toContainText('Terry.Dach@hotmail.com');
		});
	});
});
