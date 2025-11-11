import { test, expect } from '../../fixtures/base';
import onboardingWorkflow from '../../workflows/Onboarding_workflow.json';

test.describe('Import workflow', () => {
	test.describe('From URL', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.page.route('**/rest/workflows/from-url*', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ data: onboardingWorkflow }),
				});
			});
		});

		test('should import workflow', async ({ aura }) => {
			await aura.navigate.toWorkflow('new');
			await aura.page.waitForLoadState('load');

			await aura.canvas.clickWorkflowMenu();
			await aura.canvas.clickImportFromURL();

			await expect(aura.canvas.getImportURLInput()).toBeVisible();

			await aura.canvas.fillImportURLInput('https://fakepage.com/workflow.json');
			await aura.canvas.clickConfirmImportURL();

			await aura.canvas.clickZoomToFitButton();

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(4);

			await expect(aura.notifications.getErrorNotifications()).toHaveCount(0);
			await expect(aura.notifications.getSuccessNotifications()).toHaveCount(0);
		});

		test('clicking outside modal should not show error toast', async ({ aura }) => {
			await aura.navigate.toWorkflow('new');
			await aura.page.waitForLoadState('load');

			await aura.canvas.clickWorkflowMenu();
			await aura.canvas.clickImportFromURL();

			await aura.canvas.clickOutsideModal();

			await expect(aura.notifications.getErrorNotifications()).toHaveCount(0);
		});

		test('canceling modal should not show error toast', async ({ aura }) => {
			await aura.navigate.toWorkflow('new');
			await aura.page.waitForLoadState('load');

			await aura.canvas.clickWorkflowMenu();
			await aura.canvas.clickImportFromURL();

			await aura.canvas.clickCancelImportURL();

			await expect(aura.notifications.getErrorNotifications()).toHaveCount(0);
		});

		test('should import workflow from URL without .json extension', async ({ aura }) => {
			await aura.navigate.toWorkflow('new');
			await aura.page.waitForLoadState('load');

			await aura.canvas.clickWorkflowMenu();
			await aura.canvas.clickImportFromURL();

			await expect(aura.canvas.getImportURLInput()).toBeVisible();

			await aura.canvas.fillImportURLInput('https://example.com/api/workflow');
			await aura.canvas.clickConfirmImportURL();

			await aura.canvas.clickZoomToFitButton();

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(4);

			await expect(aura.notifications.getErrorNotifications()).toHaveCount(0);
			await expect(aura.notifications.getSuccessNotifications()).toHaveCount(0);
		});
	});

	test.describe('From File', () => {
		test('should import workflow', async ({ aura }) => {
			await aura.navigate.toWorkflow('new');
			await aura.page.waitForLoadState('load');

			await aura.canvas.importWorkflow(
				'Test_workflow-actions_paste-data.json',
				'Import Test Workflow',
			);

			await aura.page.waitForLoadState('load');

			await aura.canvas.clickZoomToFitButton();

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(5);

			const connections = aura.page.getByTestId('edge');
			await expect(connections).toHaveCount(5);
		});
	});
});
