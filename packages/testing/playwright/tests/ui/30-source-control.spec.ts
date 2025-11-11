import { addGiteaSSHKey } from 'aura-containers/aura-test-container-gitea';

import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

test.use({
	addContainerCapability: {
		sourceControl: true,
	},
});

async function setupSourceControl(aura: auraPage) {
	await aura.api.enableFeature('sourceControl');
	// This is needed because the DB reset wipes out source control preferences
	await aura.page.request.post('/rest/source-control/preferences', {
		data: {
			connectionType: 'ssh',
			keyGeneratorType: 'ed25519',
		},
	});
}

test.describe('Source Control Integration @capability:source-control', () => {
	test('should connect to Git repository using SSH', async ({ aura, auraContainer }) => {
		await setupSourceControl(aura);

		const preferencesResponse = await aura.page.request.get('/rest/source-control/preferences');
		const preferences = await preferencesResponse.json();
		const sshKey = preferences.data.publicKey;

		expect(sshKey).toBeTruthy();
		expect(sshKey).toContain('ssh-');

		// Get the source control container
		const sourceControlContainer = auraContainer.containers.find((c) =>
			c.getName().includes('gitea'),
		);
		expect(sourceControlContainer).toBeDefined();
		await addGiteaSSHKey(sourceControlContainer!, 'aura-source-control', sshKey);

		await aura.navigate.toEnvironments();

		await aura.settingsEnvironment.fillRepoUrl('ssh://git@gitea/giteaadmin/aura-test-repo.git');
		await expect(aura.settingsEnvironment.getConnectButton()).toBeEnabled();
		await aura.settingsEnvironment.getConnectButton().click();

		await expect(aura.settingsEnvironment.getDisconnectButton()).toBeVisible();
		await expect(aura.settingsEnvironment.getBranchSelect()).toBeVisible();

		await aura.settingsEnvironment.getBranchSelect().click();
		await expect(aura.page.getByRole('option', { name: 'main' })).toBeVisible();
		await expect(aura.page.getByRole('option', { name: 'development' })).toBeVisible();
		await expect(aura.page.getByRole('option', { name: 'staging' })).toBeVisible();
		await expect(aura.page.getByRole('option', { name: 'production' })).toBeVisible();
	});
});
