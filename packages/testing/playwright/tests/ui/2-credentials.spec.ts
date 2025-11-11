import { nanoid } from 'nanoid';

import { test, expect } from '../../fixtures/base';

test.describe('Credentials', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
	});

	test('should create a new credential using empty state', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		const credentialName = `My awesome Notion account ${nanoid()}`;

		await aura.credentialsComposer.createFromList(
			'Notion API',
			{ apiKey: '1234567890' },
			{ name: credentialName, projectId },
		);

		await expect(aura.credentials.cards.getCredentials()).toHaveCount(1);
		await expect(aura.credentials.cards.getCredential(credentialName)).toBeVisible();
	});

	test('should sort credentials', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		const credentialA = `A Credential ${nanoid()}`;
		const credentialZ = `Z Credential ${nanoid()}`;

		await aura.api.credentials.createCredential({
			name: credentialA,
			type: 'notionApi',
			data: { apiKey: '1234567890' },
			projectId,
		});

		await aura.api.credentials.createCredential({
			name: credentialZ,
			type: 'trelloApi',
			data: { apiKey: 'test_api_key', apiToken: 'test_api_token' },
			projectId,
		});

		await aura.navigate.toCredentials(projectId);
		await aura.credentials.clearSearch();
		await aura.credentials.sortByNameDescending();

		const firstCardDescending = aura.credentials.cards.getCredentials().first();
		await expect(firstCardDescending).toContainText(credentialZ);

		await aura.credentials.sortByNameAscending();

		const firstCardAscending = aura.credentials.cards.getCredentials().first();
		await expect(firstCardAscending).toContainText(credentialA);
	});

	test('should create credentials from NDV for node with multiple auth options', async ({
		aura,
	}) => {
		await aura.start.fromNewProjectBlankCanvas();
		const credentialName = `My Google OAuth2 Account ${nanoid()}`;

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Gmail', { action: 'Send a message' });

		await aura.ndv.clickCreateNewCredential();

		await expect(
			aura.canvas.credentialModal
				.getModal()
				.getByTestId('node-auth-type-selector')
				.locator('label.el-radio'),
		).toHaveCount(2);

		await aura.canvas.credentialModal
			.getModal()
			.getByTestId('node-auth-type-selector')
			.locator('label.el-radio')
			.first()
			.click();

		await aura.canvas.credentialModal.addCredential(
			{
				clientId: 'test_client_id',
				clientSecret: 'test_client_secret',
			},
			{ name: credentialName },
		);

		await expect(aura.ndv.getCredentialSelect()).toHaveValue(credentialName);
	});

	test('should show multiple credential types in the same dropdown', async ({ aura }) => {
		const projectId = await aura.start.fromNewProjectBlankCanvas();
		const serviceAccountCredentialName2 = `OAuth2 Credential ${nanoid()}`;
		const serviceAccountCredentialName = `Service Account Credential ${nanoid()}`;

		await aura.api.credentials.createCredential({
			name: serviceAccountCredentialName2,
			type: 'googleApi',
			data: { email: 'test@service.com', privateKey: 'test_key' },
			projectId,
		});

		await aura.api.credentials.createCredential({
			name: serviceAccountCredentialName,
			type: 'googleApi',
			data: { email: 'test@service.com', privateKey: 'test_key' },
			projectId,
		});

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Gmail', { action: 'Send a message' });

		await aura.ndv.getCredentialSelect().click();
		await expect(aura.ndv.getCredentialOptionByText(serviceAccountCredentialName2)).toBeVisible();
		await expect(aura.ndv.getCredentialOptionByText(serviceAccountCredentialName)).toBeVisible();
		await expect(aura.ndv.credentialDropdownCreateNewCredential()).toBeVisible();
		await expect(aura.ndv.getCredentialDropdownOptions()).toHaveCount(2);
	});

	test('should correctly render required and optional credentials', async ({ aura }) => {
		await aura.start.fromNewProjectBlankCanvas();

		await aura.canvas.addNode('Pipedrive', { trigger: 'On new Pipedrive event' });
		await aura.ndv.selectOptionInParameterDropdown('incomingAuthentication', 'Basic Auth');
		await expect(aura.ndv.getNodeCredentialsSelect()).toHaveCount(2);

		await aura.ndv.clickCreateNewCredential(0);
		await expect(
			aura.canvas.credentialModal
				.getModal()
				.getByTestId('node-auth-type-selector')
				.locator('label.el-radio'),
		).toHaveCount(2);
		await aura.canvas.credentialModal.close();

		await aura.ndv.clickCreateNewCredential(1);
		await expect(aura.canvas.credentialModal.getModal()).toBeVisible();
		await expect(aura.canvas.credentialModal.getAuthMethodSelector()).toBeHidden();
		await aura.canvas.credentialModal.close();
	});

	test('should create credentials from NDV for node with no auth options', async ({ aura }) => {
		await aura.start.fromNewProjectBlankCanvas();
		const credentialName = `My Trello Account ${nanoid()}`;

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Trello', { action: 'Create a card' });

		await aura.credentialsComposer.createFromNdv(
			{
				apiKey: 'test_api_key',
				apiToken: 'test_api_token',
			},
			{ name: credentialName },
		);

		await expect(aura.ndv.getCredentialSelect()).toHaveValue(credentialName);
	});

	test('should delete credentials from NDV', async ({ aura }) => {
		await aura.start.fromNewProjectBlankCanvas();
		const credentialName = `Notion Credential ${nanoid()}`;

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Notion', { action: 'Append a block' });

		await aura.credentialsComposer.createFromNdv(
			{ apiKey: '1234567890' },
			{ name: credentialName },
		);
		await expect(aura.ndv.getCredentialSelect()).toHaveValue(credentialName);

		await aura.canvas.credentialModal.editCredential();
		await aura.canvas.credentialModal.deleteCredential();
		await aura.canvas.credentialModal.confirmDelete();

		await expect(
			aura.notifications.getNotificationByTitleOrContent('Credential deleted'),
		).toBeVisible();

		await expect(aura.ndv.getCredentialSelect()).not.toHaveValue(credentialName);
	});

	test('should rename credentials from NDV', async ({ aura }) => {
		await aura.start.fromNewProjectBlankCanvas();
		const initialName = `My Trello Account ${nanoid()}`;
		const renamedName = `Something else ${nanoid()}`;

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Trello', { action: 'Create a card' });

		await aura.credentialsComposer.createFromNdv(
			{
				apiKey: 'test_api_key',
				apiToken: 'test_api_token',
			},
			{ name: initialName },
		);

		await aura.canvas.credentialModal.editCredential();
		await aura.canvas.credentialModal.renameCredential(renamedName);
		await aura.canvas.credentialModal.save();
		await aura.canvas.credentialModal.close();

		await expect(aura.ndv.getCredentialSelect()).toHaveValue(renamedName);
	});

	test('should edit credential for non-standard credential type', async ({ aura }) => {
		await aura.start.fromNewProjectBlankCanvas();
		const initialName = `Adalo Credential ${nanoid()}`;
		const editedName = `Something else ${nanoid()}`;

		await aura.canvas.addNode('AI Agent', { closeNDV: true });
		await aura.canvas.addNode('HTTP Request Tool');

		await aura.ndv.selectOptionInParameterDropdown('authentication', 'Predefined Credential Type');
		await aura.ndv.selectOptionInParameterDropdown('nodeCredentialType', 'Adalo API');

		await aura.credentialsComposer.createFromNdv(
			{
				apiKey: 'test_adalo_key',
				appId: 'test_app_id',
			},
			{ name: initialName },
		);

		await aura.canvas.credentialModal.editCredential();
		await aura.canvas.credentialModal.renameCredential(editedName);
		await aura.canvas.credentialModal.save();
		await aura.canvas.credentialModal.close();

		await expect(aura.ndv.getCredentialSelect()).toHaveValue(editedName);
	});

	test('should set a default credential when adding nodes', async ({ aura }) => {
		const projectId = await aura.start.fromNewProjectBlankCanvas();
		const credentialName = `My awesome Notion account ${nanoid()}`;

		await aura.api.credentials.createCredential({
			name: credentialName,
			type: 'notionApi',
			data: { apiKey: '1234567890' },
			projectId,
		});

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Notion', { action: 'Append a block' });
		await expect(aura.ndv.getCredentialSelect()).toHaveValue(credentialName);

		const credentials = await aura.api.credentials.getCredentials();
		const credential = credentials.find((c) => c.name === credentialName);
		await aura.api.credentials.deleteCredential(credential!.id);
	});

	test('should set a default credential when editing a node', async ({ aura }) => {
		const projectId = await aura.start.fromNewProjectBlankCanvas();
		const credentialName = `My awesome Notion account ${nanoid()}`;

		await aura.api.credentials.createCredential({
			name: credentialName,
			type: 'notionApi',
			data: { apiKey: '1234567890' },
			projectId,
		});

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('HTTP Request');

		await aura.ndv.selectOptionInParameterDropdown('authentication', 'Predefined Credential Type');
		await aura.ndv.selectOptionInParameterDropdown('nodeCredentialType', 'Notion API');
		await expect(aura.ndv.getCredentialSelect()).toHaveValue(credentialName);

		const credentials = await aura.api.credentials.getCredentials();
		const credential = credentials.find((c) => c.name === credentialName);
		await aura.api.credentials.deleteCredential(credential!.id);
	});

	test('should setup generic authentication for HTTP node', async ({ aura }) => {
		await aura.start.fromNewProjectBlankCanvas();
		const credentialName = `Query Auth Credential ${nanoid()}`;

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('HTTP Request');

		await aura.ndv.selectOptionInParameterDropdown('authentication', 'Generic Credential Type');
		await aura.ndv.selectOptionInParameterDropdown('genericAuthType', 'Query Auth');

		await aura.credentialsComposer.createFromNdv(
			{
				name: 'api_key',
				value: 'test_query_value',
			},
			{ name: credentialName },
		);

		await expect(aura.ndv.getCredentialSelect()).toHaveValue(credentialName);
	});

	test('should not show OAuth redirect URL section when OAuth2 credentials are overridden', async ({
		aura,
	}) => {
		// Mock credential types response to simulate admin override
		await aura.page.route('**/rest/types/credentials.json', async (route) => {
			const response = await route.fetch();
			const json = await response.json();

			// Override Slack OAuth2 credential properties
			if (json.slackOAuth2Api) {
				json.slackOAuth2Api.__overwrittenProperties = ['clientId', 'clientSecret'];
			}

			await route.fulfill({ json });
		});

		await aura.start.fromNewProjectBlankCanvas();

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Slack', { action: 'Get a channel' });

		await aura.ndv.clickCreateNewCredential();

		await aura.canvas.credentialModal
			.getModal()
			.getByTestId('node-auth-type-selector')
			.locator('label.el-radio')
			.first()
			.click();

		await expect(aura.canvas.credentialModal.getOAuthRedirectUrl()).toBeHidden();
		await expect(aura.canvas.credentialModal.getModal()).toBeVisible();
	});

	test('ADO-2583 should show notifications above credential modal overlay', async ({ aura }) => {
		await aura.page.route('**/rest/credentials', async (route) => {
			if (route.request().method() === 'POST') {
				await route.abort('failed');
			} else {
				await route.continue();
			}
		});

		const projectId = await aura.start.fromNewProject();
		await aura.navigate.toCredentials(projectId);
		await aura.credentials.addResource.credential();
		await aura.credentials.selectCredentialType('Notion API');
		await aura.canvas.credentialModal.fillField('apiKey', '1234567890');

		const saveBtn = aura.canvas.credentialModal.getSaveButton();
		await saveBtn.click();

		const errorNotification = aura.notifications.getErrorNotifications();
		await expect(errorNotification).toBeVisible();
		await expect(aura.canvas.credentialModal.getModal()).toBeVisible();

		const modalOverlay = aura.page.locator('.el-overlay').first();
		await expect(errorNotification).toHaveCSS('z-index', '2100');
		await expect(modalOverlay).toHaveCSS('z-index', '2001');
	});
});
