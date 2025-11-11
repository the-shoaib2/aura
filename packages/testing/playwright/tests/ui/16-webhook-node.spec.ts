import { nanoid } from 'nanoid';

import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';
import { EditFieldsNode } from '../../pages/nodes/EditFieldsNode';

const cowBase64 =
	'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

test.describe('Webhook Trigger node', () => {
	test.describe.configure({ mode: 'serial' });
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	const HTTP_METHODS = ['GET', 'POST', 'DELETE', 'HEAD', 'PATCH', 'PUT'];
	for (const httpMethod of HTTP_METHODS) {
		test(`should listen for a ${httpMethod} request`, async ({ aura }) => {
			const webhookPath = nanoid();
			await aura.canvas.addNode('Webhook');
			await aura.ndv.setupHelper.webhook({ httpMethod, path: webhookPath });
			await aura.ndv.execute();
			await expect(aura.ndv.getWebhookTestEvent()).toBeVisible();
			const response = await aura.api.request.fetch(`/webhook-test/${webhookPath}`, {
				method: httpMethod,
			});
			expect(response.ok()).toBe(true);
		});
	}

	test('should listen for a GET request and respond with Respond to Webhook node', async ({
		aura,
	}) => {
		const webhookPath = nanoid();

		await aura.canvas.addNode('Webhook');
		await aura.ndv.setupHelper.webhook({
			httpMethod: 'GET',
			path: webhookPath,
			responseMode: "Using 'Respond to Webhook' Node",
		});
		await aura.ndv.close();
		await addEditFieldsNode(aura);
		await aura.canvas.addNode('Respond to Webhook', { closeNDV: true });

		await aura.canvas.clickExecuteWorkflowButton();
		await expect(aura.canvas.waitingForTriggerEvent()).toBeVisible();
		const response = await aura.api.request.get(`/webhook-test/${webhookPath}`);
		expect(response.ok()).toBe(true);

		const responseData = await response.json();
		expect(responseData.MyValue).toBe(1234);
	});

	test('should listen for a GET request and respond with custom status code 201', async ({
		aura,
	}) => {
		const webhookPath = nanoid();

		await aura.canvas.addNode('Webhook');
		await aura.ndv.setupHelper.webhook({ httpMethod: 'GET', path: webhookPath });

		await aura.ndv.setOptionalParameter('Response Code', 'responseCode', '201');
		await aura.ndv.execute();
		await expect(aura.ndv.getWebhookTestEvent()).toBeVisible();

		const response = await aura.api.request.get(`/webhook-test/${webhookPath}`);
		expect(response.status()).toBe(201);
	});

	test('should listen for a GET request and respond with last node', async ({ aura }) => {
		const webhookPath = nanoid();

		await aura.canvas.addNode('Webhook');
		await aura.ndv.setupHelper.webhook({
			httpMethod: 'GET',
			path: webhookPath,
			responseMode: 'When Last Node Finishes',
		});
		await aura.ndv.close();

		await addEditFieldsNode(aura);

		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.waitingForTriggerEvent()).toBeVisible();

		const response = await aura.api.request.get(`/webhook-test/${webhookPath}`);
		expect(response.ok()).toBe(true);

		const responseData = await response.json();
		expect(responseData.MyValue).toBe(1234);
	});

	test('should listen for a GET request and respond with last node binary data', async ({
		aura,
	}) => {
		const webhookPath = nanoid();

		await aura.canvas.addNode('Webhook');
		await aura.ndv.setupHelper.webhook({
			httpMethod: 'GET',
			path: webhookPath,
			responseMode: 'When Last Node Finishes',
		});
		await aura.ndv.selectOptionInParameterDropdown('responseData', 'First Entry Binary');
		await aura.ndv.close();

		await aura.canvas.addNode('Edit Fields (Set)');
		const editFieldsNode = new EditFieldsNode(aura.page);
		await editFieldsNode.setSingleFieldValue('data', 'string', cowBase64);
		await aura.ndv.close();

		await aura.canvas.addNode('Convert to File', { action: 'Convert to JSON' });
		await aura.ndv.selectOptionInParameterDropdown('mode', 'Each Item to Separate File');
		await aura.ndv.close();

		await aura.canvas.clickExecuteWorkflowButton();

		await expect(aura.canvas.waitingForTriggerEvent()).toBeVisible();

		const response = await aura.api.request.get(`/webhook-test/${webhookPath}`);
		expect(response.ok()).toBe(true);

		const responseData = await response.json();
		expect('data' in responseData).toBe(true);
	});

	test('should listen for a GET request and respond with an empty body', async ({ aura }) => {
		const webhookPath = nanoid();

		await aura.canvas.addNode('Webhook');
		await aura.ndv.setupHelper.webhook({
			httpMethod: 'GET',
			path: webhookPath,
			responseMode: 'When Last Node Finishes',
		});
		await aura.ndv.selectOptionInParameterDropdown('responseData', 'No Response Body');
		await aura.ndv.execute();
		await expect(aura.ndv.getWebhookTestEvent()).toBeVisible();

		const response = await aura.api.request.get(`/webhook-test/${webhookPath}`);
		expect(response.ok()).toBe(true);

		const responseData = await response.text();
		expect(responseData).toBe('');
	});

	test('should listen for a GET request with Basic Authentication', async ({ aura }) => {
		const webhookPath = nanoid();
		const credentialName = `test-${nanoid()}`;
		const user = `test-${nanoid()}`;
		const password = `test-${nanoid()}`;
		await aura.credentialsComposer.createFromApi({
			type: 'httpBasicAuth',
			name: credentialName,
			data: {
				user,
				password,
			},
		});

		await aura.canvas.addNode('Webhook');
		await aura.ndv.setupHelper.webhook({
			httpMethod: 'GET',
			path: webhookPath,
			authentication: 'Basic Auth',
		});

		await aura.ndv.execute();
		await expect(aura.ndv.getWebhookTestEvent()).toBeVisible();

		const failResponse = await aura.api.request.get(`/webhook-test/${webhookPath}`, {
			headers: {
				Authorization: 'Basic ' + Buffer.from('wrong:wrong').toString('base64'),
			},
		});
		expect(failResponse.status()).toBe(403);

		const successResponse = await aura.api.request.get(`/webhook-test/${webhookPath}`, {
			headers: {
				Authorization: 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
			},
		});
		expect(successResponse.ok()).toBe(true);
	});

	test('should listen for a GET request with Header Authentication', async ({ aura, api }) => {
		const webhookPath = nanoid();
		const credentialName = `test-${nanoid()}`;
		const name = `test-${nanoid()}`;
		const value = `test-${nanoid()}`;
		await aura.credentialsComposer.createFromApi({
			type: 'httpHeaderAuth',
			name: credentialName,
			data: {
				name,
				value,
			},
		});

		await aura.canvas.addNode('Webhook');
		await aura.ndv.setupHelper.webhook({
			httpMethod: 'GET',
			path: webhookPath,
			authentication: 'Header Auth',
		});

		await aura.ndv.execute();
		await expect(aura.ndv.getWebhookTestEvent()).toBeVisible();

		const failResponse = await api.request.get(`/webhook-test/${webhookPath}`, {
			headers: {
				test: 'wrong',
			},
		});

		expect(failResponse.status()).toBe(403);

		const successResponse = await api.request.get(`/webhook-test/${webhookPath}`, {
			headers: {
				[name]: value,
			},
		});
		expect(successResponse.ok()).toBe(true);
	});
});

async function addEditFieldsNode(aura: auraPage): Promise<void> {
	await aura.canvas.addNode('Edit Fields (Set)');

	const editFieldsNode = new EditFieldsNode(aura.page);
	await editFieldsNode.setSingleFieldValue('MyValue', 'number', 1234);

	await aura.ndv.close();
}
