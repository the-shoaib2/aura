import { test, expect } from '../../fixtures/base';

test.describe('ADO-2362 ADO-2350 NDV Prevent clipping long parameters and scrolling to expression', () => {
	test('should show last parameters and open at scroll top of parameters', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test-workflow-with-long-parameters.json');

		await aura.canvas.openNode('Schedule Trigger');

		await expect(aura.ndv.getInlineExpressionEditorInput().first()).toBeVisible();

		await aura.ndv.close();

		await aura.canvas.openNode('Edit Fields1');

		await expect(aura.ndv.getInputLabel().nth(0)).toContainText('Mode');
		await expect(aura.ndv.getInputLabel().nth(0)).toBeVisible();

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveCount(2);

		await expect(aura.ndv.getInlineExpressionEditorInput().nth(0)).toHaveText('should be visible!');
		await expect(aura.ndv.getInlineExpressionEditorInput().nth(0)).toBeVisible();

		await expect(aura.ndv.getInlineExpressionEditorInput().nth(1)).toHaveText('not visible');
		await expect(aura.ndv.getInlineExpressionEditorInput().nth(1)).toBeVisible();

		await aura.ndv.close();
		await aura.canvas.openNode('Schedule Trigger');

		await expect(aura.ndv.getNthParameter(0)).toContainText(
			'This workflow will run on the schedule ',
		);
		await expect(aura.ndv.getInputLabel().nth(0)).toBeVisible();

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveCount(2);

		await expect(aura.ndv.getInlineExpressionEditorInput().nth(0)).toHaveText('should be visible');
		await expect(aura.ndv.getInlineExpressionEditorInput().nth(0)).toBeVisible();

		await expect(aura.ndv.getInlineExpressionEditorInput().nth(1)).toHaveText('not visible');
		await expect(aura.ndv.getInlineExpressionEditorInput().nth(1)).not.toBeInViewport();

		await aura.ndv.close();
		await aura.canvas.openNode('Slack');

		await expect(aura.ndv.getCredentialsLabel()).toBeVisible();

		await expect(aura.ndv.getInlineExpressionEditorInput().nth(0)).toHaveText('should be visible');
		await expect(aura.ndv.getInlineExpressionEditorInput().nth(0)).toBeVisible();

		await expect(aura.ndv.getInlineExpressionEditorInput().nth(1)).toHaveText('not visible');
		await expect(aura.ndv.getInlineExpressionEditorInput().nth(1)).not.toBeInViewport();
	});

	test('NODE-1272 ensure expressions scrolled to top, not middle', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test-workflow-with-long-parameters.json');

		await aura.canvas.openNode('With long expression');

		await expect(aura.ndv.getInlineExpressionEditorInput().nth(0)).toBeVisible();

		const editor = aura.ndv.getInlineExpressionEditorInput().nth(0);
		await expect(editor.locator('.cm-line').nth(0)).toHaveText('1 visible!');
		await expect(editor.locator('.cm-line').nth(0)).toBeVisible();
		await expect(editor.locator('.cm-line').nth(6)).toHaveText('7 not visible!');
		await expect(editor.locator('.cm-line').nth(6)).not.toBeInViewport();
	});
});
