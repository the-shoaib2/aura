import { E2E_TEST_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';

test.describe('Resource Mapper', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();
		await aura.canvas.addNode(E2E_TEST_NODE_NAME, { action: 'Resource Mapping Component' });
	});

	test('should not retrieve list options when required params throw errors', async ({ aura }) => {
		const fieldsContainer = aura.ndv.getResourceMapperFieldsContainer();
		await expect(fieldsContainer).toBeVisible();
		await expect(aura.ndv.getResourceMapperParameterInputs()).toHaveCount(3);

		await aura.ndv.activateParameterExpressionEditor('fieldId');
		await aura.ndv.typeInExpressionEditor("{{ $('unknown')");
		await expect(aura.ndv.getInlineExpressionEditorPreview()).toContainText("node doesn't exist");

		await aura.ndv.refreshResourceMapperColumns();

		await expect(aura.ndv.getResourceMapperFieldsContainer()).toHaveCount(0);
	});

	test('should retrieve list options when optional params throw errors', async ({ aura }) => {
		await aura.ndv.activateParameterExpressionEditor('otherField');
		await aura.ndv.typeInExpressionEditor("{{ $('unknown')");
		await expect(aura.ndv.getInlineExpressionEditorPreview()).toContainText("node doesn't exist");

		await aura.ndv.refreshResourceMapperColumns();

		await expect(aura.ndv.getResourceMapperFieldsContainer()).toBeVisible();
		await expect(aura.ndv.getResourceMapperParameterInputs()).toHaveCount(3);
	});

	test('should correctly delete single field', async ({ aura }) => {
		await aura.ndv.fillParameterInputByName('id', '001');
		await aura.ndv.fillParameterInputByName('name', 'John');
		await aura.ndv.fillParameterInputByName('age', '30');
		await aura.ndv.execute();

		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'id' })).toBeVisible();
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'name' })).toBeVisible();
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'age' })).toBeVisible();

		await aura.ndv.getResourceMapperRemoveFieldButton('name').click();
		await aura.ndv.execute();

		await expect(aura.ndv.getParameterInput('id')).toBeVisible();
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'id' })).toBeVisible();
		await expect(aura.ndv.getParameterInput('age')).toBeVisible();
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'age' })).toBeVisible();
		await expect(aura.ndv.getParameterInput('name')).toHaveCount(0);
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'name' })).toHaveCount(0);
	});

	test('should correctly delete all fields', async ({ aura }) => {
		await aura.ndv.fillParameterInputByName('id', '001');
		await aura.ndv.fillParameterInputByName('name', 'John');
		await aura.ndv.fillParameterInputByName('age', '30');
		await aura.ndv.execute();

		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'id' })).toBeVisible();
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'name' })).toBeVisible();
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'age' })).toBeVisible();

		await aura.ndv.getResourceMapperColumnsOptionsButton().click();
		await aura.ndv.getResourceMapperRemoveAllFieldsOption().click();
		await aura.ndv.execute();

		await expect(aura.ndv.getParameterInput('id')).toBeVisible();
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'id' })).toBeVisible();
		await expect(aura.ndv.getParameterInput('name')).toHaveCount(0);
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'name' })).toHaveCount(0);
		await expect(aura.ndv.getParameterInput('age')).toHaveCount(0);
		await expect(aura.ndv.outputPanel.getTableHeaders().filter({ hasText: 'age' })).toHaveCount(0);
	});
});
