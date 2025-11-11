import { test, expect } from '../../fixtures/base';

test.describe
	.serial('Worker View', () => {
		test.describe('unlicensed', () => {
			test.beforeEach(async ({ aura }) => {
				await aura.api.disableFeature('workerView');
				await aura.api.disableFeature('workerView');
				await aura.api.setQueueMode(false);
			});

			test('should not show up in the menu sidebar', async ({ aura }) => {
				await aura.workerView.visitWorkerView();
				await expect(aura.workerView.getWorkerMenuItem()).toBeHidden();
			});

			test('should show action box', async ({ aura }) => {
				await aura.workerView.visitWorkerView();
				await expect(aura.workerView.getWorkerViewUnlicensed()).toBeVisible();
			});
		});

		test.describe('licensed', () => {
			test.beforeEach(async ({ aura }) => {
				await aura.api.enableFeature('workerView');
				await aura.api.setQueueMode(true);
			});

			test('should show up in the menu sidebar', async ({ aura }) => {
				await aura.goHome();
				await aura.workerView.visitWorkerView();
				await expect(aura.workerView.getWorkerMenuItem()).toBeVisible();
			});

			test('should show worker list view', async ({ aura }) => {
				await aura.workerView.visitWorkerView();
				await expect(aura.workerView.getWorkerViewLicensed()).toBeVisible();
			});
		});
	});
