import { expect, test } from '../../fixtures/base';

test.describe('PDF Test', () => {
	test('Can read and write PDF files and extract text', async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();
		await aura.canvas.importWorkflow('test_pdf_workflow.json', 'PDF Workflow');
		await aura.canvas.clickExecuteWorkflowButton();
		await expect(
			aura.notifications.getNotificationByTitle('Workflow executed successfully'),
		).toBeVisible();
	});
});
