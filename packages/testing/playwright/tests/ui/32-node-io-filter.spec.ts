import { test, expect } from '../../fixtures/base';

test.describe('Node IO Filter', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Node_IO_filter.json');
		await aura.canvas.clickExecuteWorkflowButton();
	});

	test('should filter pinned data', async ({ aura }) => {
		const canvasNodes = aura.canvas.getCanvasNodes();
		await canvasNodes.first().dblclick();

		await aura.ndv.close();
		await canvasNodes.first().dblclick();

		await expect(aura.ndv.outputPanel.getDataContainer()).toBeVisible();

		const searchInput = aura.ndv.outputPanel.getSearchInput();
		await expect(searchInput).toBeVisible();

		await aura.page.keyboard.press('/');

		await expect(searchInput).toBeFocused();

		const pagination = aura.ndv.getOutputPagination();
		await expect(pagination.locator('li')).toHaveCount(3);
		await expect(aura.ndv.outputPanel.getDataContainer().locator('mark')).toHaveCount(0);

		await searchInput.fill('ar');
		await expect(pagination.locator('li')).toHaveCount(2);
		const markCount1 = await aura.ndv.outputPanel.getDataContainer().locator('mark').count();
		expect(markCount1).toBeGreaterThan(0);

		await searchInput.fill('ari');
		await expect(pagination).toBeHidden();
		const markCount2 = await aura.ndv.outputPanel.getDataContainer().locator('mark').count();
		expect(markCount2).toBeGreaterThan(0);
	});

	test('should filter input/output data separately', async ({ aura }) => {
		const canvasNodes = aura.canvas.getCanvasNodes();
		await canvasNodes.nth(1).dblclick();

		await expect(aura.ndv.outputPanel.getDataContainer()).toBeVisible();
		await expect(aura.ndv.inputPanel.getDataContainer()).toBeVisible();

		await aura.ndv.inputPanel.switchDisplayMode('table');

		await expect(aura.ndv.outputPanel.getSearchInput()).toBeVisible();

		await aura.page.keyboard.press('/');
		await expect(aura.ndv.outputPanel.getSearchInput()).not.toBeFocused();

		const inputSearchInput = aura.ndv.inputPanel.getSearchInput();
		await expect(inputSearchInput).toBeFocused();

		const getInputPagination = () => aura.ndv.inputPanel.get().getByTestId('ndv-data-pagination');
		const getInputCounter = () => aura.ndv.inputPanel.getItemsCount();
		const getOutputPagination = () => aura.ndv.outputPanel.get().getByTestId('ndv-data-pagination');
		const getOutputCounter = () => aura.ndv.outputPanel.getItemsCount();

		await expect(getInputPagination().locator('li')).toHaveCount(3);
		await expect(getInputCounter()).toContainText('21 items');
		await expect(getOutputPagination().locator('li')).toHaveCount(3);
		await expect(getOutputCounter()).toContainText('21 items');

		await inputSearchInput.fill('ar');
		await expect(getInputPagination().locator('li')).toHaveCount(2);
		await expect(getInputCounter()).toContainText('14 of 21 items');
		await expect(getOutputPagination().locator('li')).toHaveCount(3);
		await expect(getOutputCounter()).toContainText('21 items');

		await inputSearchInput.fill('ari');
		await expect(getInputPagination()).toBeHidden();
		await expect(getInputCounter()).toContainText('8 of 21 items');
		await expect(getOutputPagination().locator('li')).toHaveCount(3);
		await expect(getOutputCounter()).toContainText('21 items');

		await inputSearchInput.clear();
		await expect(getInputPagination().locator('li')).toHaveCount(3);
		await expect(getInputCounter()).toContainText('21 items');
		await expect(getOutputPagination().locator('li')).toHaveCount(3);
		await expect(getOutputCounter()).toContainText('21 items');

		await aura.ndv.outputPanel.getDataContainer().click();
		await aura.page.keyboard.press('/');
		await expect(aura.ndv.inputPanel.getSearchInput()).not.toBeFocused();

		const outputSearchInput = aura.ndv.outputPanel.getSearchInput();
		await expect(outputSearchInput).toBeFocused();

		await expect(getInputPagination().locator('li')).toHaveCount(3);
		await expect(getInputCounter()).toContainText('21 items');
		await expect(getOutputPagination().locator('li')).toHaveCount(3);
		await expect(getOutputCounter()).toContainText('21 items');

		await outputSearchInput.fill('ar');
		await expect(getInputPagination().locator('li')).toHaveCount(3);
		await expect(getInputCounter()).toContainText('21 items');
		await expect(getOutputPagination().locator('li')).toHaveCount(2);
		await expect(getOutputCounter()).toContainText('14 of 21 items');

		await outputSearchInput.fill('ari');
		await expect(getInputPagination().locator('li')).toHaveCount(3);
		await expect(getInputCounter()).toContainText('21 items');
		await expect(getOutputPagination()).toBeHidden();
		await expect(getOutputCounter()).toContainText('8 of 21 items');

		await outputSearchInput.clear();
		await expect(getInputPagination().locator('li')).toHaveCount(3);
		await expect(getInputCounter()).toContainText('21 items');
		await expect(getOutputPagination().locator('li')).toHaveCount(3);
		await expect(getOutputCounter()).toContainText('21 items');
	});
});
