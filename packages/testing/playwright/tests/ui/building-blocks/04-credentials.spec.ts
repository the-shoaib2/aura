import { nanoid } from 'nanoid';

import { test, expect } from '../../../fixtures/base';

test.describe('04 - Credentials', () => {
	test('composer: createFromList creates credential', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		const credentialName = `credential-${nanoid()}`;
		await aura.navigate.toCredentials(projectId);

		await aura.credentialsComposer.createFromList(
			'Notion API',
			{ apiKey: '1234567890' },
			{
				name: credentialName,
				closeDialog: false,
			},
		);
		await expect(aura.credentials.cards.getCredential(credentialName)).toBeVisible();
	});

	test('composer: createFromNdv creates credential for node', async ({ aura }) => {
		const name = `credential-${nanoid()}`;
		await aura.start.fromNewProjectBlankCanvas();
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Notion', { action: 'Append a block' });

		await aura.credentialsComposer.createFromNdv({ apiKey: '1234567890' }, { name });
		await expect(aura.ndv.getCredentialSelect()).toHaveValue(name);
	});

	test('composer: createFromApi creates credential (then NDV picks it up)', async ({ aura }) => {
		const name = `credential-${nanoid()}`;
		const projectId = await aura.start.fromNewProjectBlankCanvas();
		await aura.credentialsComposer.createFromApi({
			name,
			type: 'notionApi',
			data: { apiKey: '1234567890' },
			projectId,
		});

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Notion', { action: 'Append a block' });
		await expect(aura.ndv.getCredentialSelect()).toHaveValue(name);
	});

	test('create a new credential from empty state using the credential chooser list', async ({
		aura,
	}) => {
		const projectId = await aura.start.fromNewProject();
		await aura.navigate.toCredentials(projectId);
		await aura.credentials.emptyListCreateCredentialButton.click();
		await aura.credentials.createCredentialFromCredentialPicker('Notion API', {
			apiKey: '1234567890',
		});
		await expect(aura.credentials.cards.getCredentials()).toHaveCount(1);
	});

	test('create a new credential from the NDV', async ({ aura }) => {
		const uniqueCredentialName = `credential-${nanoid()}`;
		await aura.start.fromNewProjectBlankCanvas();
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Notion', { action: 'Append a block' });

		await aura.ndv.getNodeCredentialsSelect().click();
		await aura.ndv.credentialDropdownCreateNewCredential().click();
		await aura.canvas.credentialModal.addCredential(
			{
				apiKey: '1234567890',
			},
			{ name: uniqueCredentialName },
		);
		await expect(aura.ndv.getCredentialSelect()).toHaveValue(uniqueCredentialName);
	});

	test('add an existing credential from the NDV', async ({ aura }) => {
		const uniqueCredentialName = `credential-${nanoid()}`;
		const projectId = await aura.start.fromNewProjectBlankCanvas();

		await aura.api.credentials.createCredential({
			name: uniqueCredentialName,
			type: 'notionApi',
			data: {
				apiKey: '1234567890',
			},
			projectId,
		});

		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Notion', { action: 'Append a block' });
		await expect(aura.ndv.getCredentialSelect()).toHaveValue(uniqueCredentialName);
	});
});
