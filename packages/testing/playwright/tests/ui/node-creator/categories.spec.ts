import { MANUAL_TRIGGER_NODE_DISPLAY_NAME } from '../../../config/constants';
import { test, expect } from '../../../fixtures/base';

test.describe('Node Creator Categories', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should have "Actions" section collapsed when opening actions view from Trigger root view', async ({
		aura,
	}) => {
		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor('ActiveCampaign');
		await aura.canvas.nodeCreator.selectItem('ActiveCampaign');

		await expect(aura.canvas.nodeCreator.getCategoryItem('Actions')).toBeVisible();
		await expect(aura.canvas.nodeCreator.getCategoryItem('Triggers')).toBeVisible();

		await expect(aura.canvas.nodeCreator.getCategoryItem('Triggers').locator('..')).toHaveAttribute(
			'data-category-collapsed',
			'false',
		);

		await expect(aura.canvas.nodeCreator.getCategoryItem('Actions').locator('..')).toHaveAttribute(
			'data-category-collapsed',
			'true',
		);

		await aura.canvas.nodeCreator.selectCategoryItem('Actions');
		await expect(aura.canvas.nodeCreator.getCategoryItem('Actions').locator('..')).toHaveAttribute(
			'data-category-collapsed',
			'false',
		);
	});

	test('should have "Triggers" section collapsed when opening actions view from Regular root view', async ({
		aura,
	}) => {
		await aura.canvas.addNode('Manual Trigger');

		await aura.canvas.clickNodePlusEndpoint(MANUAL_TRIGGER_NODE_DISPLAY_NAME);
		await aura.canvas.nodeCreator.searchFor('aura');
		await aura.canvas.nodeCreator.getNodeItems().filter({ hasText: 'aura' }).first().click();

		await expect(aura.canvas.nodeCreator.getCategoryItem('Actions').locator('..')).toHaveAttribute(
			'data-category-collapsed',
			'false',
		);

		await aura.canvas.nodeCreator.selectCategoryItem('Actions');
		await expect(aura.canvas.nodeCreator.getCategoryItem('Actions').locator('..')).toHaveAttribute(
			'data-category-collapsed',
			'true',
		);

		await expect(aura.canvas.nodeCreator.getCategoryItem('Triggers').locator('..')).toHaveAttribute(
			'data-category-collapsed',
			'true',
		);

		await aura.canvas.nodeCreator.selectCategoryItem('Triggers');
		await expect(aura.canvas.nodeCreator.getCategoryItem('Triggers').locator('..')).toHaveAttribute(
			'data-category-collapsed',
			'false',
		);
	});

	test('should show callout and two suggested nodes if node has no trigger actions', async ({
		aura,
	}) => {
		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor('Customer Datastore (aura training)');
		await aura.canvas.nodeCreator.selectItem('Customer Datastore (aura training)');

		await expect(aura.page.getByTestId('actions-panel-no-triggers-callout')).toBeVisible();
		await expect(aura.canvas.nodeCreator.getItem('On a Schedule')).toBeVisible();
		await expect(aura.canvas.nodeCreator.getItem('On a Webhook call')).toBeVisible();
	});

	test('should show intro callout if user has not made a production execution', async ({
		aura,
	}) => {
		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor('Customer Datastore (aura training)');
		await aura.canvas.nodeCreator.selectItem('Customer Datastore (aura training)');

		await expect(aura.page.getByTestId('actions-panel-activation-callout')).toBeVisible();
	});

	test('should show Trigger and Actions sections during search', async ({ aura }) => {
		await aura.canvas.nodeCreator.open();
		await aura.canvas.nodeCreator.searchFor('Customer Datastore (aura training)');
		await aura.canvas.nodeCreator.selectItem('Customer Datastore (aura training)');

		await aura.canvas.nodeCreator.searchFor('Non existent action name');

		await expect(aura.canvas.nodeCreator.getCategoryItem('Triggers')).toBeVisible();
		await expect(aura.canvas.nodeCreator.getCategoryItem('Actions')).toBeVisible();
		await expect(aura.page.getByTestId('actions-panel-no-triggers-callout')).toBeVisible();
		await expect(aura.canvas.nodeCreator.getItem('On a Schedule')).toBeVisible();
		await expect(aura.canvas.nodeCreator.getItem('On a Webhook call')).toBeVisible();
	});
});
