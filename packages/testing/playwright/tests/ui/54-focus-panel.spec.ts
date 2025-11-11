import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

test.describe('Focus panel', () => {
	test.describe('With experimental NDV in focus panel enabled', () => {
		const requirements: TestRequirements = {
			storage: {
				N8N_EXPERIMENT_OVERRIDES: JSON.stringify({ ndv_in_focus_panel: 'variant' }),
			},
		};

		test('should keep showing selected node when canvas is clicked while mapper popover is shown', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(requirements);
			await aura.start.fromImportedWorkflow('Test_workflow_3.json');
			await aura.canvas.clickZoomToFitButton();
			await aura.canvas.deselectAll();
			await aura.canvas.toggleFocusPanelButton().click();
			await aura.canvas.nodeByName('Set').click();
			await expect(aura.canvas.focusPanel.getHeaderNodeName()).toHaveText('Set');
			await aura.canvas.focusPanel
				.getParameterInputField('assignments.assignments.0.value')
				.focus();
			await expect(aura.canvas.focusPanel.getMapper()).toBeVisible();

			// Assert that mapper is closed but the Set node is still selected and shown in
			await aura.canvas.canvasBody().click({ position: { x: 0, y: 0 } });

			await expect(aura.canvas.focusPanel.getMapper()).toBeHidden();
			await expect(aura.canvas.focusPanel.getHeaderNodeName()).toHaveText('Set');
			await expect(aura.canvas.selectedNodes()).toHaveCount(1);

			// Assert that another click on canvas does de-select the Set node
			await aura.canvas.canvasBody().click({ position: { x: 0, y: 0 } });

			await expect(aura.canvas.focusPanel.getHeaderNodeName()).toBeHidden();
			await expect(aura.canvas.selectedNodes()).toHaveCount(0);
		});
	});
});
