import { test, expect } from '../../fixtures/base';

test.describe('Admin user', () => {
	test('should see same Settings sub menu items as instance owner', async ({ aura }) => {
		await aura.api.setupTest('signin-only', 'owner');
		await aura.settingsPersonal.goToSettings();

		const ownerMenuItems = await aura.settingsPersonal.getMenuItems().count();

		await aura.api.setupTest('signin-only', 'admin');
		await aura.settingsPersonal.goToSettings();

		await expect(aura.settingsPersonal.getMenuItems()).toHaveCount(ownerMenuItems);
	});
});
