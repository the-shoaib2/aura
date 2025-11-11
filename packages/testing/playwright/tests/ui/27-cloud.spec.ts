import { test, expect } from '../../fixtures/base';
import basePlanData from '../../fixtures/plan-data-trial.json';
import type { auraPage } from '../../pages/auraPage';
import type { TestRequirements } from '../../Types';

const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
const planData = { ...basePlanData, expirationDate: fiveDaysFromNow.toJSON() };

const cloudTrialRequirements = {
	config: {
		settings: {
			deployment: { type: 'cloud' },
			auraMetadata: { userId: '1' },
			aiCredits: {
				enabled: true,
				credits: 100,
			},
			banners: {
				dismissed: ['V1'], // Prevent V1 banner interference
			},
		},
	},
	intercepts: {
		'cloud-plan': {
			url: '**/rest/admin/cloud-plan',
			response: planData,
		},
		'cloud-user': {
			url: '**/rest/cloud/proxy/user/me',
			response: {},
		},
	},
};

const setupCloudTest = async (
	aura: auraPage,
	setupRequirements: (requirements: TestRequirements) => Promise<void>,
	requirements: TestRequirements,
) => {
	await setupRequirements(requirements);
	await aura.page.waitForLoadState();
};

test.describe('Cloud @db:reset @auth:owner', () => {
	test.describe('Trial Banner', () => {
		test('should render trial banner for opt-in cloud user', async ({
			aura,
			setupRequirements,
		}) => {
			await setupCloudTest(aura, setupRequirements, cloudTrialRequirements);
			await aura.start.fromBlankCanvas();
			await aura.sideBar.expand();

			await expect(aura.sideBar.getTrialBanner()).toBeVisible();
		});
	});

	test.describe('Admin Home', () => {
		test('should show admin button', async ({ aura, setupRequirements }) => {
			await setupCloudTest(aura, setupRequirements, cloudTrialRequirements);
			await aura.start.fromBlankCanvas();
			await aura.sideBar.expand();

			await expect(aura.sideBar.getAdminPanel()).toBeVisible();
		});
	});

	test.describe('Public API', () => {
		test('should show upgrade CTA for Public API if user is trialing', async ({
			aura,
			setupRequirements,
		}) => {
			await setupCloudTest(aura, setupRequirements, cloudTrialRequirements);
			await aura.navigate.toApiSettings();

			await aura.page.waitForLoadState();

			await expect(aura.settingsPersonal.getUpgradeCta()).toBeVisible();
		});
	});

	test.describe('Easy AI workflow experiment', () => {
		test('should not show option to take you to the easy AI workflow if experiment is control', async ({
			aura,
			setupRequirements,
		}) => {
			await aura.api.setEnvFeatureFlags({ '026_easy_ai_workflow': 'control' });

			await setupCloudTest(aura, setupRequirements, cloudTrialRequirements);
			await aura.navigate.toWorkflows();

			await expect(aura.workflows.getEasyAiWorkflowCard()).toBeHidden();
		});

		test('should show option to take you to the easy AI workflow if experiment is variant', async ({
			aura,
			setupRequirements,
		}) => {
			await aura.api.setEnvFeatureFlags({ '026_easy_ai_workflow': 'variant' });

			await setupCloudTest(aura, setupRequirements, cloudTrialRequirements);
			await aura.navigate.toWorkflows();

			await expect(aura.workflows.getEasyAiWorkflowCard()).toBeVisible();
		});

		test('should show default instructions if free AI credits experiment is control', async ({
			aura,
			setupRequirements,
		}) => {
			await aura.api.setEnvFeatureFlags({ '026_easy_ai_workflow': 'variant' });

			await setupCloudTest(aura, setupRequirements, cloudTrialRequirements);
			await aura.navigate.toWorkflows();

			await aura.workflows.clickEasyAiWorkflowCard();

			await aura.page.waitForLoadState();

			const firstSticky = aura.canvas.sticky.getStickies().first();
			await expect(firstSticky).toContainText('Start by saying');
		});
	});
});
