import {
	EDIT_FIELDS_SET_NODE_NAME,
	SCHEDULE_TRIGGER_NODE_NAME,
	NO_OPERATION_NODE_NAME,
	HACKER_NEWS_NODE_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';

const SCHEDULE_PARAMETER_NAME = 'daysInterval';
const HACKER_NEWS_ACTION = 'Get many items';
const HACKER_NEWS_PARAMETER_NAME = 'limit';

test.describe('Inline expression editor', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test.describe('Basic UI functionality', () => {
		test('should open and close inline expression preview', async ({ aura }) => {
			await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME);
			await aura.ndv.activateParameterExpressionEditor(SCHEDULE_PARAMETER_NAME);

			await aura.ndv.getInlineExpressionEditorInput(SCHEDULE_PARAMETER_NAME).click();
			await aura.ndv.clearExpressionEditor(SCHEDULE_PARAMETER_NAME);
			await aura.ndv.typeInExpressionEditor('{{ 123', SCHEDULE_PARAMETER_NAME);

			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('123');

			// Click outside to close
			await aura.ndv.outputPanel.get().click();
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toBeHidden();
		});

		// eslint-disable-next-line playwright/no-skipped-test
		test.skip('should switch between expression and fixed using keyboard', async ({ aura }) => {
			await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME);

			// Should switch to expression with =
			await aura.ndv.getAssignmentCollectionAdd('assignments').click();
			await aura.ndv.fillParameterInputByName('value', '=');

			// Should complete {{ --> {{ | }}
			await aura.ndv.getInlineExpressionEditorInput().click();
			await aura.ndv.typeInExpressionEditor('{{');
			await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText('{{  }}');

			// Should switch back to fixed with backspace on empty expression
			await aura.ndv.clearExpressionEditor('value');
			await expect(aura.ndv.getParameterInputHint()).toContainText('empty');
			const parameterInput = aura.ndv.getParameterInput('value').getByRole('textbox');
			await parameterInput.click();
			await parameterInput.focus();
			await parameterInput.press('Backspace');
			await expect(aura.ndv.getInlineExpressionEditorInput()).toBeHidden();
		});
	});

	test.describe('Static data', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.start.fromBlankCanvas();
			await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME);
			await aura.ndv.activateParameterExpressionEditor(SCHEDULE_PARAMETER_NAME);
		});

		test('should resolve primitive resolvables', async ({ aura }) => {
			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ 1 + 2');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('3');

			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ "ab" + "cd"');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('abcd');

			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ true && false');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('false');
		});

		test('should resolve object resolvables', async ({ aura }) => {
			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ { a: 1 }');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText(
				/^\[Object: \{"a": 1\}\]$/,
			);

			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ { a: 1 }.a');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('1');
		});

		test('should resolve array resolvables', async ({ aura }) => {
			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ [1, 2, 3]');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText(/^\[Array: \[1,2,3\]\]$/);

			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ [1, 2, 3][0]');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('1');
		});
	});

	test.describe('Dynamic data', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME);
			await aura.ndv.setPinnedData([{ myStr: 'Monday' }]);
			await aura.ndv.close();
			await aura.canvas.addNode(NO_OPERATION_NODE_NAME, { closeNDV: true });
			await aura.canvas.addNode(HACKER_NEWS_NODE_NAME, { action: HACKER_NEWS_ACTION });
			await aura.ndv.activateParameterExpressionEditor(HACKER_NEWS_PARAMETER_NAME);
		});

		test('should resolve $parameter[]', async ({ aura }) => {
			await aura.ndv.clearExpressionEditor();
			// Resolving $parameter is slow, especially on CI runner
			await aura.ndv.typeInExpressionEditor('{{ $parameter["operation"]');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('getAll');
		});

		test('should resolve input: $json,$input,$(nodeName)', async ({ aura }) => {
			// Previous nodes have not run, input is empty
			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ $json.myStr');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText(
				'[Execute previous nodes for preview]',
			);

			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ $input.item.json.myStr');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText(
				'[Execute previous nodes for preview]',
			);

			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor("{{ $('No Operation, do nothing').item.json.myStr");
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText(
				'[Execute previous nodes for preview]',
			);

			// Run workflow
			await aura.ndv.close();
			await aura.canvas.executeNode(NO_OPERATION_NODE_NAME);
			await aura.canvas.openNode(HACKER_NEWS_ACTION);
			await aura.ndv.activateParameterExpressionEditor(HACKER_NEWS_PARAMETER_NAME);

			// Previous nodes have run, input can be resolved
			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ $json.myStr');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('Monday');

			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ $input.item.json.myStr');
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('Monday');

			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor("{{ $('No Operation, do nothing').item.json.myStr");
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('Monday');
		});
	});
});
