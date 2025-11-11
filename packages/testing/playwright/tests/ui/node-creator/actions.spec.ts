import { test, expect } from '../../../fixtures/base';

test.describe('Node Creator Actions', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should add node to canvas from actions panel', async ({ aura }) => {
		const editImageNode = 'Edit Image';

		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor(editImageNode);
		await aura.canvas.nodeCreator.selectItem(editImageNode);

		await expect(aura.canvas.nodeCreator.getActiveSubcategory()).toContainText(editImageNode);
		await aura.canvas.nodeCreator.selectItem('Crop Image');
		await expect(aura.ndv.getContainer()).toBeVisible();
		await aura.page.keyboard.press('Escape');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});

	test('should search through actions and confirm added action', async ({ aura }) => {
		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor('ftp');
		await aura.canvas.nodeCreator.selectItem('FTP');

		await expect(aura.canvas.nodeCreator.getActiveSubcategory()).toContainText('FTP');
		await aura.canvas.nodeCreator.clearSearch();
		await aura.canvas.nodeCreator.searchFor('rename');
		await aura.canvas.nodeCreator.selectItem('Rename');

		await expect(aura.ndv.getContainer()).toBeVisible();
		await aura.page.keyboard.press('Escape');

		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});

	test('should show multiple actions for multi-action nodes', async ({ aura }) => {
		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor('OpenWeatherMap');
		await aura.canvas.nodeCreator.selectItem('OpenWeatherMap');

		await expect(aura.canvas.nodeCreator.getActiveSubcategory()).toContainText('OpenWeatherMap');
		await expect(aura.canvas.nodeCreator.getNodeItems().first()).toBeVisible();
		await expect(aura.canvas.nodeCreator.getNodeItems().nth(1)).toBeVisible();

		await aura.canvas.nodeCreator.getNodeItems().first().click();
		await aura.page.keyboard.press('Escape');
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});

	test('should add node with specific operation configuration', async ({ aura }) => {
		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor('Slack');
		await aura.canvas.nodeCreator.selectItem('Slack');

		await expect(aura.canvas.nodeCreator.getActiveSubcategory()).toContainText('Slack');
		await aura.canvas.nodeCreator.getNodeItems().first().click();
		await aura.page.keyboard.press('Escape');
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);
	});
});
