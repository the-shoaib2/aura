import { test, expect } from '../../../fixtures/base';

test.describe('03 - Node Details Configuration', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should configure webhook node', async ({ aura }) => {
		await aura.canvas.addNode('Webhook');

		await aura.ndv.setupHelper.webhook({
			httpMethod: 'POST',
			path: 'test-webhook',
			authentication: 'Basic Auth',
		});

		await expect(aura.ndv.getParameterInputField('path')).toHaveValue('test-webhook');
	});

	test('should configure HTTP Request node', async ({ aura }) => {
		await aura.canvas.addNode('HTTP Request');

		await aura.ndv.setupHelper.httpRequest({
			method: 'POST',
			url: 'https://api.example.com/test',
			sendQuery: true,
			sendHeaders: false,
		});

		await expect(aura.ndv.getParameterInputField('url')).toHaveValue(
			'https://api.example.com/test',
		);
	});

	test('should auto-detect parameter types', async ({ aura }) => {
		await aura.canvas.addNode('Webhook');

		await aura.ndv.setupHelper.setParameter('httpMethod', 'PUT');
		await aura.ndv.setupHelper.setParameter('path', 'auto-detect-test');

		await expect(aura.ndv.getParameterInputField('path')).toHaveValue('auto-detect-test');
	});

	test('should use explicit types for better performance', async ({ aura }) => {
		await aura.canvas.addNode('Webhook');

		await aura.ndv.setupHelper.setParameter('httpMethod', 'PATCH', 'dropdown');
		await aura.ndv.setupHelper.setParameter('path', 'explicit-types', 'text');

		await expect(aura.ndv.getParameterInputField('path')).toHaveValue('explicit-types');
	});

	test('should configure Edit Fields node with single field', async ({ aura }) => {
		await aura.canvas.addNode('Edit Fields (Set)');

		await aura.ndv.editFields.setSingleFieldValue('testField', 'string', 'Hello World');

		const nameInput = aura.ndv.getAssignmentName('assignments', 0).getByRole('textbox');
		await expect(nameInput).toHaveValue('testField');
	});

	test('should configure Edit Fields node with multiple fields', async ({ aura }) => {
		await aura.canvas.addNode('Edit Fields (Set)');

		await aura.ndv.editFields.setFieldsValues([
			{ name: 'stringField', type: 'string', value: 'Test String' },
			{ name: 'numberField', type: 'number', value: 123 },
			{ name: 'booleanField', type: 'boolean', value: true },
		]);

		await expect(
			aura.ndv.getAssignmentCollectionContainer('assignments').getByTestId('assignment'),
		).toHaveCount(3);
	});

	test('should configure Edit Fields node with all field types', async ({ aura }) => {
		await aura.canvas.addNode('Edit Fields (Set)');

		await aura.ndv.editFields.setFieldsValues([
			{ name: 'myString', type: 'string', value: 'Hello' },
			{ name: 'myNumber', type: 'number', value: 42 },
			{ name: 'myBoolean', type: 'boolean', value: false },
			{ name: 'myArray', type: 'array', value: '["item1", "item2"]' },
		]);

		await expect(
			aura.ndv.getAssignmentCollectionContainer('assignments').getByTestId('assignment'),
		).toHaveCount(4);
	});
});
