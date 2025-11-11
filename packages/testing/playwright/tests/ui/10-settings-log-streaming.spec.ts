import { test, expect } from '../../fixtures/base';

const DESTINATION_NAMES = {
	FIRST: 'Destination 0',
	SECOND: 'Destination 1',
} as const;

const MODAL_MAX_WIDTH = 500;

test.describe('Log Streaming Settings', () => {
	test.describe.configure({ mode: 'serial' });
	test.describe('unlicensed', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.api.disableFeature('logStreaming');
		});

		test('should show the unlicensed view when the feature is disabled', async ({ aura }) => {
			await aura.navigate.toLogStreaming();
			await expect(aura.settingsLogStreaming.getActionBoxUnlicensed()).toBeVisible();
			await expect(aura.settingsLogStreaming.getContactUsButton()).toBeVisible();
			await expect(aura.settingsLogStreaming.getActionBoxLicensed()).not.toBeAttached();
		});
	});

	test.describe('licensed', () => {
		test.beforeEach(async ({ aura }) => {
			await aura.api.enableFeature('logStreaming');
			await aura.navigate.toLogStreaming();
		});

		test('should show the licensed view when the feature is enabled', async ({ aura }) => {
			await expect(aura.settingsLogStreaming.getActionBoxLicensed()).toBeVisible();
			await expect(aura.settingsLogStreaming.getAddFirstDestinationButton()).toBeVisible();
			await expect(aura.settingsLogStreaming.getActionBoxUnlicensed()).not.toBeAttached();
		});

		test('should show the add destination modal', async ({ aura }) => {
			await aura.settingsLogStreaming.clickAddFirstDestination();
			await expect(aura.settingsLogStreaming.getDestinationModal()).toBeVisible();
			await expect(aura.settingsLogStreaming.getSelectDestinationType()).toBeVisible();
			await expect(aura.settingsLogStreaming.getSelectDestinationButton()).toBeVisible();
			await expect(aura.settingsLogStreaming.getSelectDestinationButton()).toBeDisabled();

			const modal = aura.settingsLogStreaming.getDestinationModal();
			const width = await modal.evaluate((element) => {
				return parseInt(window.getComputedStyle(element).width.replace('px', ''));
			});
			expect(width).toBeLessThan(MODAL_MAX_WIDTH);

			await aura.settingsLogStreaming.clickSelectDestinationType();
			await aura.settingsLogStreaming.selectDestinationType(0);
			await expect(aura.settingsLogStreaming.getSelectDestinationButton()).toBeEnabled();
			await aura.settingsLogStreaming.closeModalByClickingOverlay();
			await expect(aura.settingsLogStreaming.getDestinationModal()).not.toBeAttached();
		});

		test('should create a destination and delete it', async ({ aura }) => {
			await aura.settingsLogStreaming.createDestination(DESTINATION_NAMES.FIRST);
			await aura.page.reload();
			await aura.settingsLogStreaming.clickDestinationCard(0);
			await expect(aura.settingsLogStreaming.getDestinationDeleteButton()).toBeVisible();
			await aura.settingsLogStreaming.deleteDestination();
			await expect(aura.settingsLogStreaming.getConfirmationDialog()).toBeVisible();
			await aura.settingsLogStreaming.cancelDialog();
			await aura.settingsLogStreaming.deleteDestination();
			await expect(aura.settingsLogStreaming.getConfirmationDialog()).toBeVisible();
			await aura.settingsLogStreaming.confirmDialog();
		});

		test('should create a destination and delete it via card actions', async ({ aura }) => {
			await aura.settingsLogStreaming.createDestination(DESTINATION_NAMES.SECOND);
			await aura.page.reload();

			await aura.settingsLogStreaming.clickDestinationCardDropdown(0);
			await aura.settingsLogStreaming.clickDropdownMenuItem(0);
			await expect(aura.settingsLogStreaming.getDestinationSaveButton()).not.toBeAttached();
			await aura.settingsLogStreaming.closeModalByClickingOverlay();

			await aura.settingsLogStreaming.clickDestinationCardDropdown(0);
			await aura.settingsLogStreaming.clickDropdownMenuItem(1);
			await expect(aura.settingsLogStreaming.getConfirmationDialog()).toBeVisible();
			await aura.settingsLogStreaming.confirmDialog();
		});
	});
});
