import { test, expect } from '../../../fixtures/base';

test.describe('01 - UI Test Entry Points', () => {
	test.describe('Entry Point: Home Page', () => {
		test('should navigate from home', async ({ aura }) => {
			await aura.start.fromHome();
			expect(aura.page.url()).toContain('/home/workflows');
		});
	});

	test.describe('Entry Point: Blank Canvas', () => {
		test('should navigate from blank canvas', async ({ aura }) => {
			await aura.start.fromBlankCanvas();
			await expect(aura.canvas.canvasPane()).toBeVisible();
		});
	});

	test.describe('Entry Point: Basic Workflow Creation', () => {
		test('should create a new project and workflow', async ({ aura }) => {
			await aura.start.fromNewProjectBlankCanvas();
			await expect(aura.canvas.canvasPane()).toBeVisible();
		});
	});

	test.describe('Entry Point: Imported Workflow', () => {
		test('should import a webhook workflow', async ({ aura }) => {
			const workflowImportResult = await aura.start.fromImportedWorkflow(
				'simple-webhook-test.json',
			);
			const { webhookPath } = workflowImportResult;

			const testPayload = { message: 'Hello from Playwright test' };

			await aura.canvas.clickExecuteWorkflowButton();
			await expect(aura.canvas.getExecuteWorkflowButton()).toHaveText('Waiting for trigger event');

			const webhookResponse = await aura.page.request.post(`/webhook-test/${webhookPath}`, {
				data: testPayload,
			});

			expect(webhookResponse.ok()).toBe(true);
		});

		test('should import a workflow', async ({ aura }) => {
			await aura.start.fromImportedWorkflow('manual.json');
			await aura.workflowComposer.executeWorkflowAndWaitForNotification('Success');
			await expect(aura.canvas.canvasPane()).toBeVisible();
		});
	});
});
