import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

const requirements: TestRequirements = {
	workflow: {
		'Test_ado_1338.json': 'Test Workflow ADO-1338',
	},
};

test.describe('ADO-1338-ndv-missing-input-panel', () => {
	test('should show the input and output panels when node is missing input and output data', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(requirements);
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow successfully executed',
		);

		await aura.canvas.openNode('Discourse1');
		await expect(aura.ndv.inputPanel.get()).toBeVisible();
		await expect(aura.ndv.outputPanel.get()).toBeVisible();
	});
});
