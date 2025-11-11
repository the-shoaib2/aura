import { test, expect } from '../../fixtures/base';

test.describe('Expression editor modal', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.addInitialNodeToCanvas('Schedule Trigger');
		await aura.ndv.close();
	});

	test.describe('Keybinds', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.canvas.addNode('Hacker News', { action: 'Get many items' });
			await aura.ndv.openExpressionEditorModal('limit');
		});

		test('should save the workflow with save keybind', async ({ aura }) => {
			const input = aura.ndv.getExpressionEditorModalInput();
			await aura.ndv.fillExpressionEditorModalInput('{{ "hello"');
			await expect(aura.ndv.getExpressionEditorModalOutput()).toContainText('hello');

			await input.press('ControlOrMeta+s');
			await aura.notifications.waitForNotificationAndClose('Saved successfully');
		});
	});

	test.describe('Static data', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.canvas.addNode('Hacker News', { action: 'Get many items' });
			await aura.ndv.openExpressionEditorModal('limit');
		});

		test('should resolve primitive resolvables', async ({ aura }) => {
			const output = aura.ndv.getExpressionEditorModalOutput();

			// Test number addition
			await aura.ndv.fillExpressionEditorModalInput('{{ 1 + 2 }}');
			await expect(output).toContainText(/^3$/);

			// Test string concatenation
			await aura.ndv.fillExpressionEditorModalInput('{{ "ab" + "cd" }}');
			await expect(output).toContainText(/^abcd$/);

			// Test boolean logic
			await aura.ndv.fillExpressionEditorModalInput('{{ true && false }}');
			await expect(output).toContainText(/^false$/);
		});

		test('should resolve object resolvables', async ({ aura }) => {
			const output = aura.ndv.getExpressionEditorModalOutput();

			// Test object creation
			await aura.ndv.fillExpressionEditorModalInput('{{ { a : 1 } }}');
			await expect(output).toContainText(/^\[Object: \{"a": 1\}\]$/);

			// Test object property access
			await aura.ndv.fillExpressionEditorModalInput('{{ { a : 1 }.a }}');
			await expect(output).toContainText(/^1$/);
		});

		test('should resolve array resolvables', async ({ aura }) => {
			const output = aura.ndv.getExpressionEditorModalOutput();

			// Test array creation
			await aura.ndv.fillExpressionEditorModalInput('{{ [1, 2, 3] }}');
			await expect(output).toContainText(/^\[Array: \[1,2,3\]\]$/);

			// Test array element access
			await aura.ndv.fillExpressionEditorModalInput('{{ [1, 2, 3][0] }}');
			await expect(output).toContainText(/^1$/);
		});
	});

	test.describe('Dynamic data', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.canvas.openNode('Schedule Trigger');
			await aura.ndv.setPinnedData([{ myStr: 'Monday' }]);
			await aura.ndv.clickBackToCanvasButton();
			await aura.canvas.addNode('No Operation, do nothing', { closeNDV: true });
			await aura.canvas.addNode('Hacker News', { action: 'Get many items' });
			await aura.ndv.openExpressionEditorModal('limit');
		});

		test('should resolve $parameter[]', async ({ aura }) => {
			const output = aura.ndv.getExpressionEditorModalOutput();
			await aura.ndv.fillExpressionEditorModalInput('{{ $parameter["operation"] }}');
			await expect(output).toHaveText('getAll');
		});

		test('should resolve input: $json,$input,$(nodeName)', async ({ aura }) => {
			const output = aura.ndv.getExpressionEditorModalOutput();

			// Previous nodes have not run, input is empty
			await aura.ndv.fillExpressionEditorModalInput('{{ $json.myStr }}');
			await expect(output).toHaveText('[Execute previous nodes for preview]');
			await aura.ndv.fillExpressionEditorModalInput('{{ $input.item.json.myStr }}');
			await expect(output).toHaveText('[Execute previous nodes for preview]');
			await aura.ndv.fillExpressionEditorModalInput("{{ $('Schedule Trigger').item.json.myStr }}");
			await expect(output).toHaveText('[Execute previous nodes for preview]');

			// Run workflow
			await output.click();
			await aura.page.keyboard.press('Escape');
			await aura.ndv.clickBackToCanvasButton();
			await aura.canvas.executeNode('No Operation, do nothing');
			await aura.canvas.openNode('Get many items');
			await aura.ndv.openExpressionEditorModal('limit');

			// Previous nodes have run, input can be resolved
			await aura.ndv.fillExpressionEditorModalInput('{{ $json.myStr }}');
			await expect(output).toHaveText('Monday');
			await aura.ndv.fillExpressionEditorModalInput('{{ $input.item.json.myStr }}');
			await expect(output).toHaveText('Monday');
			await aura.ndv.fillExpressionEditorModalInput("{{ $('Schedule Trigger').item.json.myStr }}");
			await expect(output).toHaveText('Monday');
		});
	});
});
