import { MANUAL_TRIGGER_NODE_DISPLAY_NAME } from '../../../config/constants';
import { test, expect } from '../../../fixtures/base';

test.describe('Node Creator Navigation', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should open node creator on trigger tab if no trigger is on canvas', async ({ aura }) => {
		await aura.canvas.clickCanvasPlusButton();
		await expect(aura.canvas.nodeCreator.getRoot()).toBeVisible();
		await expect(aura.canvas.nodeCreator.getTriggerText()).toBeVisible();
	});

	test('should navigate subcategory and return', async ({ aura }) => {
		await aura.canvas.nodeCreator.open();

		await aura.canvas.nodeCreator.navigateToSubcategory('On app event');
		await expect(aura.canvas.nodeCreator.getActiveSubcategory()).toContainText('On app event');

		await aura.canvas.nodeCreator.goBackFromSubcategory();
		await expect(aura.canvas.nodeCreator.getActiveSubcategory()).not.toContainText('On app event');
	});

	test('should search for nodes with various queries', async ({ aura }) => {
		await aura.canvas.nodeCreator.open();

		await aura.canvas.nodeCreator.searchFor('manual');
		await expect(aura.canvas.nodeCreator.getNodeItems()).toHaveCount(1);

		await aura.canvas.nodeCreator.clearSearch();
		await aura.canvas.nodeCreator.searchFor('manual123');
		await expect(aura.canvas.nodeCreator.getNodeItems()).toHaveCount(0);
		await expect(aura.canvas.nodeCreator.getNoResults()).toBeVisible();
		await expect(aura.canvas.nodeCreator.getNoResults()).toContainText(
			"We didn't make that... yet",
		);

		await aura.canvas.nodeCreator.clearSearch();
		await aura.canvas.nodeCreator.searchFor('edit image');
		await expect(aura.canvas.nodeCreator.getNodeItems()).toHaveCount(1);

		await aura.canvas.nodeCreator.clearSearch();
		await aura.canvas.nodeCreator.searchFor('this node totally does not exist');
		await expect(aura.canvas.nodeCreator.getNodeItems()).toHaveCount(0);

		await aura.canvas.nodeCreator.clearSearch();
		await aura.canvas.nodeCreator.navigateToSubcategory('On app event');

		await aura.canvas.nodeCreator.searchFor('edit image');
		await expect(
			aura.canvas.nodeCreator.getCategoryItem('Results in other categories'),
		).toBeVisible();
		await expect(aura.canvas.nodeCreator.getNodeItems()).toHaveCount(1);
		await expect(aura.canvas.nodeCreator.getItem('Edit Image')).toBeVisible();

		await aura.canvas.nodeCreator.clearSearch();
		await aura.canvas.nodeCreator.searchFor('edit image123123');
		await expect(aura.canvas.nodeCreator.getNodeItems()).toHaveCount(0);
	});

	test('should check correct view panels after adding manual trigger', async ({ aura }) => {
		await aura.canvas.clickCanvasPlusButton();
		await expect(aura.canvas.nodeCreator.getTriggerText()).toBeVisible();
		await aura.canvas.nodeCreator.close();

		await aura.canvas.addNode('Manual Trigger');
		await expect(aura.canvas.getCanvasPlusButton()).toBeHidden();

		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await expect(aura.canvas.nodeCreator.getNextText()).toBeVisible();
	});
});
