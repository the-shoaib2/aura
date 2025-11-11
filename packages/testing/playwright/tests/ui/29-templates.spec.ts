import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';
import type { TestRequirements } from '../../Types';
import allTemplatesSearchResponse from '../../workflows/all_templates_search_response.json';
import onboardingWorkflow from '../../workflows/Onboarding_workflow.json';
import salesTemplatesSearchResponse from '../../workflows/sales_templates_search_response.json';
import workflowTemplate from '../../workflows/Workflow_template_write_http_query.json';

const TEMPLATE_HOST = {
	N8N_API: 'https://api.aura.io/api/',
	CUSTOM: 'random.domain',
} as const;

const URLS = {
	N8N_WORKFLOWS: 'https://aura.io/workflows',
} as const;

const TEMPLATE_ID = '1';
const TEST_CATEGORY = 'sales';
const SALES_CATEGORY_ID = 3;

const NOTIFICATIONS = {
	SAVED: 'Saved',
};

const CATEGORIES = [
	{ id: 1, name: 'Engineering' },
	{ id: 2, name: 'Finance' },
	{ id: 3, name: 'Sales' },
];

const COLLECTIONS = [
	{
		id: 1,
		name: 'Test Collection',
		workflows: [{ id: 1 }],
		nodes: [],
	},
];

// Helper functions
/**
 * Prevents the browser's "before unload" confirmation dialog
 * Used when navigating away from workflows with unsaved changes in tests
 */
function preventNavigation(aura: auraPage) {
	return aura.page.evaluate(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).preventNodeViewBeforeUnload = true;
	});
}

/**
 * Extracts the numeric count from UI text (e.g., "5 templates" → 5)
 * @param text - Text containing a number (e.g., "5 templates", "3 collections")
 * @returns The extracted number, or 0 if no number found
 */
function parseCount(text: string | null): number {
	const digits = text?.replace(/\D/g, '') ?? '';
	return parseInt(digits || '0', 10);
}

function createTemplateHostRequirements(): TestRequirements {
	return {
		config: {
			settings: {
				templates: {
					enabled: true,
					host: TEMPLATE_HOST.N8N_API,
				},
			},
		},
	};
}

function createCustomTemplateHostRequirements(hostname: string): TestRequirements {
	return {
		config: {
			settings: {
				templates: {
					enabled: true,
					host: `https://${hostname}/api`,
				},
			},
		},
		intercepts: {
			health: {
				url: `https://${hostname}/api/health`,
				response: { status: 'OK' },
			},
			categories: {
				url: `https://${hostname}/api/templates/categories`,
				response: { categories: CATEGORIES },
			},
			getTemplate: {
				url: `https://${hostname}/api/workflows/templates/${TEMPLATE_ID}`,
				response: {
					id: 1,
					name: onboardingWorkflow.name,
					workflow: onboardingWorkflow,
				},
			},
			getTemplatePreview: {
				url: `https://${hostname}/api/templates/workflows/${TEMPLATE_ID}`,
				response: workflowTemplate,
			},
		},
	};
}

/**
 * Setup dynamic template routes for collections and search
 * This handles query parameter-based routing that cannot be configured statically
 * - Collections API filters by category
 * - Search API returns different results based on category
 */
async function setupDynamicTemplateRoutes(aura: auraPage, hostname: string) {
	await aura.page.route(`https://${hostname}/api/templates/collections*`, (route) => {
		const url = new URL(route.request().url());
		const categoryParam = url.searchParams.get('category[]');
		const response = categoryParam === String(SALES_CATEGORY_ID) ? [] : COLLECTIONS;
		void route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ collections: response }),
		});
	});

	await aura.page.route(`https://${hostname}/api/templates/search*`, (route) => {
		const url = new URL(route.request().url());
		const category = url.searchParams.get('category');
		const response =
			category === 'Sales' ? salesTemplatesSearchResponse : allTemplatesSearchResponse;
		void route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(response),
		});
	});
}

