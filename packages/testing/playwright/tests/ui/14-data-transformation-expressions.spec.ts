import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

test.describe('Data transformation expressions', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
	});

	async function addEditFields(aura: auraPage): Promise<void> {
		await aura.canvas.addNode('Edit Fields (Set)');
		await aura.ndv.getAssignmentCollectionAdd('assignments').click();

		// Switch assignment value to Expression mode
		const assignmentValue = aura.ndv.getAssignmentValue('assignments');
		await assignmentValue.locator('text=Expression').click();
	}

	test('$json + native string methods', async ({ aura }) => {
		await aura.workflows.addResource.workflow();

		await aura.canvas.addNode('Schedule Trigger');
		await aura.ndv.setPinnedData([{ myStr: 'Monday' }]);
		await aura.ndv.close();

		await addEditFields(aura);

		const input = '{{$json.myStr.toLowerCase() + " is " + "today".toUpperCase()}}';
		const output = 'monday is TODAY';

		await aura.ndv.clearExpressionEditor();
		await aura.ndv.typeInExpressionEditor(input);
		await expect(aura.ndv.getInlineExpressionEditorOutput()).toContainText(output);

		// Execute and verify output
		await aura.ndv.execute();
		await expect(aura.ndv.getOutputDataContainer()).toBeVisible();
		await expect(aura.ndv.getOutputDataContainer()).toContainText(output);
	});

	test('$json + aura string methods', async ({ aura }) => {
		await aura.workflows.addResource.workflow();

		await aura.canvas.addNode('Schedule Trigger');
		await aura.ndv.setPinnedData([{ myStr: 'hello@aura.io is an email' }]);
		await aura.ndv.close();

		await addEditFields(aura);

		const input = '{{$json.myStr.extractEmail() + " " + $json.myStr.isEmpty()}}';
		const output = 'hello@aura.io false';

		await aura.ndv.clearExpressionEditor();
		await aura.ndv.typeInExpressionEditor(input);
		await expect(aura.ndv.getInlineExpressionEditorOutput()).toContainText(output);

		await aura.ndv.execute();
		await expect(aura.ndv.getOutputDataContainer()).toBeVisible();
		await expect(aura.ndv.getOutputDataContainer()).toContainText(output);
	});

	test('$json + native numeric methods', async ({ aura }) => {
		await aura.workflows.addResource.workflow();

		await aura.canvas.addNode('Schedule Trigger');
		await aura.ndv.setPinnedData([{ myNum: 9.123 }]);
		await aura.ndv.close();

		await addEditFields(aura);

		const input = '{{$json.myNum.toPrecision(3)}}';
		const output = '9.12';

		await aura.ndv.clearExpressionEditor();
		await aura.ndv.typeInExpressionEditor(input);
		await expect(aura.ndv.getInlineExpressionEditorOutput()).toContainText(output);

		await aura.ndv.execute();
		await expect(aura.ndv.getOutputDataContainer()).toBeVisible();
		await expect(aura.ndv.getOutputDataContainer()).toContainText(output);
	});

	test('$json + aura numeric methods', async ({ aura }) => {
		await aura.workflows.addResource.workflow();

		await aura.canvas.addNode('Schedule Trigger');
		await aura.ndv.setPinnedData([{ myStr: 'hello@aura.io is an email' }]);
		await aura.ndv.close();

		await addEditFields(aura);

		const input = '{{$json.myStr.extractEmail() + " " + $json.myStr.isEmpty()}}';
		const output = 'hello@aura.io false';

		await aura.ndv.clearExpressionEditor();
		await aura.ndv.typeInExpressionEditor(input);
		await expect(aura.ndv.getInlineExpressionEditorOutput()).toContainText(output);

		await aura.ndv.execute();
		await expect(aura.ndv.getOutputDataContainer()).toBeVisible();
		await expect(aura.ndv.getOutputDataContainer()).toContainText(output);
	});

	test('$json + native array access', async ({ aura }) => {
		await aura.workflows.addResource.workflow();

		await aura.canvas.addNode('Schedule Trigger');
		await aura.ndv.setPinnedData([{ myArr: [1, 2, 3] }]);
		await aura.ndv.close();

		await addEditFields(aura);

		const input = '{{$json.myArr.includes(1) + " " + $json.myArr[2]}}';
		const output = 'true 3';

		await aura.ndv.clearExpressionEditor();
		await aura.ndv.typeInExpressionEditor(input);
		await expect(aura.ndv.getInlineExpressionEditorOutput()).toContainText(output);

		await aura.ndv.execute();
		const valueElements = aura.ndv.getOutputDataContainer().locator('[class*=value_]');
		await expect(valueElements).toBeVisible();
		await expect(valueElements).toContainText(output);
	});

	test('$json + aura array methods', async ({ aura }) => {
		await aura.workflows.addResource.workflow();

		await aura.canvas.addNode('Schedule Trigger');
		await aura.ndv.setPinnedData([{ myArr: [1, 2, 3] }]);
		await aura.ndv.close();

		await addEditFields(aura);

		const input = '{{$json.myArr.first() + " " + $json.myArr.last()}}';
		const output = '1 3';

		await aura.ndv.clearExpressionEditor();
		await aura.ndv.typeInExpressionEditor(input);
		await expect(aura.ndv.getInlineExpressionEditorOutput()).toContainText(output);

		await aura.ndv.execute();
		const valueElements = aura.ndv.getOutputDataContainer().locator('[class*=value_]');
		await expect(valueElements).toBeVisible();
		await expect(valueElements).toContainText(output);
	});
});
