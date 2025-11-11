import fs from 'fs';

import { MANUAL_TRIGGER_NODE_DISPLAY_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';
import { resolveFromRoot } from '../../utils/path-helper';

test.describe('Editors', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.addInitialNodeToCanvas('Manual Trigger');
	});

	test.describe('SQL Editor', () => {
		test('should preserve changes when opening-closing Postgres node', async ({ aura }) => {
			await aura.canvas.addNode('Postgres', { action: 'Execute a SQL query' });

			const sqlEditor = aura.ndv.getParameterEditor('query');
			await sqlEditor.click();
			await sqlEditor.fill('SELECT * FROM `testTable`');
			await aura.page.keyboard.press('Escape');

			await aura.ndv.close();
			await aura.canvas.openNode('Execute a SQL query');

			await sqlEditor.click();
			await sqlEditor.press('End');
			await sqlEditor.pressSequentially(' LIMIT 10');
			await aura.page.keyboard.press('Escape');

			await aura.ndv.close();
			await aura.canvas.openNode('Execute a SQL query');

			await expect(sqlEditor).toContainText('SELECT * FROM `testTable` LIMIT 10');
		});

		test('should update expression output dropdown as the query is edited', async ({ aura }) => {
			await aura.canvas.addNode('MySQL', { action: 'Execute a SQL query', closeNDV: true });

			await aura.canvas.openNode(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
			await aura.ndv.setPinnedData([{ table: 'test_table' }]);
			await aura.ndv.close();

			await aura.canvas.openNode('Execute a SQL query');

			const sqlEditor = aura.ndv.getParameterEditor('query');
			await sqlEditor.click();
			await sqlEditor.fill('SELECT * FROM {{ $json.table }}');

			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText(
				'SELECT * FROM test_table',
			);
		});

		test('should not push NDV header out with a lot of code in Postgres editor', async ({
			aura,
		}) => {
			await aura.canvas.addNode('Postgres', { action: 'Execute a SQL query' });

			const dummyCode = fs.readFileSync(
				resolveFromRoot('fixtures', 'Dummy_javascript.txt'),
				'utf8',
			);

			const sqlEditor = aura.ndv.getParameterEditor('query');
			await sqlEditor.click();

			await aura.clipboard.paste(dummyCode);

			await expect(aura.ndv.getExecuteNodeButton()).toBeVisible();
		});

		test('should not push NDV header out with a lot of code in MySQL editor', async ({ aura }) => {
			await aura.canvas.addNode('MySQL', { action: 'Execute a SQL query' });

			const dummyCode = fs.readFileSync(
				resolveFromRoot('fixtures', 'Dummy_javascript.txt'),
				'utf8',
			);

			const sqlEditor = aura.ndv.getParameterEditor('query');
			await sqlEditor.click();
			await aura.clipboard.paste(dummyCode);

			await expect(aura.ndv.getExecuteNodeButton()).toBeVisible();
		});

		test('should not trigger dirty flag if nothing is changed', async ({ aura }) => {
			await aura.canvas.addNode('Postgres', { action: 'Execute a SQL query' });
			await aura.ndv.close();

			await aura.canvas.saveWorkflow();
			await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');

			await aura.canvas.openNode('Execute a SQL query');
			await aura.ndv.close();

			await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
		});

		test('should trigger dirty flag if query is updated', async ({ aura }) => {
			await aura.canvas.addNode('Postgres', { action: 'Execute a SQL query' });
			await aura.ndv.close();

			await aura.canvas.saveWorkflow();
			await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');

			await aura.canvas.openNode('Execute a SQL query');

			const sqlEditor = aura.ndv.getParameterEditor('query');
			await sqlEditor.click();
			await sqlEditor.fill('SELECT * FROM `testTable`');
			await aura.page.keyboard.press('Escape');

			await aura.ndv.close();

			await expect(aura.canvas.getWorkflowSaveButton()).not.toContainText('Saved');
		});

		test('should allow switching between SQL editors in connected nodes', async ({ aura }) => {
			await aura.canvas.addNode('Postgres', { action: 'Execute a SQL query' });

			const sqlEditor = aura.ndv.getParameterEditor('query');
			await sqlEditor.click();
			await aura.clipboard.paste('SELECT * FROM `firstTable`');

			await aura.ndv.close();

			await aura.canvas.addNode('Postgres', { action: 'Execute a SQL query' });

			await sqlEditor.click();
			await aura.clipboard.paste('SELECT * FROM `secondTable`');

			await aura.ndv.close();

			await aura.canvas.openNode('Execute a SQL query');

			await aura.ndv.clickFloatingNode('Execute a SQL query1');
			await expect(sqlEditor).toHaveText('SELECT * FROM `secondTable`');

			await aura.ndv.clickFloatingNode('Execute a SQL query');
			await expect(sqlEditor).toHaveText('SELECT * FROM `firstTable`');
		});
	});

	test.describe('HTML Editor', () => {
		const TEST_ELEMENT_H1 = '<h1>Test</h1>';
		const TEST_ELEMENT_P = '<p>Test</p>';

		test('should preserve changes when opening-closing HTML node', async ({ aura }) => {
			await aura.canvas.addNode('HTML', { action: 'Generate HTML template' });

			const htmlEditor = aura.ndv.getParameterEditor('html');
			await htmlEditor.click();
			await htmlEditor.press('ControlOrMeta+A');
			await htmlEditor.fill(TEST_ELEMENT_H1);
			await aura.page.keyboard.press('Escape');

			await aura.ndv.close();
			await aura.canvas.openNode('HTML');

			await htmlEditor.click();
			await htmlEditor.press('End');
			await htmlEditor.pressSequentially(TEST_ELEMENT_P);
			await aura.page.keyboard.press('Escape');

			await aura.ndv.close();
			await aura.canvas.openNode('HTML');

			await expect(htmlEditor).toContainText(TEST_ELEMENT_H1);
			await expect(htmlEditor).toContainText(TEST_ELEMENT_P);
		});

		test('should not trigger dirty flag if nothing is changed', async ({ aura }) => {
			await aura.canvas.addNode('HTML', { action: 'Generate HTML template' });
			await aura.ndv.close();

			await aura.canvas.saveWorkflow();
			await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');

			await aura.canvas.openNode('HTML');
			await aura.ndv.close();

			await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
		});

		test('should trigger dirty flag if query is updated', async ({ aura }) => {
			await aura.canvas.addNode('HTML', { action: 'Generate HTML template' });
			await aura.ndv.close();

			await aura.canvas.saveWorkflow();
			await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');

			await aura.canvas.openNode('HTML');

			const htmlEditor = aura.ndv.getParameterEditor('html');
			await htmlEditor.click();
			await htmlEditor.press('ControlOrMeta+A');
			await htmlEditor.fill(TEST_ELEMENT_H1);
			await aura.page.keyboard.press('Escape');

			await aura.ndv.close();

			await expect(aura.canvas.getWorkflowSaveButton()).not.toContainText('Saved');
		});

		test('should allow switching between HTML editors in connected nodes', async ({ aura }) => {
			await aura.canvas.addNode('HTML', { action: 'Generate HTML template' });

			const htmlEditor = aura.ndv.getParameterEditor('html');
			await htmlEditor.click();
			await htmlEditor.press('ControlOrMeta+A');
			await aura.clipboard.paste('<div>First</div>');

			await aura.ndv.close();

			await aura.canvas.addNode('HTML', { action: 'Generate HTML template' });

			await htmlEditor.click();
			await htmlEditor.press('ControlOrMeta+A');
			await aura.clipboard.paste('<div>Second</div>');

			await aura.ndv.close();

			await aura.canvas.openNode('HTML');

			await aura.ndv.clickFloatingNode('HTML1');
			await expect(htmlEditor).toHaveText('<div>Second</div>');

			await aura.ndv.clickFloatingNode('HTML');
			await expect(htmlEditor).toHaveText('<div>First</div>');
		});
	});
});
