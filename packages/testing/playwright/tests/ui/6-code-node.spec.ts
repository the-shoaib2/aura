import { nanoid } from 'nanoid';

import {
	CODE_NODE_DISPLAY_NAME,
	CODE_NODE_NAME,
	MANUAL_TRIGGER_NODE_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';

test.describe('Code node', () => {
	test.describe('Code editor', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.goHome();
			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
		});

		test('should show correct placeholders switching modes', async ({ aura }) => {
			await expect(
				aura.ndv.getPlaceholderText('// Loop over input items and add a new field'),
			).toBeVisible();

			await aura.ndv.getParameterInput('mode').click();
			await aura.page.getByRole('option', { name: 'Run Once for Each Item' }).click();

			await expect(
				aura.ndv.getPlaceholderText("// Add a new field called 'myNewField'"),
			).toBeVisible();

			await aura.ndv.getParameterInput('mode').click();
			await aura.page.getByRole('option', { name: 'Run Once for All Items' }).click();

			await expect(
				aura.ndv.getPlaceholderText('// Loop over input items and add a new field'),
			).toBeVisible();
		});

		test('should execute the placeholder successfully in both modes', async ({ aura }) => {
			await aura.ndv.execute();

			await expect(
				aura.notifications.getNotificationByTitle('Node executed successfully').first(),
			).toBeVisible();

			await aura.ndv.getParameterInput('mode').click();
			await aura.page.getByRole('option', { name: 'Run Once for Each Item' }).click();

			await aura.ndv.execute();

			await expect(
				aura.notifications.getNotificationByTitle('Node executed successfully').first(),
			).toBeVisible();
		});

		test('should allow switching between sibling code nodes', async ({ aura }) => {
			await aura.ndv.getCodeEditor().fill("console.log('Code in JavaScript1')");
			await aura.ndv.close();

			await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });

			await aura.ndv.getCodeEditor().fill("console.log('Code in JavaScript2')");
			await aura.ndv.close();

			await aura.canvas.openNode(CODE_NODE_DISPLAY_NAME);

			await aura.ndv.clickFloatingNode(CODE_NODE_DISPLAY_NAME + '1');
			await expect(aura.ndv.getCodeEditor()).toContainText("console.log('Code in JavaScript2')");

			await aura.ndv.clickFloatingNode(CODE_NODE_DISPLAY_NAME);
			await expect(aura.ndv.getCodeEditor()).toContainText("console.log('Code in JavaScript1')");
		});

		test('should show lint errors in `runOnceForAllItems` mode', async ({ aura }) => {
			await aura.ndv.getCodeEditor().fill(`$input.itemMatching()
$input.item
$('When clicking ‘Execute workflow’').item
$input.first(1)

for (const item of $input.all()) {
  item.foo
}

return
`);
			await expect(aura.ndv.getLintErrors()).toHaveCount(6);
			await aura.ndv.getParameterInput('jsCode').getByText('itemMatching').hover();
			await expect(aura.ndv.getLintTooltip()).toContainText(
				'`.itemMatching()` expects an item index to be passed in as its argument.',
			);
		});
	});

	test.describe
		.serial('Run Once for Each Item', () => {
			test('should show lint errors in `runOnceForEachItem` mode', async ({ aura }) => {
				await aura.start.fromHome();
				await aura.workflows.addResource.workflow();
				await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
				await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
				await aura.ndv.toggleCodeMode('Run Once for Each Item');

				await aura.ndv.getCodeEditor().fill(`$input.itemMatching()
$input.all()
$input.first()
$input.item()

return []
`);
				await expect(aura.ndv.getLintErrors()).toHaveCount(7);
				await aura.ndv.getParameterInput('jsCode').getByText('all').hover();
				await expect(aura.ndv.getLintTooltip()).toContainText(
					"Method `$input.all()` is only available in the 'Run Once for All Items' mode.",
				);
			});
		});

	test.describe('Ask AI', () => {
		test.describe('Enabled', () => {
			test.beforeEach(async ({ api, aura }) => {
				await api.enableFeature('askAi');
				await aura.goHome();
				await aura.workflows.addResource.workflow();
				await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
				await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			});

			test('tab should exist if experiment selected and be selectable', async ({ aura }) => {
				await aura.ndv.clickAskAiTab();
				await expect(aura.ndv.getAskAiTabPanel()).toBeVisible();
				await expect(aura.ndv.getHeyAiText()).toBeVisible();
			});

			test('generate code button should have correct state & tooltips', async ({ aura }) => {
				await aura.ndv.clickAskAiTab();
				await expect(aura.ndv.getAskAiTabPanel()).toBeVisible();

				await expect(aura.ndv.getAskAiCtaButton()).toBeDisabled();
				await aura.ndv.getAskAiCtaButton().hover();
				await expect(aura.ndv.getAskAiCtaTooltipNoInputData()).toBeVisible();

				await aura.ndv.executePrevious();
				await aura.ndv.getAskAiCtaButton().hover();
				await expect(aura.ndv.getAskAiCtaTooltipNoPrompt()).toBeVisible();

				await aura.ndv.getAskAiPromptInput().fill(nanoid(14));

				await aura.ndv.getAskAiCtaButton().hover();
				await expect(aura.ndv.getAskAiCtaTooltipPromptTooShort()).toBeVisible();

				await aura.ndv.getAskAiPromptInput().fill(nanoid(15));
				await expect(aura.ndv.getAskAiCtaButton()).toBeEnabled();

				await expect(aura.ndv.getAskAiPromptCounter()).toContainText('15 / 600');
			});

			test('should send correct schema and replace code', async ({ aura }) => {
				const prompt = nanoid(20);
				await aura.ndv.clickAskAiTab();
				await aura.ndv.executePrevious();

				await aura.ndv.getAskAiPromptInput().fill(prompt);

				await aura.page.route('**/rest/ai/ask-ai', async (route) => {
					await route.fulfill({
						status: 200,
						contentType: 'application/json',
						body: JSON.stringify({
							data: {
								code: 'console.log("Hello World")',
							},
						}),
					});
				});

				const [request] = await Promise.all([
					aura.page.waitForRequest('**/rest/ai/ask-ai'),
					aura.ndv.getAskAiCtaButton().click(),
				]);

				const requestBody = request.postDataJSON();
				expect(requestBody).toHaveProperty('question');
				expect(requestBody).toHaveProperty('context');
				expect(requestBody).toHaveProperty('forNode');
				expect(requestBody.context).toHaveProperty('schema');
				expect(requestBody.context).toHaveProperty('ndvPushRef');
				expect(requestBody.context).toHaveProperty('pushRef');
				expect(requestBody.context).toHaveProperty('inputSchema');

				await expect(aura.ndv.getCodeGenerationCompletedText()).toBeVisible();
				await expect(aura.ndv.getCodeTabPanel()).toContainText('console.log("Hello World")');
				await expect(aura.ndv.getCodeTab()).toHaveClass(/is-active/);
			});

			const handledCodes = [
				{ code: 400, message: 'Code generation failed due to an unknown reason' },
				{ code: 413, message: 'Your workflow data is too large for AI to process' },
				{ code: 429, message: "We've hit our rate limit with our AI partner" },
				{
					code: 500,
					message:
						'Code generation failed with error: Request failed with status code 500. Try again in a few minutes',
				},
			];

			handledCodes.forEach(({ code, message }) => {
				test(`should show error based on status code ${code}`, async ({ aura }) => {
					const prompt = nanoid(20);
					await aura.ndv.clickAskAiTab();
					await aura.ndv.executePrevious();

					await aura.ndv.getAskAiPromptInput().fill(prompt);

					await aura.page.route('**/rest/ai/ask-ai', async (route) => {
						await route.fulfill({
							status: code,
						});
					});

					await aura.ndv.getAskAiCtaButton().click();
					await expect(aura.ndv.getErrorMessageText(message)).toBeVisible();
				});
			});
		});
	});
});
