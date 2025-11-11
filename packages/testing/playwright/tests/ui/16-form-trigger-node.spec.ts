import { test, expect } from '../../fixtures/base';

test.describe('Form Trigger', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test("add node by clicking on 'On form submission'", async ({ aura }) => {
		await aura.canvas.clickNodeCreatorPlusButton();
		await aura.canvas.nodeCreatorItemByName('On form submission').click();

		await aura.ndv.fillParameterInput('Form Title', 'Test Form');
		await aura.ndv.fillParameterInput('Form Description', 'Test Form Description');
		await aura.ndv.clickBackToCanvasButton();

		await expect(aura.canvas.nodeByName('On form submission')).toBeVisible();
		await expect(aura.canvas.nodeIssuesBadge('On form submission')).toBeHidden();
	});

	test('should fill up form fields', async ({ aura }) => {
		await aura.canvas.clickNodeCreatorPlusButton();
		await aura.canvas.nodeCreatorItemByName('On form submission').click();

		await aura.ndv.fillParameterInput('Form Title', 'Test Form');
		await aura.ndv.fillParameterInput('Form Description', 'Test Form Description');

		// Add first field - Number type with required flag
		await aura.ndv.addFixedCollectionItem();
		await aura.ndv.fillParameterInputByName('fieldLabel', 'Test Field 1');
		await aura.ndv.selectOptionInParameterDropdown('fieldType', 'Number');
		await aura.ndv.setParameterSwitch('requiredField', true);

		// Add second field - Text type
		await aura.ndv.addFixedCollectionItem();
		await aura.ndv.fillParameterInputByName('fieldLabel', 'Test Field 2', 1);

		// Add third field - Date type
		await aura.ndv.addFixedCollectionItem();
		await aura.ndv.fillParameterInputByName('fieldLabel', 'Test Field 3', 2);
		await aura.ndv.selectOptionInParameterDropdown('fieldType', 'Date', 2);

		// Add fourth field - Dropdown type with options
		await aura.ndv.addFixedCollectionItem();
		await aura.ndv.fillParameterInputByName('fieldLabel', 'Test Field 4', 3);
		await aura.ndv.selectOptionInParameterDropdown('fieldType', 'Dropdown', 3);

		// Configure dropdown field options
		await aura.page.getByRole('button', { name: 'Add Field Option' }).click();
		await aura.ndv.fillParameterInputByName('option', 'Option 1');
		await aura.ndv.fillParameterInputByName('option', 'Option 2', 1);

		// Add optional submitted message
		await aura.ndv.addParameterOptionByName('Form Response');
		await aura.ndv.fillParameterInput('Text to Show', 'Your test form was successfully submitted');

		await aura.ndv.clickBackToCanvasButton();
		await expect(aura.canvas.nodeByName('On form submission')).toBeVisible();
		await expect(aura.canvas.nodeIssuesBadge('On form submission')).toBeHidden();
	});
});
