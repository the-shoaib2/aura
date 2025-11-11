import { test, expect } from '../../fixtures/base';
import executionOutOfMemoryResponse from '../../fixtures/execution-out-of-memory-server-response.json';

const ERROR_MESSAGES = {
	OUT_OF_MEMORY: 'Workflow did not finish, possible out-of-memory issue',
} as const;

const TIMEOUTS = {
	EXECUTIONS_REFRESH_INTERVAL: 4000,
} as const;

test.describe('Workflow Executions', () => {
	test.describe('when workflow is saved', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.start.fromImportedWorkflow('Test_workflow_4_executions_view.json');
		});

		test('should render executions tab correctly', async ({ aura }) => {
			await aura.executionsComposer.createExecutions(15);

			await aura.canvas.toggleNodeEnabled('Error');
			await expect(aura.canvas.disabledNodes()).toHaveCount(0);
			await aura.executionsComposer.createExecutions(2);

			await aura.canvas.toggleNodeEnabled('Error');
			await expect(aura.canvas.disabledNodes()).toHaveCount(1);
			await aura.executionsComposer.createExecutions(15);

			const executionsResponsePromise = aura.page.waitForResponse((response) =>
				response.url().includes('/rest/executions?filter='),
			);

			await aura.canvas.clickExecutionsTab();
			await executionsResponsePromise;

			await expect(aura.executions.getExecutionItems().first()).toBeVisible();

			const loadMoreResponsePromise = aura.page.waitForResponse((response) =>
				response.url().includes('/rest/executions?filter='),
			);
			await aura.executions.scrollExecutionsListToBottom();
			await loadMoreResponsePromise;

			await expect(aura.executions.getExecutionItems()).toHaveCount(30, { timeout: 15000 });
			await expect(aura.executions.getSuccessfulExecutionItems()).toHaveCount(28);
			await expect(aura.executions.getFailedExecutionItems()).toHaveCount(2);
			await expect(aura.executions.getFirstExecutionItem()).toHaveClass(/_active_/);
		});

		test('should not redirect back to execution tab when request is not done before leaving the page', async ({
			aura,
		}) => {
			await aura.page.route('**/rest/executions?filter=*', (route) => route.continue());
			await aura.page.route('**/rest/executions/active?filter=*', (route) => route.continue());

			await aura.canvas.clickExecutionsTab();
			await aura.canvas.clickEditorTab();
			await expect(aura.page).toHaveURL(/\/workflow\/[^/]+$/, {
				timeout: TIMEOUTS.EXECUTIONS_REFRESH_INTERVAL,
			});

			for (let i = 0; i < 3; i++) {
				await aura.canvas.clickExecutionsTab();
				await aura.canvas.clickEditorTab();
			}
			await expect(aura.page).toHaveURL(/\/workflow\/[^/]+$/, {
				timeout: TIMEOUTS.EXECUTIONS_REFRESH_INTERVAL,
			});

			await aura.canvas.clickExecutionsTab();
			// eslint-disable-next-line playwright/no-wait-for-timeout
			await aura.page.waitForTimeout(1000);
			await aura.canvas.clickEditorTab();
			await expect(aura.page).toHaveURL(/\/workflow\/[^/]+$/, {
				timeout: TIMEOUTS.EXECUTIONS_REFRESH_INTERVAL,
			});
		});

		test('should not redirect back to execution tab when slow request is not done before leaving the page', async ({
			aura,
		}) => {
			await aura.page.route('**/rest/executions?filter=*', async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				await route.continue();
			});

			await aura.page.route('**/rest/executions/active?filter=*', async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				await route.continue();
			});

			await aura.canvas.clickExecutionsTab();
			await aura.page.waitForURL(/\/executions/);
			await aura.canvas.clickEditorTab();
			await aura.page.waitForURL(/\/workflow\/[^/]+$/);

			await expect(aura.page).toHaveURL(/\/workflow\/[^/]+$/, {
				timeout: TIMEOUTS.EXECUTIONS_REFRESH_INTERVAL,
			});
		});

		test('should error toast when server error message returned without stack trace', async ({
			aura,
		}) => {
			const responsePromise = aura.page.waitForResponse(
				(response) =>
					response.url().includes('/rest/workflows/') &&
					response.url().includes('/run') &&
					response.request().method() === 'POST',
			);
			await aura.canvas.clickExecuteWorkflowButton();
			await responsePromise;

			await aura.page.route('**/rest/executions/*', async (route) => {
				if (route.request().url().includes('?filter=')) {
					await route.continue();
					return;
				}

				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(executionOutOfMemoryResponse),
				});
			});

			const executionDetailPromise = aura.page.waitForResponse(
				(response) =>
					response.url().includes('/rest/executions/') && !response.url().includes('?filter='),
			);
			await aura.canvas.clickExecutionsTab();
			await executionDetailPromise;

			const iframe = aura.executions.getPreviewIframe();
			await expect(iframe.locator('body')).not.toBeEmpty();

			await aura.executions.getErrorNotificationsInPreview().first().waitFor({ timeout: 5000 });

			const errorNotification = aura.executions
				.getErrorNotificationsInPreview()
				.filter({ hasText: ERROR_MESSAGES.OUT_OF_MEMORY });
			await expect(errorNotification).toBeVisible();
		});

		// eslint-disable-next-line playwright/no-skipped-test
		test.skip('should show workflow data in executions tab after hard reload and modify name and tags', async () => {
			// TODO: Migrate from Cypress
		});
		// eslint-disable-next-line playwright/no-skipped-test
		test.skip('should load items and auto scroll after filter change', async () => {
			// TODO: This should be a component test
		});

		test('should redirect back to editor after seeing a couple of execution using browser back button', async ({
			aura,
		}) => {
			await aura.executionsComposer.createExecutions(15);

			await aura.canvas.toggleNodeEnabled('Error');
			await expect(aura.canvas.disabledNodes()).toHaveCount(0);
			await aura.executionsComposer.createExecutions(2);

			await aura.canvas.toggleNodeEnabled('Error');
			await expect(aura.canvas.disabledNodes()).toHaveCount(1);
			await aura.executionsComposer.createExecutions(15);

			const executionsResponsePromise = aura.page.waitForResponse((response) =>
				response.url().includes('/rest/executions?filter='),
			);

			await aura.canvas.clickExecutionsTab();
			await executionsResponsePromise;

			const iframe = aura.executions.getPreviewIframe();
			await expect(iframe.locator('body')).toBeAttached();

			await aura.executions.getExecutionItems().nth(2).click();
			await expect(iframe.locator('body')).toBeAttached();

			await aura.executions.getExecutionItems().nth(4).click();
			await expect(iframe.locator('body')).toBeAttached();

			await aura.executions.getExecutionItems().nth(6).click();
			await expect(iframe.locator('body')).toBeAttached();

			await aura.page.goBack();
			await expect(iframe.locator('body')).toBeAttached();

			await aura.page.goBack();
			await expect(iframe.locator('body')).toBeAttached();

			await aura.page.goBack();
			await expect(iframe.locator('body')).toBeAttached();

			await aura.page.goBack();

			await expect(aura.page).not.toHaveURL(/\/executions/);
			await expect(aura.page).toHaveURL(/\/workflow\//);
			await expect(aura.canvas.canvasPane()).toBeVisible();
		});
	});

	test.describe('when new workflow is not saved', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.start.fromBlankCanvas();
		});

		test('should open executions tab', async ({ aura }) => {
			await aura.canvas.clickExecutionsTab();
			await expect(aura.executions.getExecutionsSidebar()).toBeVisible();
			await expect(aura.executions.getExecutionsEmptyList()).toBeVisible();
			await expect(aura.page.getByTestId('workflow-execution-no-trigger-content')).toBeVisible();

			await aura.page.getByRole('button', { name: 'Add first step' }).click();
			await aura.canvas.nodeCreatorItemByName('Trigger manually').click();

			await aura.canvas.clickExecutionsTab();
			await expect(aura.executions.getExecutionsSidebar()).toBeVisible();
			await expect(aura.executions.getExecutionsEmptyList()).toBeVisible();
			await expect(aura.page.getByTestId('workflow-execution-no-content')).toBeVisible();

			await expect(aura.canvas.saveWorkflowButton()).toBeEnabled();
			await aura.canvas.saveWorkflowButton().click();
			await aura.page.waitForURL(/\/workflow\/[^/]+$/);
			await expect(aura.canvas.canvasPane()).toBeVisible();
		});
	});
});
