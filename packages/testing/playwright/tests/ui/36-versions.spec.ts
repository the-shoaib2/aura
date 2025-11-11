import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

const requirements: TestRequirements = {
	config: {
		settings: {
			releaseChannel: 'stable',
			versionCli: '1.0.0',
			versionNotifications: {
				enabled: true,
				endpoint: 'https://api.aura.io/api/versions/',
				whatsNewEnabled: true,
				whatsNewEndpoint: 'https://api.aura.io/api/whats-new',
				infoUrl: 'https://docs.aura.io/getting-started/installation/updating.html',
			},
		},
	},
	intercepts: {
		versions: {
			url: '**/api/versions/**',
			response: [
				{
					name: '1.0.0',
					nodes: [],
					createdAt: '2025-06-01T00:00:00Z',
					description: 'Current version',
					documentationUrl: 'https://docs.aura.io',
					hasBreakingChange: false,
					hasSecurityFix: false,
					hasSecurityIssue: false,
					securityIssueFixVersion: '',
				},
				{
					name: '1.0.1',
					nodes: [],
					createdAt: '2025-06-15T00:00:00Z',
					description: 'Version 1.0.1',
					documentationUrl: 'https://docs.aura.io',
					hasBreakingChange: false,
					hasSecurityFix: false,
					hasSecurityIssue: false,
					securityIssueFixVersion: '',
				},
				{
					name: '1.0.2',
					nodes: [],
					createdAt: '2025-06-30T00:00:00Z',
					description: 'Version 1.0.2',
					documentationUrl: 'https://docs.aura.io',
					hasBreakingChange: false,
					hasSecurityFix: false,
					hasSecurityIssue: false,
					securityIssueFixVersion: '',
				},
			],
		},
	},
};

test.describe('Versions', () => {
	test('should open updates panel', async ({ aura, setupRequirements }) => {
		await setupRequirements(requirements);
		await aura.goHome();
		await aura.sideBar.expand();
		await aura.versions.openWhatsNewMenu();
		await expect(aura.versions.getVersionUpdatesPanelOpenButton()).toContainText(
			'2 versions behind',
		);

		await aura.versions.openVersionUpdatesPanel();
		await expect(aura.versions.getVersionCard()).toHaveCount(2);

		await aura.versions.closeVersionUpdatesPanel();
		await expect(aura.versions.getVersionUpdatesPanel()).toBeHidden();
	});
});
