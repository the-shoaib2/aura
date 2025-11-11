import { test, expect } from '../../fixtures/base';

test.describe('Data Mapping', () => {
	test.describe
		.serial('Expression Preview', () => {
			test('maps expressions from table json, and resolves value based on hover', async ({
				aura,
			}) => {
				// This test is marked as serial because hover/tooltips are unreliable when running in parallel against a single server due to resource contention.

				await aura.start.fromImportedWorkflow('Test_workflow_3.json');
				await aura.canvas.openNode('Set');
				await aura.ndv.inputPanel.switchDisplayMode('table');

				await expect(aura.ndv.inputPanel.getTable()).toBeVisible();

				await expect(aura.ndv.getParameterInputField('name')).toHaveValue('other');
				await expect(aura.ndv.getParameterInputField('value')).toHaveValue('');

				const countCell = aura.ndv.inputPanel.getTableCellSpan(0, 0, 'count');
				await expect(countCell).toBeVisible();

				const valueParameter = aura.ndv.getParameterInput('value');
				await aura.interactions.precisionDragToTarget(countCell, valueParameter, 'bottom');

				await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
					'{{ $json.input[0].count }}',
				);
				await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('0');

				await aura.ndv.inputPanel.getTbodyCell(0, 0).hover();
				await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('0');

				await aura.ndv.inputPanel.getTbodyCell(1, 0).hover();
				await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('1');

				await aura.ndv.execute();

				await expect(aura.ndv.outputPanel.getTable()).toBeVisible();

				await aura.ndv.outputPanel.getTbodyCell(0, 0).hover();
				await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('0');

				await aura.ndv.outputPanel.getTbodyCell(1, 0).hover();
				await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('1');
			});
		});
	test('maps expressions from json view', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_3.json');
		await aura.canvas.openNode('Set');
		await aura.ndv.inputPanel.switchDisplayMode('json');

		const expectedJsonText =
			'[  {    "input": [      {        "count": 0,        "with space": "!!",        "with.dot": "!!",        "with"quotes": "!!"      }    ]  },  {    "input": [      {        "count": 1      }    ]  }]';
		await expect(async () => {
			await expect(aura.ndv.inputPanel.get().getByText(expectedJsonText)).toBeVisible();
		}).toPass({ timeout: 1000 });

		await expect(aura.ndv.inputPanel.getJsonDataContainer()).toBeVisible();

		const inputSpan = aura.ndv.inputPanel.getJsonProperty('input');
		await expect(inputSpan).toBeVisible();

		const valueParameterInput = aura.ndv.getParameterInput('value');
		await expect(valueParameterInput).toBeVisible();

		await inputSpan.dragTo(valueParameterInput);

		const expressionEditor = aura.ndv.getInlineExpressionEditorInput();
		await expect(expressionEditor).toBeVisible();
		await expect(expressionEditor).toHaveText('{{ $json.input }}');

		await aura.page.keyboard.press('Escape');

		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('Array:');
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('"count": 0');

		const countSpan = aura.ndv.inputPanel.getJsonPropertyContaining('count');
		await expect(countSpan).toBeVisible();

		await aura.interactions.precisionDragToTarget(
			countSpan,
			aura.ndv.getInlineExpressionEditorInput(),
			'bottom',
		);

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			'{{ $json.input }}{{ $json.input[0].count }}',
		);

		await aura.page.keyboard.press('Escape');

		const previewElement = aura.ndv.getParameterExpressionPreviewValue();
		await expect(previewElement).toBeVisible();
	});

	test('maps expressions from previous nodes', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_3.json');
		await aura.canvas.openNode('Set1');
		await aura.ndv.executePrevious();

		const scheduleNode = aura.ndv.inputPanel.get().getByText('Schedule Trigger');
		await expect(scheduleNode).toBeVisible();
		await scheduleNode.click();

		const schemaItem = aura.ndv.inputPanel.getSchemaItemText('count');
		await expect(schemaItem).toBeVisible();

		const valueParameterInput = aura.ndv.getParameterInput('value');
		await expect(valueParameterInput).toBeVisible();

		await aura.interactions.precisionDragToTarget(
			schemaItem.locator('span'),
			valueParameterInput,
			'top',
		);

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			"{{ $('Schedule Trigger').item.json.input[0].count }}",
		);

		await aura.page.keyboard.press('Escape');

		await aura.ndv.inputPanel.switchDisplayMode('table');
		await aura.ndv.selectInputNode('Schedule Trigger');

		const headerElement = aura.ndv.inputPanel.getTableHeader(0);
		await expect(headerElement).toBeVisible();

		await aura.interactions.precisionDragToTarget(
			headerElement,
			aura.ndv.getInlineExpressionEditorInput(),
			'top',
		);

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			"{{ $('Schedule Trigger').item.json.input }}{{ $('Schedule Trigger').item.json.input[0].count }}",
		);

		await aura.ndv.selectInputNode('Set');
	});
	test('maps expressions from table header', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow-actions_paste-data.json');
		await aura.canvas.openNode('Set');
		await aura.ndv.executePrevious();
		await aura.ndv.inputPanel.switchDisplayMode('table');

		await expect(aura.ndv.inputPanel.getTable()).toBeVisible();

		const addValueButton = aura.ndv.getAddValueButton();
		await expect(addValueButton).toBeVisible();
		await addValueButton.click();

		await aura.page.getByRole('option', { name: 'String' }).click();

		await expect(aura.ndv.getParameterInputField('name')).toHaveValue('propertyName');
		await expect(aura.ndv.getParameterInputField('value')).toHaveValue('');

		const firstHeader = aura.ndv.inputPanel.getTableHeader(0);
		await expect(firstHeader).toBeVisible();

		const valueParameter = aura.ndv.getParameterInput('value');
		await aura.interactions.precisionDragToTarget(firstHeader, valueParameter, 'bottom');

		await expect(aura.ndv.getInlineExpressionEditorInput()).toBeVisible();
		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText('{{ $json.timestamp }}');

		await aura.page.keyboard.press('Escape');

		const currentYear = new Date().getFullYear().toString();
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText(currentYear);

		const secondHeader = aura.ndv.inputPanel.getTableHeader(1);
		await expect(secondHeader).toBeVisible();

		await aura.interactions.precisionDragToTarget(
			secondHeader,
			aura.ndv.getInlineExpressionEditorInput(),
			'top',
		);

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			"{{ $json['Readable date'] }}{{ $json.timestamp }}",
		);
	});

	test('maps expressions from schema view', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_3.json');
		await aura.canvas.openNode('Set');

		await aura.ndv.getParameterInputField('value').clear();
		await aura.page.keyboard.press('Escape');

		const countSchemaItem = aura.ndv.inputPanel.getSchemaItemText('count');
		await expect(countSchemaItem).toBeVisible();

		const valueParameter = aura.ndv.getParameterInput('value');
		await aura.interactions.precisionDragToTarget(countSchemaItem, valueParameter, 'bottom');

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			'{{ $json.input[0].count }}',
		);
		await aura.page.keyboard.press('Escape');
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('0');

		const inputSchemaItem = aura.ndv.inputPanel.getSchemaItemText('input');
		await expect(inputSchemaItem).toBeVisible();

		await aura.interactions.precisionDragToTarget(inputSchemaItem, valueParameter, 'top');

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			'{{ $json.input }}{{ $json.input[0].count }}',
		);
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('[object Object]0');
	});

	test('maps keys to path', async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.openNode('When clicking ‘Execute workflow’');

		await aura.ndv.setPinnedData([
			{
				input: [
					{
						'hello.world': {
							'my count': 0,
						},
					},
				],
			},
			{
				input: [
					{
						'hello.world': {
							'my count': 1,
						},
					},
				],
			},
		]);

		await aura.ndv.close();

		await aura.canvas.addNode('Sort');

		const addFieldButton = aura.ndv.getAddFieldToSortByButton();
		await addFieldButton.click();

		const myCountSpan = aura.ndv.inputPanel.getSchemaItemText('my count');
		await expect(myCountSpan).toBeVisible();

		const fieldNameParameter = aura.ndv.getParameterInput('fieldName');
		await aura.interactions.precisionDragToTarget(myCountSpan, fieldNameParameter, 'bottom');

		await expect(aura.ndv.getInlineExpressionEditorInput()).toBeHidden();
		await expect(aura.ndv.getParameterInputField('fieldName')).toHaveValue(
			"input[0]['hello.world']['my count']",
		);
	});

	// There is an issue here sometimes, when dragging to the target it prepends the last value that was in the window even if it was cleared
	// eslint-disable-next-line playwright/no-skipped-test
	test.skip('maps expressions to updated fields correctly', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_3.json');
		await aura.canvas.openNode('Set');

		await aura.ndv.fillParameterInputByName('value', 'delete me');
		await aura.ndv.fillParameterInputByName('name', 'test');
		await aura.ndv.getParameterInputField('name').blur();

		await aura.ndv.fillParameterInputByName('value', 'fun');
		await aura.ndv.getParameterInputField('value').clear();

		const countSchemaItem = aura.ndv.inputPanel.getSchemaItemText('count');
		await expect(countSchemaItem).toBeVisible();

		const valueParameter = aura.ndv.getParameterInput('value');
		await aura.interactions.precisionDragToTarget(countSchemaItem, valueParameter, 'bottom');

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			'{{ $json.input[0].count }}',
		);
		await aura.page.keyboard.press('Escape');
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('0');

		const inputSchemaItem = aura.ndv.inputPanel.getSchemaItemText('input');
		await expect(inputSchemaItem).toBeVisible();

		await aura.interactions.precisionDragToTarget(inputSchemaItem, valueParameter, 'top');

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			'{{ $json.input }}{{ $json.input[0].count }}',
		);
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('[object Object]0');
	});

	test('renders expression preview when a previous node is selected', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_3.json');
		await aura.canvas.openNode('Set');

		await aura.ndv.fillParameterInputByName('value', 'test_value');
		await aura.ndv.fillParameterInputByName('name', 'test_name');
		await aura.ndv.close();

		await aura.canvas.openNode('Set1');
		await aura.ndv.executePrevious();
		await aura.ndv.inputPanel.switchDisplayMode('table');

		const firstHeader = aura.ndv.inputPanel.getTableHeader(0);
		await expect(firstHeader).toBeVisible();

		const valueParameter = aura.ndv.getParameterInput('value');
		await aura.interactions.precisionDragToTarget(firstHeader, valueParameter, 'bottom');

		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('test_value');

		await aura.ndv.selectInputNode('Schedule Trigger');
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('test_value');
	});

	test('shows you can drop to inputs, including booleans', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_3.json');
		await aura.canvas.openNode('Set');

		await expect(aura.ndv.getParameterSwitch('includeOtherFields')).toBeVisible();
		await expect(aura.ndv.getParameterTextInput('includeOtherFields')).toBeHidden();

		const countSpan = aura.ndv.inputPanel.getSchemaItemText('count');
		await expect(countSpan).toBeVisible();

		await countSpan.hover();
		await aura.page.mouse.down();
		await aura.page.mouse.move(100, 100);

		await expect(aura.ndv.getParameterSwitch('includeOtherFields')).toBeHidden();
		await expect(aura.ndv.getParameterTextInput('includeOtherFields')).toBeVisible();

		const includeOtherFieldsInput = aura.ndv.getParameterTextInput('includeOtherFields');
		await expect(includeOtherFieldsInput).toHaveCSS('border', /dashed.*rgb\(90, 76, 194\)/);

		const valueInput = aura.ndv.getParameterTextInput('value');
		await expect(valueInput).toHaveCSS('border', /dashed.*rgb\(90, 76, 194\)/);

		await aura.page.mouse.up();
	});

	test('maps expressions to a specific location in the editor', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_3.json');
		await aura.canvas.openNode('Set');

		await aura.ndv.fillParameterInputByName('value', '=');
		await aura.ndv.getInlineExpressionEditorContent().fill('hello world\n\nnewline');
		await aura.page.keyboard.press('Escape');

		const countSchemaItem = aura.ndv.inputPanel.getSchemaItemText('count');
		await expect(countSchemaItem).toBeVisible();

		const valueParameter = aura.ndv.getParameterInput('value');
		await aura.interactions.precisionDragToTarget(countSchemaItem, valueParameter, 'top');

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			'{{ $json.input[0].count }}hello worldnewline',
		);
		await aura.page.keyboard.press('Escape');
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText(
			'0hello world\n\nnewline',
		);

		const inputSchemaItem = aura.ndv.inputPanel.getSchemaItemText('input');
		await expect(inputSchemaItem).toBeVisible();

		await aura.interactions.precisionDragToTarget(inputSchemaItem, valueParameter, 'center');

		await expect(aura.ndv.getInlineExpressionEditorInput()).toHaveText(
			'{{ $json.input[0].count }}hello world{{ $json.input }}newline',
		);
	});
});
