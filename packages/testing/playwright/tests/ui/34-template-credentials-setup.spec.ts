import { readFileSync } from 'fs';

import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';
import { resolveFromRoot } from '../../utils/path-helper';

const TEMPLATE_HOST = 'https://api.aura.io/api/';
const TEMPLATE_ID = 1205;
const TEMPLATE_WITHOUT_CREDS_ID = 1344;
const COLLECTION_ID = 1;

const testTemplate = JSON.parse(
	readFileSync(resolveFromRoot('workflows', 'Test_Template_1.json'), 'utf8'),
);

const templateWithoutCredentials = JSON.parse(
	readFileSync(resolveFromRoot('workflows', 'Test_Template_2.json'), 'utf8'),
);

const ecommerceCollection = JSON.parse(
	readFileSync(
		resolveFromRoot('workflows', 'Ecommerce_starter_pack_template_collection.json'),
		'utf8',
	),
);

function createTemplateRequirements(): TestRequirements {
	return {
		config: {
			settings: {
				templates: {
					enabled: true,
					host: TEMPLATE_HOST,
				},
			},
		},
		intercepts: {
			getTemplatePreview: {
				url: `${TEMPLATE_HOST}templates/workflows/${TEMPLATE_ID}`,
				response: testTemplate,
			},
			getTemplate: {
				url: `${TEMPLATE_HOST}workflows/templates/${TEMPLATE_ID}`,
				response: testTemplate.workflow,
			},
			getTemplateCollection: {
				url: `${TEMPLATE_HOST}templates/collections/${COLLECTION_ID}`,
				response: ecommerceCollection,
			},
		},
	};
}

