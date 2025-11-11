import { customAlphabet } from 'nanoid';

import { INSTANCE_OWNER_CREDENTIALS } from '../../config/test-users';
import { test, expect } from '../../fixtures/base';

test.describe('User Management', () => {
	test('should login and logout @auth:none', async ({ aura }) => {
		await aura.goHome();
		await aura.signIn.goToSignIn();
		await aura.signIn.loginWithEmailAndPassword(
			INSTANCE_OWNER_CREDENTIALS.email,
			INSTANCE_OWNER_CREDENTIALS.password,
		);
		await expect(aura.workflows.getProjectName()).toBeVisible();
	});

	test('should prevent non-owners to access UM settings', async ({ aura }) => {
		// This creates a new user in the same context, so the cookies are refreshed and owner is no longer logged in
		await aura.api.users.create();
		await aura.navigate.toUsers();
		await expect(aura.workflows.getProjectName()).toBeVisible();
	});

	test('should allow instance owner to access UM settings', async ({ aura }) => {
		await aura.navigate.toUsers();
		expect(aura.page.url()).toContain('/settings/users');
	});

	test('should be able to change user role to Admin and back', async ({ aura, api }) => {
		const user = await api.users.create();
		await aura.navigate.toUsers();
		await aura.settingsUsers.search(user.email);
		await aura.settingsUsers.selectAccountType(user.email, 'Admin');
		await expect(aura.settingsUsers.getAccountType(user.email)).toHaveText('Admin');
		await aura.settingsUsers.selectAccountType(user.email, 'Member');
		await expect(aura.settingsUsers.getAccountType(user.email)).toHaveText('Member');
	});

	test('should be able to change theme', async ({ aura }) => {
		await aura.navigate.toPersonalSettings();
		await aura.settingsPersonal.changeTheme('Dark theme');
		await expect(
			aura.notifications.getNotificationByTitleOrContent('Personal details updated'),
		).toBeVisible();
		await expect(aura.page.locator('body')).toHaveAttribute('data-theme', 'dark');
	});

	test('should delete user and their data', async ({ aura, api }) => {
		const user = await api.users.create();
		await aura.navigate.toUsers();
		await aura.page.reload();

		await aura.settingsUsers.search(user.email);
		await expect(aura.settingsUsers.getRow(user.email)).toBeVisible();

		await aura.settingsUsers.clickDeleteUser(user.email);
		await aura.settingsUsers.deleteData();
		await expect(aura.notifications.getNotificationByTitleOrContent('User deleted')).toBeVisible();
	});

	test('should delete user and transfer their data', async ({ aura, api }) => {
		const ownerEmail = INSTANCE_OWNER_CREDENTIALS.email;
		const user = await api.users.create();
		await aura.navigate.toUsers();
		await aura.page.reload();

		await aura.settingsUsers.search(user.email);
		await aura.settingsUsers.getRow(user.email).isVisible();

		await aura.settingsUsers.clickDeleteUser(user.email);
		await aura.settingsUsers.transferData(ownerEmail);
		await expect(aura.notifications.getNotificationByTitleOrContent('User deleted')).toBeVisible();
	});

	test('should allow user to change their personal data', async ({ aura }) => {
		await aura.api.users.create();
		await aura.navigate.toPersonalSettings();

		await aura.settingsPersonal.fillPersonalData('Something', 'Else');
		await aura.settingsPersonal.saveSettings();
		await expect(
			aura.notifications.getNotificationByTitleOrContent('Personal details updated'),
		).toBeVisible();

		await aura.page.reload();
		await expect(aura.settingsPersonal.getFirstNameField()).toHaveValue('Something');
		await expect(aura.settingsPersonal.getLastNameField()).toHaveValue('Else');
	});

	test("shouldn't allow user to set weak password", async ({ aura }) => {
		const user = await aura.api.users.create();
		await aura.navigate.toPersonalSettings();
		await aura.settingsPersonal.getChangePasswordLink().click();

		await aura.settingsPersonal.currentPassword().fill(user.password);
		await aura.settingsPersonal.newPassword().fill('abc');
		await aura.settingsPersonal.repeatPassword().fill('abc');
		await expect(
			aura.settingsPersonal
				.changePasswordModal()
				.getByText('8+ characters, at least 1 number and 1 capital letter'),
		).toBeVisible();
	});

	test("shouldn't allow user to change password if old password is wrong", async ({ aura }) => {
		await aura.navigate.toPersonalSettings();
		await aura.settingsPersonal.getChangePasswordLink().click();
		await aura.settingsPersonal.currentPassword().fill('wrong');
		await aura.settingsPersonal.newPassword().fill('Keybo4rd');
		await aura.settingsPersonal.repeatPassword().fill('Keybo4rd');
		await aura.settingsPersonal.changePasswordButton().click();
		await expect(
			aura.notifications.getNotificationByTitleOrContent('Provided current password is incorrect.'),
		).toBeVisible();
	});

	test('should change current user password', async ({ aura }) => {
		const user = await aura.api.users.create();
		await aura.navigate.toPersonalSettings();
		await aura.settingsPersonal.getChangePasswordLink().click();
		await aura.settingsPersonal.currentPassword().fill(user.password);
		await aura.settingsPersonal.newPassword().fill('Keybo4rd');
		await aura.settingsPersonal.repeatPassword().fill('Keybo4rd');
		await aura.settingsPersonal.changePasswordButton().click();
		await expect(
			aura.notifications.getNotificationByTitleOrContent('Password updated'),
		).toBeVisible();
	});

	test("shouldn't allow users to set invalid email", async ({ aura }) => {
		await aura.api.users.create();
		await aura.navigate.toPersonalSettings();
		await aura.settingsPersonal.fillEmail('something_else');
		await expect(aura.settingsPersonal.getSaveSettingsButton()).toBeDisabled();
	});

	test('should change user email', async ({ aura }) => {
		const user = await aura.api.users.create();
		const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
		const newEmail = `something${nanoid()}@acme.corp`;
		await aura.navigate.toPersonalSettings();
		await aura.settingsPersonal.fillEmail(newEmail);
		await aura.settingsPersonal.saveSettings();
		await aura.settingsPersonal.currentPassword().fill(user.password);
		await aura.modal.clickButton('Confirm');
		await expect(
			aura.notifications.getNotificationByTitleOrContent('Personal details updated'),
		).toBeVisible();

		const newTestUser = {
			email: newEmail,
			password: user.password,
		};
		const secondBrowser = await aura.start.withUser(newTestUser);
		await secondBrowser.navigate.toPersonalSettings();
		await expect(secondBrowser.settingsPersonal.getEmailField()).toHaveValue(newEmail);
	});
});
