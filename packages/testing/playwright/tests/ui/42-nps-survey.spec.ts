import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

const NOW = Date.now();
const ONE_DAY = 24 * 60 * 60 * 1000;
const THREE_DAYS = ONE_DAY * 3;
const SEVEN_DAYS = ONE_DAY * 7;
const ABOUT_SIX_MONTHS = ONE_DAY * 30 * 6 + ONE_DAY;

const ACTIVATED_USER_SETTINGS = {
	userActivated: true,
	userActivatedAt: NOW - THREE_DAYS - 1000,
};

const getNpsTestRequirements: TestRequirements = {
	config: {
		settings: {
			telemetry: {
				enabled: true,
			},
		},
	},
	intercepts: {
		npsSurveyApi: {
			url: '**/rest/user-settings/nps-survey',
			response: { success: true },
		},
		telemetryTest: {
			url: '**/test/telemetry',
			response: { status: 'ok' },
		},
		telemetryProxy: {
			url: '**/rest/telemetry/proxy',
			response: { status: 'ok' },
		},
		telemetryRudderstack: {
			url: '**/rest/telemetry/rudderstack',
			response: { status: 'ok' },
		},
	},
};

test.describe('NPS Survey', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.page.route('**/rest/login', async (route) => {
			const response = await route.fetch();
			const originalJson = await response.json();

			const modifiedData = {
				...originalJson,
				data: {
					...originalJson.data,
					settings: {
						...originalJson.data?.settings,
						...ACTIVATED_USER_SETTINGS,
					},
				},
			};

			await route.fulfill({
				status: response.status(),
				headers: response.headers(),
				contentType: 'application/json',
				body: JSON.stringify(modifiedData),
			});
		});

		await aura.goHome();
	});

	test('shows nps survey to recently activated user and can submit feedback', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(getNpsTestRequirements);
		await aura.canvas.visitWithTimestamp(NOW);
		await aura.canvas.clickSaveWorkflowButton();

		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeVisible();
		expect(await aura.npsSurvey.getRatingButtonCount()).toBe(11);

		await aura.npsSurvey.clickRating(0);
		await aura.npsSurvey.fillFeedback('aura is the best');
		await aura.npsSurvey.clickSubmitButton();

		await aura.canvas.visitWithTimestamp(NOW + ONE_DAY);
		await aura.canvas.clickSaveWorkflowButton();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeHidden();

		await aura.canvas.visitWithTimestamp(NOW + ABOUT_SIX_MONTHS);
		await aura.canvas.clickSaveWorkflowButton();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeVisible();
	});

	test('allows user to ignore survey 3 times before stopping to show until 6 months later', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(getNpsTestRequirements);
		await aura.canvas.visitWithTimestamp(NOW);
		await aura.canvas.clickSaveWorkflowButton();
		await aura.notifications.quickCloseAll();

		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeVisible();
		await aura.npsSurvey.closeSurvey();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeHidden();

		await aura.canvas.visitWithTimestamp(NOW + ONE_DAY);
		await aura.canvas.clickSaveWorkflowButton();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeHidden();

		await aura.canvas.visitWithTimestamp(NOW + SEVEN_DAYS + 10000);
		await aura.canvas.clickSaveWorkflowButton();
		await aura.notifications.quickCloseAll();

		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeVisible();
		await aura.npsSurvey.closeSurvey();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeHidden();

		await aura.canvas.visitWithTimestamp(NOW + SEVEN_DAYS + 10000);
		await aura.canvas.clickSaveWorkflowButton();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeHidden();

		await aura.canvas.visitWithTimestamp(NOW + (SEVEN_DAYS + 10000) * 2 + ONE_DAY);
		await aura.canvas.clickSaveWorkflowButton();
		await aura.notifications.quickCloseAll();

		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeVisible();
		await aura.npsSurvey.closeSurvey();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeHidden();

		await aura.canvas.visitWithTimestamp(NOW + (SEVEN_DAYS + 10000) * 2 + ONE_DAY * 2);
		await aura.canvas.clickSaveWorkflowButton();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeHidden();

		await aura.canvas.visitWithTimestamp(NOW + (SEVEN_DAYS + 10000) * 3 + ONE_DAY * 3);
		await aura.canvas.clickSaveWorkflowButton();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeHidden();

		await aura.canvas.visitWithTimestamp(NOW + (SEVEN_DAYS + 10000) * 3 + ABOUT_SIX_MONTHS);
		await aura.canvas.clickSaveWorkflowButton();
		await expect(aura.npsSurvey.getNpsSurveyModal()).toBeVisible();
	});
});