test.describe('Template credentials setup @db:reset', () => {
	test.beforeEach(async ({ setupRequirements }) => {
		await setupRequirements(createTemplateRequirements());
	});

	test('can be opened from template collection page', async ({ aura }) => {
		await aura.navigate.toTemplateCollection(COLLECTION_ID);
		await aura.templates.clickUseWorkflowButton('Promote new Shopify products');

		await expect(
			aura.templateCredentialSetup.getTitle("Set up 'Promote new Shopify products' template"),
		).toBeVisible();
	});

	test('has all the elements on page', async ({ aura }) => {
		await aura.navigate.toTemplateCredentialSetup(TEMPLATE_ID);

		await expect(
			aura.templateCredentialSetup.getTitle("Set up 'Promote new Shopify products' template"),
		).toBeVisible();

		await expect(aura.templateCredentialSetup.getInfoCallout()).toContainText(
			'You need 1x Shopify, 1x X (Formerly Twitter) and 1x Telegram account to setup this template',
		);

		const expectedAppNames = ['1. Shopify', '2. X (Formerly Twitter)', '3. Telegram'];
		const expectedAppDescriptions = [
			'The credential you select will be used in the product created node of the workflow template.',
			'The credential you select will be used in the Twitter node of the workflow template.',
			'The credential you select will be used in the Telegram node of the workflow template.',
		];

		const formSteps = aura.templateCredentialSetup.getFormSteps();
		const count = await formSteps.count();

		for (let i = 0; i < count; i++) {
			const step = formSteps.nth(i);
			await expect(aura.templateCredentialSetup.getStepHeading(step)).toHaveText(
				expectedAppNames[i],
			);
			await expect(aura.templateCredentialSetup.getStepDescription(step)).toHaveText(
				expectedAppDescriptions[i],
			);
		}
	});

	test('can skip template creation', async ({ aura }) => {
		await aura.navigate.toTemplateCredentialSetup(TEMPLATE_ID);

		await aura.templateCredentialSetup.getSkipLink().click();

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
	});

	test('can create credentials and workflow from the template', async ({ aura }) => {
		await aura.navigate.toTemplateCredentialSetup(TEMPLATE_ID);

		await expect(aura.templateCredentialSetup.getContinueButton()).toBeDisabled();

		await aura.templatesComposer.fillDummyCredentialForApp('Shopify');

		await expect(aura.templateCredentialSetup.getContinueButton()).toBeEnabled();

		await aura.templatesComposer.fillDummyCredentialForAppWithConfirm('X (Formerly Twitter)');
		await aura.templatesComposer.fillDummyCredentialForApp('Telegram');

		await aura.notifications.quickCloseAll();

		const workflowCreatePromise = aura.page.waitForResponse('**/rest/workflows');
		await aura.templateCredentialSetup.getContinueButton().click();
		await workflowCreatePromise;

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);

		const workflow = await aura.canvasComposer.getWorkflowFromClipboard();

		expect(workflow.meta).toHaveProperty('templateId', TEMPLATE_ID.toString());
		expect(workflow.meta).not.toHaveProperty('templateCredsSetupCompleted');
		workflow.nodes.forEach((node: { credentials?: Record<string, unknown> }) => {
			expect(Object.keys(node.credentials ?? {})).toHaveLength(1);
		});
	});

	test('should work with a template that has no credentials (ADO-1603)', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements({
			config: {
				settings: {
					templates: {
						enabled: true,
						host: TEMPLATE_HOST,
					},
				},
			},
			intercepts: {
				getTemplatePreview: {
					url: `${TEMPLATE_HOST}templates/workflows/${TEMPLATE_WITHOUT_CREDS_ID}`,
					response: templateWithoutCredentials,
				},
				getTemplate: {
					url: `${TEMPLATE_HOST}workflows/templates/${TEMPLATE_WITHOUT_CREDS_ID}`,
					response: templateWithoutCredentials.workflow,
				},
			},
		});

		await aura.navigate.toTemplateCredentialSetup(TEMPLATE_WITHOUT_CREDS_ID);

		const expectedAppNames = ['1. Email (IMAP)', '2. Nextcloud'];
		const expectedAppDescriptions = [
			'The credential you select will be used in the IMAP Email node of the workflow template.',
			'The credential you select will be used in the Nextcloud node of the workflow template.',
		];

		const formSteps = aura.templateCredentialSetup.getFormSteps();
		const count = await formSteps.count();

		for (let i = 0; i < count; i++) {
			const step = formSteps.nth(i);
			await expect(aura.templateCredentialSetup.getStepHeading(step)).toHaveText(
				expectedAppNames[i],
			);
			await expect(aura.templateCredentialSetup.getStepDescription(step)).toHaveText(
				expectedAppDescriptions[i],
			);
		}

		await expect(aura.templateCredentialSetup.getContinueButton()).toBeDisabled();

		await aura.templatesComposer.fillDummyCredentialForApp('Email (IMAP)');
		await aura.templatesComposer.fillDummyCredentialForApp('Nextcloud');

		await aura.notifications.quickCloseAll();

		const workflowCreatePromise = aura.page.waitForResponse('**/rest/workflows');
		await aura.templateCredentialSetup.getContinueButton().click();
		await workflowCreatePromise;

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
	});

	test.describe('Credential setup from workflow editor', () => {
		test('should allow credential setup from workflow editor if user skips it during template setup', async ({
			aura,
		}) => {
			await aura.navigate.toTemplateCredentialSetup(TEMPLATE_ID);
			await aura.templateCredentialSetup.getSkipLink().click();

			await expect(aura.canvas.getSetupWorkflowCredentialsButton()).toBeVisible();
		});

		test('should allow credential setup from workflow editor if user fills in credentials partially during template setup', async ({
			aura,
		}) => {
			await aura.navigate.toTemplateCredentialSetup(TEMPLATE_ID);
			await aura.templatesComposer.fillDummyCredentialForApp('Shopify');

			await aura.notifications.quickCloseAll();

			const workflowCreatePromise = aura.page.waitForResponse('**/rest/workflows');
			await aura.templateCredentialSetup.getContinueButton().click();
			await workflowCreatePromise;

			await expect(aura.canvas.getSetupWorkflowCredentialsButton()).toBeVisible();
		});

		test('should fill credentials from workflow editor', async ({ aura }) => {
			await aura.navigate.toTemplateCredentialSetup(TEMPLATE_ID);
			await aura.templateCredentialSetup.getSkipLink().click();

			await aura.canvas.getSetupWorkflowCredentialsButton().click();
			await expect(aura.workflowCredentialSetupModal.getModal()).toBeVisible();

			await aura.templatesComposer.fillDummyCredentialForApp('Shopify');
			await aura.templatesComposer.fillDummyCredentialForAppWithConfirm('X (Formerly Twitter)');
			await aura.templatesComposer.fillDummyCredentialForApp('Telegram');

			await aura.notifications.quickCloseAll();

			await aura.workflowCredentialSetupModal.clickContinue();
			await expect(aura.workflowCredentialSetupModal.getModal()).toBeHidden();

			const workflow = await aura.canvasComposer.getWorkflowFromClipboard();

			workflow.nodes.forEach((node: { credentials?: Record<string, unknown> }) => {
				expect(Object.keys(node.credentials ?? {})).toHaveLength(1);
			});

			await expect(aura.canvas.getSetupWorkflowCredentialsButton()).toBeHidden();
		});
	});
});
