import { test, expect } from '../../fixtures/base';

const EDIT_FIELDS_NAMES = [
	'Edit Fields0',
	'Edit Fields1',
	'Edit Fields2',
	'Edit Fields3',
	'Edit Fields4',
	'Edit Fields5',
];

test.describe('Subworkflow Extraction', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Subworkflow-extraction-workflow.json');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(7);
		await aura.canvas.clickZoomToFitButton();

		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);

		await aura.canvas.deselectAll();
	});

	test.describe('can extract a valid selection and still execute the workflow', () => {
		test('should extract a node and succeed execution, and then undo and succeed executions', async ({
			aura,
		}) => {
			for (const name of EDIT_FIELDS_NAMES) {
				await aura.canvas.rightClickNode(name);

				await aura.canvas.clickContextMenuAction('Convert node to sub-workflow');
				await aura.canvas.convertToSubworkflowModal.waitForModal();
				await aura.canvas.convertToSubworkflowModal.clickSubmitButton();
				await aura.canvas.convertToSubworkflowModal.waitForClose();

				await aura.workflowComposer.executeWorkflowAndWaitForNotification(
					'Workflow executed successfully',
				);
			}

			for (let i = 0; i < EDIT_FIELDS_NAMES.length; i++) {
				await aura.canvas.hitUndo();

				await aura.workflowComposer.executeWorkflowAndWaitForNotification(
					'Workflow executed successfully',
				);
			}
		});

		test('should extract all nodes besides trigger and succeed execution', async ({ aura }) => {
			await aura.canvas.nodeByName(EDIT_FIELDS_NAMES[0]).click();

			await aura.canvas.extendSelectionWithArrows('right');

			await aura.canvas.openCanvasContextMenu();
			await aura.canvas.clickContextMenuAction('Convert 6 nodes to sub-workflow');
			await aura.canvas.convertToSubworkflowModal.waitForModal();
			await aura.canvas.convertToSubworkflowModal.clickSubmitButton();
			await aura.canvas.convertToSubworkflowModal.waitForClose();

			await aura.workflowComposer.executeWorkflowAndWaitForNotification(
				'Workflow executed successfully',
			);
		});
	});
});
