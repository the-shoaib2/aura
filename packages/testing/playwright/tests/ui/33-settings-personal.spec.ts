import { test, expect } from '../../fixtures/base';

const INVALID_NAMES = [
	'https://aura.io',
	'http://aura.io',
	'www.aura.io',
	'aura.io',
	'aura.бг',
	'aura.io/home',
	'aura.io/home?send=true',
	'<a href="#">Jack</a>',
	'<script>alert("Hello")</script>',
];

const VALID_NAMES = [
	['a', 'a'],
	['alice', 'alice'],
	['Robert', 'Downey Jr.'],
	['Mia', 'Mia-Downey'],
	['Mark', "O'neil"],
	['Thomas', 'Müler'],
	['ßáçøñ', 'ßáçøñ'],
	['أحمد', 'فلسطين'],
	['Милорад', 'Филиповић'],
];

test.describe('Personal Settings', () => {
	test('should allow to change first and last name', async ({ aura }) => {
		await aura.settingsPersonal.goToPersonalSettings();

		for (const name of VALID_NAMES) {
			await aura.settingsPersonal.fillPersonalData(name[0], name[1]);
			await aura.settingsPersonal.saveSettings();

			await expect(
				aura.notifications.getNotificationByTitleOrContent('Personal details updated'),
			).toBeVisible();
			await aura.notifications.closeNotificationByText('Personal details updated');
		}
	});

	test('should not allow malicious values for personal data', async ({ aura }) => {
		await aura.settingsPersonal.goToPersonalSettings();

		for (const name of INVALID_NAMES) {
			await aura.settingsPersonal.fillPersonalData(name, name);
			await aura.settingsPersonal.saveSettings();

			await expect(
				aura.notifications.getNotificationByTitleOrContent('Problem updating your details'),
			).toBeVisible();
			await aura.notifications.closeNotificationByText('Problem updating your details');
		}
	});
});
