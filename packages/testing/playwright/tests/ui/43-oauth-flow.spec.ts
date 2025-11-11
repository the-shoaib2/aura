import { test, expect } from '../../fixtures/base';

test.describe('OAuth Credentials', () => {
	test('should create and connect with Google OAuth2', async ({ aura }) => {
		const projectId = await aura.start.fromNewProjectBlankCanvas();
		await aura.navigate.toCredentials(projectId);
		await aura.credentials.emptyListCreateCredentialButton.click();
		await aura.credentials.createCredentialFromCredentialPicker(
			'Google OAuth2 API',
			{
				clientId: 'test-key',
				clientSecret: 'test-secret',
			},
			{ closeDialog: false },
		);

		const popupPromise = aura.page.waitForEvent('popup');
		await aura.credentials.credentialModal.oauthConnectButton.click();

		const popup = await popupPromise;
		const popupUrl = popup.url();
		expect(popupUrl).toContain('accounts.google.com');
		expect(popupUrl).toContain('client_id=test-key');

		await popup.close();

		await aura.page.evaluate(() => {
			const channel = new BroadcastChannel('oauth-callback');
			channel.postMessage('success');
		});

		await expect(aura.credentials.credentialModal.oauthConnectSuccessBanner).toContainText(
			'Account connected',
		);
	});
});