test.describe('Workflow templates', () => {
	test.describe('For api.aura.io', () => {
		test('Opens website when clicking templates sidebar link', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(createTemplateHostRequirements());
			await aura.navigate.toWorkflows();

			const templatesLink = aura.sideBar.getTemplatesLink();
			await expect(templatesLink).toBeVisible();

			const href = await templatesLink.getAttribute('href');
			expect(href).toContain(URLS.N8N_WORKFLOWS);

			const url = new URL(href!);
			const origin = await aura.page.evaluate(() => window.location.origin);

			const utmInstance = url.searchParams.get('utm_instance');
			expect(utmInstance).toBeTruthy();
			expect(decodeURIComponent(utmInstance!)).toContain(origin);

			const utmVersion = url.searchParams.get('utm_aura_version');
			expect(utmVersion).toBeTruthy();
			expect(utmVersion).toMatch(/[0-9]+\.[0-9]+\.[0-9]+/);

			const utmAwc = url.searchParams.get('utm_awc');
			expect(utmAwc).toBeTruthy();
			expect(utmAwc).toMatch(/[0-9]+/);

			await expect(templatesLink).toHaveAttribute('target', '_blank');
		});

		test('Redirects to website when visiting templates page directly', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(createTemplateHostRequirements());
			await aura.navigate.toTemplates();

			await expect(aura.page.getByRole('heading', { name: /workflow.*templates/i })).toBeVisible({
				timeout: 10000,
			});
		});
	});

	test.describe('For a custom template host', () => {
		const hostname = TEMPLATE_HOST.CUSTOM;

		test.beforeEach(async ({ aura, setupRequirements }) => {
			await setupRequirements(createCustomTemplateHostRequirements(hostname));
			await setupDynamicTemplateRoutes(aura, hostname);
		});

		test('can open onboarding flow', async ({ aura }) => {
			await preventNavigation(aura);

			await Promise.all([
				aura.page.waitForResponse(`https://${hostname}/api/workflows/templates/${TEMPLATE_ID}`),
				aura.page.waitForResponse('**/rest/workflows'),
				aura.navigate.toOnboardingTemplate(TEMPLATE_ID),
			]);

			await expect(aura.page).toHaveURL(/.*\/workflow\/.*onboardingId=1$/);

			const workflowNameOnboarding = await aura.canvas.getWorkflowName().getAttribute('title');
			expect(workflowNameOnboarding).toContain(`Demo: ${onboardingWorkflow.name}`);

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(4);
			await expect(aura.canvas.sticky.getStickies()).toHaveCount(1);
		});

		test('can import template', async ({ aura }) => {
			await preventNavigation(aura);

			await Promise.all([
				aura.page.waitForResponse(`https://${hostname}/api/workflows/templates/${TEMPLATE_ID}`),
				aura.page.waitForResponse('**/rest/workflows/**'),
				aura.navigate.toTemplateImport(TEMPLATE_ID),
			]);

			await expect(aura.page).toHaveURL(/\/workflow\/new\?templateId=1/);
			await expect(aura.canvas.getCanvasNodes()).toHaveCount(4);
			await expect(aura.canvas.sticky.getStickies()).toHaveCount(1);

			const workflowName = await aura.canvas.getWorkflowName().getAttribute('title');
			expect(workflowName).toContain(onboardingWorkflow.name);
		});

		test('should save template id with the workflow', async ({ aura }) => {
			await aura.templatesComposer.importFirstTemplate();

			const saveRequest = await aura.workflowComposer.saveWorkflowAndWaitForRequest();
			await expect(aura.canvas.getWorkflowSaveButton()).toContainText(NOTIFICATIONS.SAVED);

			const requestBody = saveRequest.postDataJSON();
			expect(requestBody.meta.templateId).toBe(TEMPLATE_ID);
		});

		test('can open template with images and hides workflow screenshots', async ({ aura }) => {
			await aura.navigate.toTemplate(TEMPLATE_ID);
			await expect(aura.templates.getDescription()).toBeVisible();
			await expect(aura.templates.getDescription().locator('img')).toHaveCount(1);
		});

		test('renders search elements correctly', async ({ aura }) => {
			await aura.navigate.toTemplates();

			await expect(aura.templates.getSearchInput()).toBeVisible();
			await expect(aura.templates.getAllCategoriesFilter()).toBeVisible();

			const categoryFilterCount = await aura.templates.getCategoryFilters().count();
			expect(categoryFilterCount).toBeGreaterThan(1);

			const templateCardCount = await aura.templates.getTemplateCards().count();
			expect(templateCardCount).toBeGreaterThan(0);
		});

		test('can filter templates by category', async ({ aura }) => {
			await aura.navigate.toTemplates();
			await expect(aura.templates.getTemplatesLoadingContainer()).toBeHidden();
			await expect(aura.templates.getCategoryFilter(TEST_CATEGORY)).toBeVisible();

			const initialTemplateText = await aura.templates.getTemplateCountLabel().textContent();
			const initialTemplateCount = parseCount(initialTemplateText);

			const initialCollectionText = await aura.templates.getCollectionCountLabel().textContent();
			const initialCollectionCount = parseCount(initialCollectionText);

			await aura.templates.clickCategoryFilter(TEST_CATEGORY);
			await expect(aura.templates.getTemplatesLoadingContainer()).toBeHidden();

			const finalTemplateText = await aura.templates.getTemplateCountLabel().textContent();
			const finalTemplateCount = parseCount(finalTemplateText);
			expect(finalTemplateCount).toBeLessThan(initialTemplateCount);

			const finalCollectionText = await aura.templates.getCollectionCountLabel().textContent();
			const finalCollectionCount = parseCount(finalCollectionText);
			expect(finalCollectionCount).toBeLessThan(initialCollectionCount);
		});

		test('should preserve search query in URL', async ({ aura }) => {
			await aura.navigate.toTemplates();
			await expect(aura.templates.getTemplatesLoadingContainer()).toBeHidden();
			await expect(aura.templates.getCategoryFilter(TEST_CATEGORY)).toBeVisible();

			await aura.templates.clickCategoryFilter(TEST_CATEGORY);
			await aura.templates.getSearchInput().fill('auto');

			await expect(aura.page).toHaveURL(/\?categories=/);
			await expect(aura.page).toHaveURL(/&search=/);

			await aura.page.reload();

			await expect(aura.page).toHaveURL(/\?categories=/);
			await expect(aura.page).toHaveURL(/&search=/);

			const salesFilterLabel = aura.templates.getCategoryFilter(TEST_CATEGORY).locator('label');
			await expect(salesFilterLabel).toHaveClass(/is-checked/);
			await expect(aura.templates.getSearchInput()).toHaveValue('auto');

			await expect(aura.templates.getCategoryFilters().nth(1)).toHaveText('Sales');
		});
	});
});
