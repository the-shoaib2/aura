import { test, expect } from '../../fixtures/base';

test.describe('NDV Paired Items', () => {
	test('maps paired input and output items', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_5.json');
		await aura.canvas.clickZoomToFitButton();

		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);

		await aura.canvas.openNode('Sort');

		await expect(aura.ndv.inputPanel.get()).toContainText('6 items');
		await expect(aura.ndv.outputPanel.get()).toContainText('6 items');

		await aura.ndv.inputPanel.switchDisplayMode('table');
		await aura.ndv.outputPanel.switchDisplayMode('table');

		// input to output
		const inputTableRow1 = aura.ndv.inputPanel.getTableRow(1);
		await expect(inputTableRow1).toBeVisible();
		await expect(inputTableRow1).toHaveAttribute('data-test-id', 'hovering-item');

		// Move the cursor to simulate hover behavior
		await inputTableRow1.hover();
		await expect(aura.ndv.outputPanel.getTableRow(4)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await aura.ndv.inputPanel.getTableRow(2).hover();
		await expect(aura.ndv.outputPanel.getTableRow(2)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await aura.ndv.inputPanel.getTableRow(3).hover();
		await expect(aura.ndv.outputPanel.getTableRow(6)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		// output to input
		await aura.ndv.outputPanel.getTableRow(1).hover();
		await expect(aura.ndv.inputPanel.getTableRow(4)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await aura.ndv.outputPanel.getTableRow(4).hover();
		await expect(aura.ndv.inputPanel.getTableRow(1)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await aura.ndv.outputPanel.getTableRow(2).hover();
		await expect(aura.ndv.inputPanel.getTableRow(2)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await aura.ndv.outputPanel.getTableRow(6).hover();
		await expect(aura.ndv.inputPanel.getTableRow(3)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await aura.ndv.outputPanel.getTableRow(1).hover();
		await expect(aura.ndv.inputPanel.getTableRow(4)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);
	});

	test('maps paired input and output items based on selected input node', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_5.json');
		await aura.canvas.clickZoomToFitButton();
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);
		await aura.canvas.openNode('Set2');

		await expect(aura.ndv.inputPanel.get()).toContainText('6 items');
		await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue('2 of 2 (6 items)');

		await aura.ndv.inputPanel.switchDisplayMode('table');
		await aura.ndv.outputPanel.switchDisplayMode('table');

		// Default hover state should have first item from input node highlighted
		const hoveringItem = aura.page.locator('[data-test-id="hovering-item"]');
		await expect(hoveringItem).toContainText('1111');
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('1111');

		// Select different input node and check that the hover state is updated
		await aura.ndv.inputPanel.getNodeInputOptions().click();
		await aura.page.getByRole('option', { name: 'Set1' }).click();
		await expect(hoveringItem).toContainText('1000');

		// Hover on input item and verify output hover state
		await aura.ndv.inputPanel.getTable().locator('text=1000').hover();
		await expect(
			aura.ndv.outputPanel.get().locator('[data-test-id="hovering-item"]'),
		).toContainText('1000');
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('1000');

		// Switch back to Sort input
		await aura.ndv.inputPanel.getNodeInputOptions().click();
		await aura.page.getByRole('option', { name: 'Sort' }).click();
		await aura.ndv.changeOutputRunSelector('1 of 2 (6 items)');

		await expect(hoveringItem).toContainText('1111');
		await aura.ndv.inputPanel.getTable().locator('text=1111').hover();
		await expect(
			aura.ndv.outputPanel.get().locator('[data-test-id="hovering-item"]'),
		).toContainText('1111');
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('1111');
	});

	test('maps paired input and output items based on selected run', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_5.json');
		await aura.canvas.clickZoomToFitButton();
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);
		await aura.canvas.openNode('Set3');

		await aura.ndv.inputPanel.switchDisplayMode('table');
		await aura.ndv.outputPanel.switchDisplayMode('table');

		// Start from linked state
		await aura.ndv.ensureOutputRunLinking(true);
		await aura.ndv.inputPanel.getTbodyCell(0, 0).click(); // remove tooltip

		await expect(aura.ndv.inputPanel.getRunSelectorInput()).toHaveValue('2 of 2 (6 items)');
		await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue('2 of 2 (6 items)');

		await aura.ndv.changeOutputRunSelector('1 of 2 (6 items)');
		await expect(aura.ndv.inputPanel.getRunSelectorInput()).toHaveValue('1 of 2 (6 items)');
		await expect(aura.ndv.outputPanel.getRunSelectorInput()).toHaveValue('1 of 2 (6 items)');

		await expect(aura.ndv.inputPanel.getTableRow(1)).toContainText('1111');
		await expect(aura.ndv.inputPanel.getTableRow(1)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await expect(aura.ndv.outputPanel.getTableRow(1)).toContainText('1111');
		await aura.ndv.outputPanel.getTableRow(1).hover();

		await expect(aura.ndv.outputPanel.getTableRow(3)).toContainText('4444');
		await aura.ndv.outputPanel.getTableRow(3).hover();

		await expect(aura.ndv.inputPanel.getTableRow(3)).toContainText('4444');
		await expect(aura.ndv.inputPanel.getTableRow(3)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await aura.ndv.changeOutputRunSelector('2 of 2 (6 items)');

		await expect(aura.ndv.inputPanel.getTableRow(1)).toContainText('1000');
		await aura.ndv.inputPanel.getTableRow(1).hover();

		await expect(aura.ndv.outputPanel.getTableRow(1)).toContainText('1000');
		await expect(aura.ndv.outputPanel.getTableRow(1)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await expect(aura.ndv.outputPanel.getTableRow(3)).toContainText('2000');
		await aura.ndv.outputPanel.getTableRow(3).hover();

		await expect(aura.ndv.inputPanel.getTableRow(3)).toContainText('2000');
		await expect(aura.ndv.inputPanel.getTableRow(3)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);
	});

	test('can pair items between input and output across branches and runs', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_5.json');
		await aura.canvas.clickZoomToFitButton();
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);
		await aura.canvas.openNode('IF');

		await aura.ndv.inputPanel.switchDisplayMode('table');
		await aura.ndv.outputPanel.switchDisplayMode('table');

		// Switch to False Branch
		await aura.ndv.outputPanel.get().getByText('False Branch (2 items)').click();
		await expect(aura.ndv.outputPanel.getTableRow(1)).toContainText('8888');
		await aura.ndv.outputPanel.getTableRow(1).hover();

		await expect(aura.ndv.inputPanel.getTableRow(5)).toContainText('8888');
		await expect(aura.ndv.inputPanel.getTableRow(5)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await expect(aura.ndv.outputPanel.getTableRow(2)).toContainText('9999');
		await aura.ndv.outputPanel.getTableRow(2).hover();

		await expect(aura.ndv.inputPanel.getTableRow(6)).toContainText('9999');
		await expect(aura.ndv.inputPanel.getTableRow(6)).toHaveAttribute(
			'data-test-id',
			'hovering-item',
		);

		await aura.ndv.close();

		await aura.canvas.openNode('Set5');

		// Switch to True Branch for input
		await aura.ndv.inputPanel.get().getByText('True Branch').click();

		await aura.ndv.changeOutputRunSelector('(2 items)');
		await expect(aura.ndv.outputPanel.getTableRow(1)).toContainText('8888');
		await aura.ndv.outputPanel.getTableRow(1).hover();

		// Should not have matching hover state when branches don't match
		const hoveringItems = aura.ndv.inputPanel.get().locator('[data-test-id="hovering-item"]');
		await expect(hoveringItems).toHaveCount(0);

		await expect(aura.ndv.inputPanel.getTableRow(1)).toContainText('1111');
		await aura.ndv.inputPanel.getTableRow(1).hover();
		const outputHoveringItems = aura.ndv.outputPanel
			.get()
			.locator('[data-test-id="hovering-item"]');
		await expect(outputHoveringItems).toHaveCount(0);

		// Switch to False Branch
		await aura.ndv.inputPanel.get().getByText('False Branch').click();
		await expect(aura.ndv.inputPanel.getTableRow(1)).toContainText('8888');
		await aura.ndv.inputPanel.getTableRow(1).hover();

		await aura.ndv.changeOutputRunSelector('(4 items)');
		await expect(aura.ndv.outputPanel.getTableRow(1)).toContainText('1111');
		await aura.ndv.outputPanel.getTableRow(1).hover();

		await aura.ndv.changeOutputRunSelector('(2 items)');
		await expect(aura.ndv.inputPanel.getTableRow(1)).toContainText('8888');
		await aura.ndv.inputPanel.getTableRow(1).hover();
		await expect(
			aura.ndv.outputPanel.get().locator('[data-test-id="hovering-item"]'),
		).toContainText('8888');
	});

	test('can resolve expression with paired item in multi-input node', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('expression_with_paired_item_in_multi_input_node.json');

		await aura.canvas.clickZoomToFitButton();

		const PINNED_DATA = [
			{
				id: 'abc',
				historyId: 'def',
				messages: [
					{
						id: 'abc',
					},
				],
			},
			{
				id: 'abc',
				historyId: 'def',
				messages: [
					{
						id: 'abc',
					},
					{
						id: 'abc',
					},
					{
						id: 'abc',
					},
				],
			},
			{
				id: 'abc',
				historyId: 'def',
				messages: [
					{
						id: 'abc',
					},
				],
			},
		];

		await aura.canvas.openNode('Get thread details1');
		await aura.ndv.setPinnedData(PINNED_DATA);
		await aura.ndv.close();

		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);
		await aura.canvas.openNode('Switch1');
		await aura.ndv.execute();

		await expect(aura.ndv.getParameterExpressionPreviewOutput()).toContainText('1');

		await aura.ndv.getInlineExpressionEditorInput().click();
		await expect(aura.ndv.getInlineExpressionEditorPreview()).toContainText('1');

		// Select next item
		await aura.ndv.expressionSelectNextItem();
		await expect(aura.ndv.getInlineExpressionEditorPreview()).toContainText('3');

		// Select next item again
		await aura.ndv.expressionSelectNextItem();
		await expect(aura.ndv.getInlineExpressionEditorPreview()).toContainText('1');

		// Next button should be disabled
		await expect(aura.ndv.getInlineExpressionEditorItemNextButton()).toBeDisabled();
	});
});
