import { test, expect } from '../../../fixtures/base';

test.describe('Node Creator Workflow Building', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should append manual trigger when adding action node from canvas add button', async ({
		aura,
	}) => {
		await aura.canvas.clickCanvasPlusButton();
		await aura.canvas.nodeCreator.searchFor('aura');
		await aura.canvas.nodeCreator.selectItem('aura');
		await aura.canvas.nodeCreator.selectCategoryItem('Actions');
		await aura.canvas.nodeCreator.selectItem('Create a credential');
		await aura.page.keyboard.press('Escape');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await expect(aura.canvas.nodeConnections()).toHaveCount(1);
	});

	test('should append manual trigger when adding action node from plus button', async ({
		aura,
	}) => {
		await aura.canvas.clickCanvasPlusButton();
		await aura.canvas.nodeCreator.searchFor('aura');
		await aura.canvas.nodeCreator.selectItem('aura');
		await aura.canvas.nodeCreator.selectCategoryItem('Actions');
		await aura.canvas.nodeCreator.selectItem('Create a credential');
		await aura.page.keyboard.press('Escape');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});
});
