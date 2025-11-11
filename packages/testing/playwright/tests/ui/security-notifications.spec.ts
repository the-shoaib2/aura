import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

test.describe('Security Notifications', () => {
	async function setupVersionsApiMock(
		aura: auraPage,
		options: {
			hasSecurityIssue?: boolean;
			hasSecurityFix?: boolean;
			securityIssueFixVersion?: string;
		} = {},
	) {
		const {
			hasSecurityIssue = false,
			hasSecurityFix = false,
			securityIssueFixVersion = '',
		} = options;

		await aura.page.route('**/api/versions/**', async (route) => {
			// Extract current version from URL path
			const url = route.request().url();
			const currentVersion = url.split('/').pop() ?? '1.106.1';

			// Parse version to create next version
			const versionParts = currentVersion.split('.');
			const nextPatchVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`;

			const mockVersions = [
				{
					name: currentVersion,
					nodes: [],
					createdAt: '2025-06-24T00:00:00Z',
					description: hasSecurityIssue ? 'Current version with security issue' : 'Current version',
					documentationUrl: 'https://docs.aura.io',
					hasBreakingChange: false,
					hasSecurityFix: false,
					hasSecurityIssue,
					securityIssueFixVersion:
						securityIssueFixVersion === 'useNextPatch' ? nextPatchVersion : securityIssueFixVersion,
				},
				{
					name: nextPatchVersion,
					nodes: [],
					createdAt: '2025-06-25T00:00:00Z',
					description: hasSecurityFix ? 'Fixed version' : 'Next version',
					documentationUrl: 'https://docs.aura.io',
					hasBreakingChange: false,
					hasSecurityFix,
					hasSecurityIssue: false,
					securityIssueFixVersion: '',
				},
			];
			await route.fulfill({ json: mockVersions });
		});
	}

	async function setupApiFailure(aura: auraPage) {
		await aura.page.route('**/api/versions/**', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'API Error' }),
			});
		});
	}

	test.describe('Notifications disabled', () => {
		test.beforeEach(async ({ setupRequirements }) => {
			await setupRequirements({
				config: {
					settings: {
						versionNotifications: {
							enabled: false,
							endpoint: 'https://test.api.aura.io/api/versions/',
							whatsNewEnabled: false,
							whatsNewEndpoint: 'https://test.api.aura.io/api/whats-new',
							infoUrl: 'https://test.docs.aura.io/hosting/installation/updating/',
						},
					},
				},
			});
		});

		test('should not check for versions if feature is disabled', async ({ aura }) => {
			// Track whether any API requests are made to versions endpoint
			let versionsApiCalled = false;

			await aura.page.route('**/api/versions/**', () => {
				versionsApiCalled = true;
			});

			await aura.goHome();

			// Wait a moment for any potential API calls or notifications
			// eslint-disable-next-line playwright/no-networkidle
			await aura.page.waitForLoadState('networkidle');

			// Verify no API request was made to versions endpoint when notifications are disabled
			expect(versionsApiCalled).toBe(false);
		});
	});

	test.describe('Notifications enabled', () => {
		test.beforeEach(async ({ setupRequirements }) => {
			await setupRequirements({
				config: {
					settings: {
						versionNotifications: {
							enabled: true,
							endpoint: 'https://test.api.aura.io/api/versions/',
							whatsNewEnabled: true,
							whatsNewEndpoint: 'https://test.api.aura.io/api/whats-new',
							infoUrl: 'https://test.docs.aura.io/hosting/installation/updating/',
						},
					},
				},
			});
		});

		test('should display security notification with correct messaging and styling', async ({
			aura,
		}) => {
			await setupVersionsApiMock(aura, { hasSecurityIssue: true, hasSecurityFix: true });

			// Reload to trigger version check
			await aura.page.reload();
			await aura.goHome();

			// Verify security notification appears with default message
			const notification = aura.notifications.getNotificationByTitle('Critical update available');
			await expect(notification).toBeVisible();
			await expect(notification).toContainText('Please update to latest version.');
			await expect(notification).toContainText('More info');

			// Verify warning styling
			await expect(aura.notifications.getWarningNotifications()).toBeVisible();

			// Close the notification
			await aura.notifications.closeNotificationByText('Critical update available');

			// Now test with specific fix version
			await setupVersionsApiMock(aura, {
				hasSecurityIssue: true,
				hasSecurityFix: true,
				securityIssueFixVersion: 'useNextPatch',
			});

			// Reload to trigger new version check with fix version
			await aura.goHome();

			// Verify notification shows specific fix version (dynamically generated)
			const notificationWithFixVersion = aura.notifications.getNotificationByTitle(
				'Critical update available',
			);
			await expect(notificationWithFixVersion).toBeVisible();
			await expect(notificationWithFixVersion).toContainText('Please update to version');
			await expect(notificationWithFixVersion).toContainText('or higher.');
		});

		test('should open versions modal when clicking security notification', async ({ aura }) => {
			await setupVersionsApiMock(aura, {
				hasSecurityIssue: true,
				hasSecurityFix: true,
				securityIssueFixVersion: 'useNextPatch',
			});

			await aura.goHome();

			// Wait for and click the security notification
			const notification = aura.notifications.getNotificationByTitle('Critical update available');
			await expect(notification).toBeVisible();
			await notification.click();

			// Verify versions modal opens
			const versionsModal = aura.versions.getVersionUpdatesPanel();
			await expect(versionsModal).toBeVisible();

			// Verify security update badge exists for the new version
			const versionCard = aura.versions.getVersionCard().first();
			const securityBadge = versionCard.locator('.el-tag--danger').getByText('Security update');
			await expect(securityBadge).toBeVisible();
		});

		test('should not display security notification when theres no security issue', async ({
			aura,
		}) => {
			await setupVersionsApiMock(aura, { hasSecurityIssue: false });

			await aura.goHome();

			// Verify no security notification appears when no security issue
			const notification = aura.notifications.getNotificationByTitle('Critical update available');
			await expect(notification).toBeHidden();
		});

		test('should handle API failure gracefully', async ({ aura }) => {
			// Enable notifications but mock API failure
			await setupApiFailure(aura);

			await aura.goHome();

			// Verify no security notification appears on API failure
			const notification = aura.notifications.getNotificationByTitle('Critical update available');
			await expect(notification).toBeHidden();

			// Verify the app still functions normally
			await expect(aura.workflows.getProjectName()).toBeVisible();
		});
	});
});
