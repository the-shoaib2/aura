import {
	CODE_NODE_NAME,
	CODE_NODE_DISPLAY_NAME,
	MANUAL_TRIGGER_NODE_DISPLAY_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

test.describe('NDV', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should show up when double clicked on a node and close when Back to canvas clicked', async ({
		aura,
	}) => {
		await aura.canvas.addNode('Manual Trigger');
		const canvasNodes = aura.canvas.getCanvasNodes();
		await canvasNodes.first().dblclick();
		await expect(aura.ndv.getContainer()).toBeVisible();
		await aura.ndv.clickBackToCanvasButton();
		await expect(aura.ndv.getContainer()).toBeHidden();
	});

	test('should show input panel when node is not connected', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.deselectAll();
		await aura.canvas.addNode('Edit Fields (Set)', { closeNDV: true });
		const canvasNodes = aura.canvas.getCanvasNodes();
		await canvasNodes.last().dblclick();
		await expect(aura.ndv.getContainer()).toBeVisible();
		await expect(aura.ndv.inputPanel.get()).toContainText('Wire me up');
	});

	test('should test webhook node', async ({ aura }) => {
		await aura.canvas.addNode('Webhook', { closeNDV: false });

		await aura.ndv.execute();

		const webhookUrl = await aura.ndv.getWebhookUrl();
		await expect(aura.ndv.getWebhookTriggerListening()).toBeVisible();
		const response = await aura.ndv.makeWebhookRequest(webhookUrl as string);
		expect(response.status()).toBe(200);

		await expect(aura.ndv.outputPanel.get()).toBeVisible();
		await expect(aura.ndv.outputPanel.getDataContainer()).toBeVisible();
	});

	test('should change input and go back to canvas', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('NDV-test-select-input.json');
		await aura.canvas.clickZoomToFitButton();
		await aura.canvas.getCanvasNodes().last().dblclick();
		await aura.ndv.execute();

		await aura.ndv.inputPanel.switchDisplayMode('table');

		await aura.ndv.inputPanel.getNodeInputOptions().last().click();

		await expect(aura.ndv.inputPanel.get()).toContainText('start');

		await aura.ndv.clickBackToCanvasButton();
		await expect(aura.ndv.getContainer()).toBeHidden();
	});

	test('should show correct validation state for resource locator params', async ({ aura }) => {
		await aura.canvas.addNode('Typeform Trigger', { closeNDV: false });
		await expect(aura.ndv.getContainer()).toBeVisible();

		await aura.ndv.clickBackToCanvasButton();

		await aura.canvas.openNode('Typeform Trigger');
		await expect(aura.canvas.getNodeIssuesByName('Typeform Trigger')).toBeVisible();
	});

	test('should show validation errors only after blur or re-opening of NDV', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Airtable', { closeNDV: false, action: 'Search records' });
		await expect(aura.ndv.getContainer()).toBeVisible();

		await expect(aura.canvas.getNodeIssuesByName('Airtable')).toBeHidden();

		await aura.ndv.getParameterInputField('table').nth(1).focus();
		await aura.ndv.getParameterInputField('table').nth(1).blur();
		await aura.ndv.getParameterInputField('base').nth(1).focus();
		await aura.ndv.getParameterInputField('base').nth(1).blur();

		await expect(aura.ndv.getParameterInput('base')).toHaveClass(/has-issues|error|invalid/);
		await expect(aura.ndv.getParameterInput('table')).toHaveClass(/has-issues|error|invalid/);

		await aura.ndv.clickBackToCanvasButton();

		await aura.canvas.openNode('Search records');
		await expect(aura.canvas.getNodeIssuesByName('Search records')).toBeVisible();
	});

	test('should show all validation errors when opening pasted node', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_ndv_errors.json');
		const canvasNodes = aura.canvas.getCanvasNodes();
		await expect(canvasNodes).toHaveCount(1);

		await aura.canvas.openNode('Airtable');
		await expect(aura.canvas.getNodeIssuesByName('Airtable')).toBeVisible();
	});

	test('should render run errors correctly', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_ndv_run_error.json');
		await aura.canvas.openNode('Error');
		await aura.ndv.execute();

		await expect(aura.ndv.getNodeRunErrorMessage()).toHaveText(
			"Paired item data for item from node 'Break pairedItem chain' is unavailable. Ensure 'Break pairedItem chain' is providing the required output.",
		);

		await expect(aura.ndv.getNodeRunErrorDescription()).toContainText(
			"An expression here won't work because it uses .item and aura can't figure out the matching item.",
		);

		await expect(aura.ndv.getNodeRunErrorMessage()).toBeVisible();
		await expect(aura.ndv.getNodeRunErrorDescription()).toBeVisible();
	});

	test('should save workflow using keyboard shortcut from NDV', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Edit Fields (Set)', { closeNDV: false });
		await expect(aura.ndv.getContainer()).toBeVisible();

		await aura.page.keyboard.press('ControlOrMeta+s');

		await expect(aura.canvas.getWorkflowSaveButton()).toBeHidden();
	});

	test('webhook should fallback to webhookId if path is empty', async ({ aura }) => {
		await aura.canvas.addNode('Webhook', { closeNDV: false });

		await expect(aura.canvas.getNodeIssuesByName('Webhook')).toBeHidden();
		await expect(aura.ndv.getExecuteNodeButton()).toBeEnabled();
		await expect(aura.ndv.getTriggerPanelExecuteButton()).toBeVisible();

		await aura.ndv.getParameterInputField('path').clear();

		const webhookUrlsContainer = aura.ndv.getContainer().getByText('Webhook URLs').locator('..');
		const urlText = await webhookUrlsContainer.textContent();
		const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
		expect(urlText).toMatch(uuidRegex);

		await aura.ndv.close();

		await aura.canvas.openNode('Webhook');
		await aura.ndv.fillParameterInput('path', 'test-path');

		const updatedUrlText = await webhookUrlsContainer.textContent();
		expect(updatedUrlText).toContain('test-path');
		expect(updatedUrlText).not.toMatch(uuidRegex);
	});

	test.describe('test output schema view', () => {
		const schemaKeys = [
			'id',
			'name',
			'email',
			'notes',
			'country',
			'created',
			'objectValue',
			'prop1',
			'prop2',
		];

		const setupSchemaWorkflow = async (aura: auraPage) => {
			await aura.start.fromImportedWorkflow('Test_workflow_schema_test.json');
			await aura.canvas.clickZoomToFitButton();
			await aura.canvas.openNode('Set');
			await aura.ndv.execute();
		};

		test('should switch to output schema view and validate it', async ({ aura }) => {
			await setupSchemaWorkflow(aura);
			await aura.ndv.outputPanel.switchDisplayMode('schema');

			for (const key of schemaKeys) {
				await expect(aura.ndv.outputPanel.getSchemaItem(key)).toBeVisible();
			}
		});

		test('should preserve schema view after execution', async ({ aura }) => {
			await setupSchemaWorkflow(aura);
			await aura.ndv.outputPanel.switchDisplayMode('schema');
			await aura.ndv.execute();

			for (const key of schemaKeys) {
				await expect(aura.ndv.outputPanel.getSchemaItem(key)).toBeVisible();
			}
		});

		test('should collapse and expand nested schema object', async ({ aura }) => {
			await setupSchemaWorkflow(aura);
			const expandedObjectProps = ['prop1', 'prop2'];

			await aura.ndv.outputPanel.switchDisplayMode('schema');

			for (const key of expandedObjectProps) {
				await expect(aura.ndv.outputPanel.getSchemaItem(key)).toBeVisible();
			}

			const objectValueItem = aura.ndv.outputPanel.getSchemaItem('objectValue');
			await objectValueItem.locator('.toggle').click();

			for (const key of expandedObjectProps) {
				await expect(aura.ndv.outputPanel.getSchemaItem(key)).not.toBeInViewport();
			}
		});

		test('should not display pagination for schema', async ({ aura }) => {
			await setupSchemaWorkflow(aura);

			await aura.ndv.clickBackToCanvasButton();
			await aura.canvas.deselectAll();
			await aura.canvas.nodeByName('Set').click();
			await aura.canvas.addNode('Customer Datastore (aura training)');

			await aura.canvas.openNode('Customer Datastore (aura training)');

			await aura.ndv.execute();

			await expect(aura.ndv.outputPanel.get().getByText('5 items')).toBeVisible();

			await aura.ndv.outputPanel.switchDisplayMode('schema');

			const schemaItemsCount = await aura.ndv.outputPanel.getSchemaItems().count();
			expect(schemaItemsCount).toBeGreaterThan(0);

			await aura.ndv.outputPanel.switchDisplayMode('json');
		});

		test('should display large schema', async ({ aura }) => {
			await aura.start.fromImportedWorkflow('Test_workflow_schema_test_pinned_data.json');
			await aura.canvas.clickZoomToFitButton();
			await aura.canvas.openNode('Set');

			await expect(aura.ndv.outputPanel.get().getByText('20 items')).toBeVisible();
			await expect(aura.ndv.outputPanel.get().locator('[class*="_pagination"]')).toBeVisible();

			await aura.ndv.outputPanel.switchDisplayMode('schema');

			await expect(aura.ndv.outputPanel.get().locator('[class*="_pagination"]')).toBeHidden();
		});
	});

	test('should display parameter hints correctly', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_3.json');
		await aura.canvas.openNode('Set1');

		await aura.ndv.getParameterInputField('value').clear();
		await aura.ndv.getParameterInputField('value').fill('=');

		await aura.ndv.getInlineExpressionEditorContent().fill('hello');
		await aura.ndv.getParameterInputField('name').click();
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('hello');

		await aura.ndv.getInlineExpressionEditorContent().fill('');
		await aura.ndv.getParameterInputField('name').click();
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('[empty]');

		await aura.ndv.getInlineExpressionEditorContent().fill(' test');
		await aura.ndv.getParameterInputField('name').click();
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText(' test');

		await aura.ndv.getInlineExpressionEditorContent().fill(' ');
		await aura.ndv.getParameterInputField('name').click();
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText(' ');

		await aura.ndv.getInlineExpressionEditorContent().fill('<div></div>');
		await aura.ndv.getParameterInputField('name').click();
		await expect(aura.ndv.getParameterExpressionPreviewValue()).toContainText('<div></div>');
	});

	test('should properly show node execution indicator', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Code', { action: 'Code in JavaScript', closeNDV: false });

		await expect(aura.ndv.getNodeRunSuccessIndicator()).toBeHidden();
		await expect(aura.ndv.getNodeRunErrorIndicator()).toBeHidden();
		await expect(aura.ndv.getNodeRunTooltipIndicator()).toBeHidden();

		await aura.ndv.execute();

		await expect(aura.ndv.getNodeRunSuccessIndicator()).toBeVisible();
		await expect(aura.ndv.getNodeRunTooltipIndicator()).toBeVisible();
	});

	test('should show node name and version in settings', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_ndv_version.json');

		await aura.canvas.openNode('Edit Fields (old)');
		await aura.ndv.openSettings();
		await expect(aura.ndv.getNodeVersion()).toContainText('Set node version 2');
		await expect(aura.ndv.getNodeVersion()).toContainText('Latest version: 3.4');
		await aura.ndv.close();

		await aura.canvas.openNode('Edit Fields (latest)');
		await aura.ndv.openSettings();
		await expect(aura.ndv.getNodeVersion()).toContainText('Edit Fields (Set) node version 3.4');
		await expect(aura.ndv.getNodeVersion()).toContainText('Latest');
		await aura.ndv.close();

		await aura.canvas.openNode('Function');
		await aura.ndv.openSettings();
		await expect(aura.ndv.getNodeVersion()).toContainText('Function node version 1');
		await expect(aura.ndv.getNodeVersion()).toContainText('Deprecated');
		await aura.ndv.close();
	});

	test('should not push NDV header out with a lot of code in Code node editor', async ({
		aura,
	}) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Code', { action: 'Code in JavaScript', closeNDV: false });

		const codeEditor = aura.ndv.getParameterInput('jsCode').locator('.cm-content');
		await codeEditor.click();
		await aura.page.keyboard.press('ControlOrMeta+a');
		await aura.page.keyboard.press('Delete');

		const dummyCode = Array(50)
			.fill(
				'console.log("This is a very long line of dummy JavaScript code that should not push the NDV header out of view");',
			)
			.join('\n');

		await codeEditor.fill(dummyCode);

		await expect(aura.ndv.getExecuteNodeButton()).toBeVisible();
	});

	test('should allow editing code in fullscreen in the code editors', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Code', { action: 'Code in JavaScript', closeNDV: false });

		await aura.ndv.openCodeEditorFullscreen();

		const fullscreenEditor = aura.ndv.getCodeEditorFullscreen();
		await fullscreenEditor.click();
		await aura.page.keyboard.press('ControlOrMeta+a');
		await fullscreenEditor.fill('foo()');

		await expect(fullscreenEditor).toContainText('foo()');

		await aura.ndv.closeCodeEditorDialog();

		await expect(aura.ndv.getParameterInput('jsCode').locator('.cm-content')).toContainText(
			'foo()',
		);
	});

	test('should keep search expanded after Execute step node run', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_ndv_search.json');
		await aura.canvas.clickZoomToFitButton();
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);

		await aura.canvas.openNode('Edit Fields');
		await expect(aura.ndv.outputPanel.get()).toBeVisible();

		await aura.ndv.searchOutputData('US');

		await expect(aura.ndv.outputPanel.getTableRow(1).locator('mark')).toContainText('US');

		await aura.ndv.execute();

		await expect(aura.ndv.outputPanel.getSearchInput()).toBeVisible();
		await expect(aura.ndv.outputPanel.getSearchInput()).toHaveValue('US');
	});

	test('Should render xml and html tags as strings and can search', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_xml_output.json');
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);
		await aura.canvas.openNode('Edit Fields');

		await expect(aura.ndv.outputPanel.get().locator('[class*="active"]')).toContainText('Table');

		await expect(aura.ndv.outputPanel.getTableRow(1)).toContainText(
			'<?xml version="1.0" encoding="UTF-8"?> <library>',
		);

		await aura.page.keyboard.press('/');

		const searchInput = aura.ndv.outputPanel.getSearchInput();
		await expect(searchInput).toBeFocused();
		await searchInput.fill('<lib');

		await expect(aura.ndv.outputPanel.getTableRow(1).locator('mark')).toContainText('<lib');

		await aura.ndv.outputPanel.switchDisplayMode('json');

		await expect(aura.ndv.outputPanel.getDataContainer().locator('.json-data')).toBeVisible();
	});

	test.describe('Run Data & Selectors - Advanced', () => {
		test('can link and unlink run selectors between input and output', async ({ aura }) => {
			await aura.start.fromImportedWorkflow('Test_workflow_5.json');
			await aura.canvas.clickZoomToFitButton();
			await aura.workflowComposer.executeWorkflowAndWaitForNotification(
				'Workflow executed successfully',
			);
			await aura.canvas.openNode('Set3');

			await aura.ndv.inputPanel.switchDisplayMode('table');
			await aura.ndv.outputPanel.switchDisplayMode('table');

			await aura.ndv.ensureOutputRunLinking(true);
			await aura.ndv.inputPanel.getTbodyCell(0, 0).click();
			expect(await aura.ndv.getInputRunSelectorValue()).toContain('2 of 2 (6 items)');
			expect(await aura.ndv.getOutputRunSelectorValue()).toContain('2 of 2 (6 items)');

			await aura.ndv.changeOutputRunSelector('1 of 2 (6 items)');
			expect(await aura.ndv.getInputRunSelectorValue()).toContain('1 of 2 (6 items)');
			await expect(aura.ndv.inputPanel.getTbodyCell(0, 0)).toHaveText('1111');
			await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).toHaveText('1111');

			await aura.ndv.inputPanel.getTbodyCell(0, 0).click();
			await aura.ndv.changeInputRunSelector('2 of 2 (6 items)');
			expect(await aura.ndv.getOutputRunSelectorValue()).toContain('2 of 2 (6 items)');

			await aura.ndv.outputPanel.getLinkRun().click();
			await aura.ndv.inputPanel.getTbodyCell(0, 0).click();
			await aura.ndv.changeOutputRunSelector('1 of 2 (6 items)');
			expect(await aura.ndv.getInputRunSelectorValue()).toContain('2 of 2 (6 items)');

			await aura.ndv.outputPanel.getLinkRun().click();
			await aura.ndv.inputPanel.getTbodyCell(0, 0).click();
			expect(await aura.ndv.getInputRunSelectorValue()).toContain('1 of 2 (6 items)');

			await aura.ndv.inputPanel.toggleInputRunLinking();
			await aura.ndv.inputPanel.getTbodyCell(0, 0).click();
			await aura.ndv.changeInputRunSelector('2 of 2 (6 items)');
			expect(await aura.ndv.getOutputRunSelectorValue()).toContain('1 of 2 (6 items)');

			await aura.ndv.inputPanel.toggleInputRunLinking();
			await aura.ndv.inputPanel.getTbodyCell(0, 0).click();
			expect(await aura.ndv.getOutputRunSelectorValue()).toContain('2 of 2 (6 items)');
		});
	});

	test.describe('Remote Options & Network', () => {
		test('should not retrieve remote options when a parameter value changes', async ({ aura }) => {
			let fetchParameterOptionsCallCount = 0;
			await aura.page.route('**/rest/dynamic-node-parameters/options', async (route) => {
				fetchParameterOptionsCallCount++;
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ data: [] }),
				});
			});

			await aura.canvas.addNode('E2E Test', { action: 'Remote Options' });
			await expect(aura.ndv.getContainer()).toBeVisible();

			await aura.ndv.fillFirstAvailableTextParameterMultipleTimes(['test1', 'test2', 'test3']);

			expect(fetchParameterOptionsCallCount).toBe(1);
		});

		test('Should show a notice when remote options cannot be fetched because of missing credentials', async ({
			aura,
		}) => {
			await aura.page.route('**/rest/dynamic-node-parameters/options', async (route) => {
				await route.fulfill({ status: 403 });
			});

			await aura.canvas.addNode('Manual Trigger');
			await aura.canvas.addNode('Notion', { action: 'Update a database page', closeNDV: false });
			await expect(aura.ndv.getContainer()).toBeVisible();

			await aura.ndv.addItemToFixedCollection('propertiesUi');
			await expect(
				aura.ndv.getParameterInputWithIssues('propertiesUi.propertyValues[0].key'),
			).toBeVisible();
		});

		test('Should show error state when remote options cannot be fetched', async ({ aura }) => {
			await aura.page.route('**/rest/dynamic-node-parameters/options', async (route) => {
				await route.fulfill({ status: 500 });
			});

			await aura.canvas.addNode('Manual Trigger');
			await aura.canvas.addNode('Notion', { action: 'Update a database page', closeNDV: false });
			await expect(aura.ndv.getContainer()).toBeVisible();

			await aura.credentialsComposer.createFromNdv({
				apiKey: 'sk_test_123',
			});
			await aura.ndv.addItemToFixedCollection('propertiesUi');
			await expect(
				aura.ndv.getParameterInputWithIssues('propertiesUi.propertyValues[0].key'),
			).toBeVisible();
		});
	});

	test.describe('Floating Nodes Navigation', () => {
		test('should traverse floating nodes with mouse', async ({ aura }) => {
			await aura.start.fromImportedWorkflow('Floating_Nodes.json');
			await aura.canvas.getCanvasNodes().first().dblclick();
			await expect(aura.ndv.getContainer()).toBeVisible();

			await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeHidden();
			await expect(aura.ndv.getFloatingNodeByPosition('outputMain')).toBeVisible();
			for (let i = 0; i < 4; i++) {
				await aura.ndv.clickFloatingNodeByPosition('outputMain');
				await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeVisible();
				await expect(aura.ndv.getFloatingNodeByPosition('outputMain')).toBeVisible();

				await aura.ndv.close();
				await expect(aura.canvas.getSelectedNodes()).toHaveCount(1);

				await aura.canvas.getSelectedNodes().first().dblclick();
				await expect(aura.ndv.getContainer()).toBeVisible();
			}

			await aura.ndv.clickFloatingNodeByPosition('outputMain');
			await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeVisible();

			for (let i = 0; i < 4; i++) {
				await aura.ndv.clickFloatingNodeByPosition('inputMain');
				await expect(aura.ndv.getFloatingNodeByPosition('outputMain')).toBeVisible();
				await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeVisible();
			}

			await aura.ndv.clickFloatingNodeByPosition('inputMain');
			await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeHidden();
			await expect(aura.ndv.getFloatingNodeByPosition('inputSub')).toBeHidden();
			await expect(aura.ndv.getFloatingNodeByPosition('outputSub')).toBeHidden();

			await aura.ndv.close();
			await expect(aura.canvas.getSelectedNodes()).toHaveCount(1);
		});

		test('should traverse floating nodes with keyboard', async ({ aura }) => {
			await aura.start.fromImportedWorkflow('Floating_Nodes.json');

			await aura.canvas.getCanvasNodes().first().dblclick();
			await expect(aura.ndv.getContainer()).toBeVisible();

			await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeHidden();
			await expect(aura.ndv.getFloatingNodeByPosition('outputMain')).toBeVisible();
			for (let i = 0; i < 4; i++) {
				await aura.ndv.navigateToNextFloatingNodeWithKeyboard();
				await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeVisible();
				await expect(aura.ndv.getFloatingNodeByPosition('outputMain')).toBeVisible();

				await aura.ndv.close();
				await expect(aura.canvas.getSelectedNodes()).toHaveCount(1);

				await aura.canvas.getSelectedNodes().first().dblclick();
				await expect(aura.ndv.getContainer()).toBeVisible();
			}

			await aura.ndv.navigateToNextFloatingNodeWithKeyboard();
			await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeVisible();

			for (let i = 0; i < 4; i++) {
				await aura.ndv.navigateToPreviousFloatingNodeWithKeyboard();
				await expect(aura.ndv.getFloatingNodeByPosition('outputMain')).toBeVisible();
				await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeVisible();
			}

			await aura.ndv.navigateToPreviousFloatingNodeWithKeyboard();
			await expect(aura.ndv.getFloatingNodeByPosition('inputMain')).toBeHidden();
			await expect(aura.ndv.getFloatingNodeByPosition('inputSub')).toBeHidden();
			await expect(aura.ndv.getFloatingNodeByPosition('outputSub')).toBeHidden();

			await aura.ndv.close();
			await expect(aura.canvas.getSelectedNodes()).toHaveCount(1);
		});

		test('should connect floating sub-nodes', async ({ aura }) => {
			await aura.canvas.addNode('AI Agent', { closeNDV: false });
			await expect(aura.ndv.getContainer()).toBeVisible();

			await aura.ndv.connectAISubNode('ai_languageModel', 'Anthropic Chat Model');
			await aura.ndv.connectAISubNode('ai_memory', 'Simple Memory');
			await aura.ndv.connectAISubNode('ai_tool', 'HTTP Request Tool');

			expect(await aura.ndv.getNodesWithIssuesCount()).toBeGreaterThanOrEqual(2);
		});

		test('should have the floating nodes in correct order', async ({ aura }) => {
			await aura.start.fromImportedWorkflow('Floating_Nodes.json');

			await aura.canvas.openNode('Merge');
			await expect(aura.ndv.getContainer()).toBeVisible();

			expect(await aura.ndv.getFloatingNodeCount('inputMain')).toBe(2);
			await aura.ndv.verifyFloatingNodeName('inputMain', 'Edit Fields1', 0);
			await aura.ndv.verifyFloatingNodeName('inputMain', 'Edit Fields0', 1);

			await aura.ndv.close();

			await aura.canvas.openNode('Merge1');
			await expect(aura.ndv.getContainer()).toBeVisible();

			expect(await aura.ndv.getFloatingNodeCount('inputMain')).toBe(2);
			await aura.ndv.verifyFloatingNodeName('inputMain', 'Edit Fields0', 0);
			await aura.ndv.verifyFloatingNodeName('inputMain', 'Edit Fields1', 1);
		});
	});

	test.describe('Parameter Management - Advanced', () => {
		test('Should clear mismatched collection parameters', async ({ aura }) => {
			await aura.canvas.addNode('Manual Trigger');
			await aura.canvas.addNode('Notion', { action: 'Create a database page', closeNDV: false });
			await expect(aura.ndv.getContainer()).toBeVisible();

			await aura.ndv.addItemToFixedCollection('propertiesUi');
			await aura.ndv.changeNodeOperation('Update');

			await expect(aura.ndv.getParameterItemWithText('Currently no items exist')).toBeVisible();
		});

		test('Should keep RLC values after operation change', async ({ aura }) => {
			const TEST_DOC_ID = '1111';

			await aura.canvas.addNode('Manual Trigger');
			await aura.canvas.addNode('Google Sheets', {
				closeNDV: false,
				action: 'Append row in sheet',
			});
			await expect(aura.ndv.getContainer()).toBeVisible();

			await aura.ndv.setRLCValue('documentId', TEST_DOC_ID);
			await aura.ndv.changeNodeOperation('Append or Update Row');
			const input = aura.ndv.getResourceLocatorInput('documentId').locator('input');
			await expect(input).toHaveValue(TEST_DOC_ID);
		});

		test('Should not clear resource/operation after credential change', async ({ aura }) => {
			await aura.canvas.addNode('Manual Trigger');
			await aura.canvas.addNode('Discord', { closeNDV: false, action: 'Delete a message' });
			await expect(aura.ndv.getContainer()).toBeVisible();
			await aura.credentialsComposer.createFromNdv({
				botToken: 'sk_test_123',
			});

			const resourceInput = aura.ndv.getParameterInputField('resource');
			const operationInput = aura.ndv.getParameterInputField('operation');

			await expect(resourceInput).toHaveValue('Message');
			await expect(operationInput).toHaveValue('Delete');
		});
	});

	test.describe('Node Creator Integration', () => {
		test('Should open appropriate node creator after clicking on connection hint link', async ({
			aura,
		}) => {
			const hintMapper = {
				Memory: 'AI Nodes',
				'Output Parser': 'AI Nodes',
				'Token Splitter': 'Document Loaders',
				Tool: 'AI Nodes',
				Embeddings: 'Vector Stores',
				'Vector Store': 'Retrievers',
			};

			await aura.canvas.importWorkflow(
				'open_node_creator_for_connection.json',
				'open_node_creator_for_connection',
			);

			for (const [node, group] of Object.entries(hintMapper)) {
				await aura.canvas.openNode(node);

				await aura.ndv.clickNodeCreatorInsertOneButton();
				await expect(aura.canvas.getNodeCreatorHeader(group)).toBeVisible();
				await aura.page.keyboard.press('Escape');
			}
		});
	});

	test.describe('Expression Editor Features', () => {
		test('should allow selecting item for expressions', async ({ aura }) => {
			await aura.canvas.importWorkflow('Test_workflow_3.json', 'My test workflow 2');

			await aura.workflowComposer.executeWorkflowAndWaitForNotification(
				'Workflow executed successfully',
			);

			await aura.canvas.openNode('Set');

			await aura.ndv.getAssignmentValue('assignments').getByText('Expression').click();

			const expressionInput = aura.ndv.getInlineExpressionEditorInput();
			await expressionInput.click();
			await aura.ndv.clearExpressionEditor();
			await aura.ndv.typeInExpressionEditor('{{ $json.input[0].count');

			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('0');

			await aura.ndv.expressionSelectNextItem();
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('1');
			await expect(aura.ndv.getInlineExpressionEditorItemInput()).toHaveValue('1');

			await expect(aura.ndv.getInlineExpressionEditorItemNextButton()).toBeDisabled();

			await aura.ndv.expressionSelectPrevItem();
			await expect(aura.ndv.getInlineExpressionEditorOutput()).toHaveText('0');
			await expect(aura.ndv.getInlineExpressionEditorItemInput()).toHaveValue('0');
		});
	});

	test.describe('Schema & Data Views', () => {
		test('should show data from the correct output in schema view', async ({ aura }) => {
			await aura.canvas.importWorkflow('Test_workflow_multiple_outputs.json', 'Multiple outputs');
			await aura.workflowComposer.executeWorkflowAndWaitForNotification(
				'Workflow executed successfully',
			);

			await aura.canvas.openNode('Only Item 1');
			await expect(aura.ndv.inputPanel.get()).toBeVisible();
			await aura.ndv.inputPanel.switchDisplayMode('schema');
			await expect(aura.ndv.inputPanel.getSchemaItem('onlyOnItem1')).toBeVisible();
			await aura.ndv.close();

			await aura.canvas.openNode('Only Item 2');
			await expect(aura.ndv.inputPanel.get()).toBeVisible();
			await aura.ndv.inputPanel.switchDisplayMode('schema');
			await expect(aura.ndv.inputPanel.getSchemaItem('onlyOnItem2')).toBeVisible();
			await aura.ndv.close();

			await aura.canvas.openNode('Only Item 3');
			await expect(aura.ndv.inputPanel.get()).toBeVisible();
			await aura.ndv.inputPanel.switchDisplayMode('schema');
			await expect(aura.ndv.inputPanel.getSchemaItem('onlyOnItem3')).toBeVisible();
			await aura.ndv.close();
		});
	});

	test.describe('Search Functionality - Advanced', () => {
		test('should not show items count when searching in schema view', async ({ aura }) => {
			await aura.canvas.importWorkflow('Test_ndv_search.json', 'NDV Search Test');
			await aura.canvas.openNode('Edit Fields');
			await expect(aura.ndv.outputPanel.get()).toBeVisible();

			await aura.ndv.execute();
			await aura.ndv.outputPanel.switchDisplayMode('schema');
			await aura.ndv.searchOutputData('US');

			await expect(aura.ndv.outputPanel.getItemsCount()).toBeHidden();
		});

		test('should show additional tooltip when searching in schema view if no matches', async ({
			aura,
		}) => {
			await aura.canvas.importWorkflow('Test_ndv_search.json', 'NDV Search Test');

			await aura.canvas.openNode('Edit Fields');
			await expect(aura.ndv.outputPanel.get()).toBeVisible();

			await aura.ndv.execute();
			await aura.ndv.outputPanel.switchDisplayMode('schema');
			await aura.ndv.searchOutputData('foo');

			await expect(
				aura.ndv.outputPanel
					.get()
					.getByText('To search field values, switch to table or JSON view.'),
			).toBeVisible();
		});
	});

	test.describe('Complex Edge Cases', () => {
		test('ADO-2931 - should handle multiple branches of the same input with the first branch empty correctly', async ({
			aura,
		}) => {
			await aura.canvas.importWorkflow(
				'Test_ndv_two_branches_of_same_parent_false_populated.json',
				'Multiple Branches Test',
			);

			await aura.canvas.openNode('DebugHelper');
			await expect(aura.ndv.inputPanel.get()).toBeVisible();
			await expect(aura.ndv.outputPanel.get()).toBeVisible();

			await aura.ndv.execute();

			await expect(aura.ndv.inputPanel.getSchemaItem('a1')).toBeVisible();
		});
	});

	test.describe('Execution Indicators - Multi-Node', () => {
		test('should properly show node execution indicator for multiple nodes', async ({ aura }) => {
			await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript' });
			await aura.ndv.clickBackToCanvasButton();

			await aura.workflowComposer.executeWorkflowAndWaitForNotification(
				'Workflow executed successfully',
			);

			await aura.canvas.openNode(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
			await expect(aura.ndv.getNodeRunSuccessIndicator()).toBeVisible();
			await expect(aura.ndv.getNodeRunTooltipIndicator()).toBeVisible();

			await aura.ndv.clickBackToCanvasButton();
			await aura.canvas.openNode(CODE_NODE_DISPLAY_NAME);
			await expect(aura.ndv.getNodeRunSuccessIndicator()).toBeVisible();
		});
	});
});
