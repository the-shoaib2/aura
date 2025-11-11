import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

const requirements: TestRequirements = {
	workflow: 'Test_workflow_1.json',
	storage: {
		N8N_EXPERIMENT_OVERRIDES: JSON.stringify({ ndv_in_focus_panel: 'variant' }),
	},
};

test.describe('SUG-121 Fields reset after closing NDV', () => {
	test('should preserve changes to parameters after closing NDV when focus panel is open', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(requirements);
		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.toggleFocusPanelButton().click();
		await aura.canvas.canvasPane().click();
		await aura.canvas.nodeByName('Code').dblclick();
		await aura.ndv.getParameterByLabel('JavaScript').getByRole('textbox').fill('alert(1)');
		await aura.ndv.close();
		await aura.canvas.nodeByName('Code').dblclick();
		await expect(aura.ndv.getParameterByLabel('JavaScript').getByRole('textbox')).toHaveText(
			'alert(1)',
		);
	});
});
