import { test, expect } from '../../fixtures/base';

test.describe('Manual partial execution', () => {
	test('should not execute parent nodes with no run data', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('manual-partial-execution.json');
		await aura.canvas.clickZoomToFitButton();

		await aura.canvas.openNode('Edit Fields');

		await aura.ndv.clickExecuteStep();

		await aura.ndv.close();

		await aura.canvas.openNode('Webhook1');

		await expect(aura.ndv.getNodeRunSuccessIndicator()).toBeHidden();
		await expect(aura.ndv.getNodeRunTooltipIndicator()).toBeHidden();
		await expect(aura.ndv.outputPanel.getRunSelector()).toBeHidden();
	});

	test.describe('partial execution v2', () => {
		test('should execute from the first dirty node up to the current node', async ({ aura }) => {
			const nodeNames = ['A', 'B', 'C'];

			await aura.navigate.toWorkflow('new');
			await aura.partialExecutionComposer.enablePartialExecutionV2();
			await aura.start.fromImportedWorkflow('Test_workflow_partial_execution_v2.json');
			await aura.canvas.clickZoomToFitButton();

			await aura.partialExecutionComposer.executeFullWorkflowAndVerifySuccess(nodeNames);

			const beforeText = await aura.partialExecutionComposer.captureNodeOutputData('A');

			await aura.partialExecutionComposer.modifyNodeToTriggerStaleState('B');

			await aura.partialExecutionComposer.verifyNodeStatesAfterChange(['A', 'C'], ['B']);

			await aura.partialExecutionComposer.performPartialExecutionAndVerifySuccess('C', nodeNames);

			await aura.partialExecutionComposer.openNodeForDataVerification('A');

			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toHaveText(beforeText);
		});
	});
});
