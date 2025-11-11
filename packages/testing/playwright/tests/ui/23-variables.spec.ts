import { customAlphabet } from 'nanoid';

import { test, expect } from '../../fixtures/base';

const generateValidId = customAlphabet(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
	8,
);

test.describe('Variables', () => {
	// These tests are serial since it's at an instance level and they interact with the same variables
	test.describe.configure({ mode: 'serial' });
	test.describe('unlicensed', () => {
		test('should show the unlicensed action box when the feature is disabled', async ({ aura }) => {
			await aura.api.disableFeature('variables');
			await aura.navigate.toVariables();
			await expect(aura.variables.getUnavailableResourcesList()).toBeVisible();
			await expect(aura.variables.getResourcesList()).toBeHidden();
		});
	});

	test.describe('licensed', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.api.enableFeature('variables');
			await aura.api.variables.deleteAllVariables();
			await aura.navigate.toVariables();
		});

		test('should create a new variable using empty state', async ({ aura }) => {
			const key = `ENV_VAR_${generateValidId()}`;
			const value = 'test_value';

			await aura.variables.createVariableFromEmptyState(key, value);

			const variableRow = aura.variables.getVariableRow(key);
			await expect(variableRow).toContainText(value);
			await expect(variableRow).toBeVisible();
			await expect(aura.variables.getVariablesRows()).toHaveCount(1);
		});

		test('should create multiple variables', async ({ aura }) => {
			const key1 = `ENV_VAR_NEW_${generateValidId()}`;
			const value1 = 'test_value_1';
			await aura.variables.createVariableFromEmptyState(key1, value1);
			await expect(aura.variables.getVariablesRows()).toHaveCount(1);

			const key2 = `ENV_EXAMPLE_${generateValidId()}`;
			const value2 = 'test_value_2';
			await aura.variables.createVariable(key2, value2);

			await expect(aura.variables.getVariablesRows()).toHaveCount(2);

			const variableRow1 = aura.variables.getVariableRow(key1);
			await expect(variableRow1).toContainText(value1);
			await expect(variableRow1).toBeVisible();

			const variableRow2 = aura.variables.getVariableRow(key2);
			await expect(variableRow2).toContainText(value2);
			await expect(variableRow2).toBeVisible();
		});

		test('should get validation errors and cancel variable creation', async ({ aura }) => {
			await aura.variables.createVariableFromEmptyState(
				`ENV_BASE_${generateValidId()}`,
				'base_value',
			);
			await expect(aura.variables.getVariablesRows()).toHaveCount(1);
			const initialCount = await aura.variables.getVariablesRows().count();

			const key = `ENV_VAR_INVALID_${generateValidId()}$`; // Invalid key with special character
			const value = 'test_value';

			await aura.variables.createVariable(key, value, { shouldSave: false });
			const saveButton = aura.variables.variableModal.getSaveButton();
			await expect(saveButton).toBeDisabled();
			await aura.variables.variableModal.close();

			await expect(aura.variables.getVariablesRows()).toHaveCount(initialCount);
		});

		test('should edit a variable', async ({ aura }) => {
			const key = `ENV_VAR_EDIT_${generateValidId()}`;
			const initialValue = 'initial_value';
			await aura.variables.createVariableFromEmptyState(key, initialValue);

			const newValue = 'updated_value';

			await aura.variables.editVariable(key, newValue, { shouldSave: true });

			const variableRow = aura.variables.getVariableRow(key);
			await expect(variableRow).toContainText(newValue);
			await expect(variableRow).toBeVisible();
		});

		test('should delete a variable', async ({ aura }) => {
			const key = `TO_DELETE_${generateValidId()}`;
			const value = 'delete_test_value';

			await aura.variables.createVariableFromEmptyState(key, value);
			await expect(aura.variables.getVariablesRows()).toHaveCount(1);
			const initialCount = await aura.variables.getVariablesRows().count();

			await aura.variables.deleteVariable(key);

			await expect(aura.variables.getVariablesRows()).toHaveCount(initialCount - 1);

			await expect(aura.variables.getVariableRow(key)).toBeHidden();
		});

		test('should search for a variable', async ({ aura }) => {
			const uniqueId = generateValidId();

			const key1 = `SEARCH_VAR_${uniqueId}`;
			const key2 = `SEARCH_VAR_NEW_${uniqueId}`;
			const key3 = `SEARCH_EXAMPLE_${uniqueId}`;

			await aura.variables.createVariableFromEmptyState(key1, 'search_value_1');
			await aura.variables.createVariable(key2, 'search_value_2');
			await aura.variables.createVariable(key3, 'search_value_3');

			await aura.variables.getSearchBar().fill('NEW_');
			await aura.variables.getSearchBar().press('Enter');
			await expect(aura.variables.getVariablesRows()).toHaveCount(1);
			await expect(aura.variables.getVariableRow(key2)).toBeVisible();
			await expect(aura.page).toHaveURL(new RegExp('search=NEW_'));

			await aura.variables.getSearchBar().clear();
			await aura.variables.getSearchBar().fill('SEARCH_VAR_');
			await aura.variables.getSearchBar().press('Enter');
			await expect(aura.variables.getVariablesRows()).toHaveCount(2);
			await expect(aura.variables.getVariableRow(key1)).toBeVisible();
			await expect(aura.variables.getVariableRow(key2)).toBeVisible();
			await expect(aura.page).toHaveURL(new RegExp('search=SEARCH_VAR_'));

			await aura.variables.getSearchBar().clear();
			await aura.variables.getSearchBar().fill('SEARCH_');
			await aura.variables.getSearchBar().press('Enter');
			await expect(aura.variables.getVariablesRows()).toHaveCount(3);
			await expect(aura.variables.getVariableRow(key1)).toBeVisible();
			await expect(aura.variables.getVariableRow(key2)).toBeVisible();
			await expect(aura.variables.getVariableRow(key3)).toBeVisible();
			await expect(aura.page).toHaveURL(new RegExp('search=SEARCH_'));

			await aura.variables.getSearchBar().clear();
			await aura.variables.getSearchBar().fill(`NonExistent_${generateValidId()}`);
			await aura.variables.getSearchBar().press('Enter');
			await expect(aura.variables.getVariablesRows()).toBeHidden();
			await expect(aura.page).toHaveURL(/search=NonExistent_/);

			await expect(aura.page.getByText('No variables found')).toBeVisible();
		});
	});
});
