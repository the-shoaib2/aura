import { authenticator } from 'otplib';

import { INSTANCE_OWNER_CREDENTIALS } from '../../config/test-users';
import { test, expect } from '../../fixtures/base';

const TEST_DATA = {
	NEW_EMAIL: 'newemail@test.com',
	NEW_FIRST_NAME: 'newFirstName',
	NEW_LAST_NAME: 'newLastName',
};

const NOTIFICATIONS = {
	PERSONAL_DETAILS_UPDATED: 'Personal details updated',
};

const { email, password, mfaSecret, mfaRecoveryCodes } = INSTANCE_OWNER_CREDENTIALS;
const RECOVERY_CODE = mfaRecoveryCodes![0];

test.describe('Two-factor authentication @auth:none @db:reset', () => {
	test('Should be able to login with MFA code', async ({ aura }) => {
		await aura.mfaComposer.enableMfa(email, password, mfaSecret!);
		await aura.sideBar.signOutFromWorkflows();

		await aura.mfaComposer.loginWithMfaCode(email, password, mfaSecret!);

		await expect(aura.page).toHaveURL(/workflows/);
	});

	test('Should be able to login with MFA recovery code', async ({ aura }) => {
		await aura.mfaComposer.enableMfa(email, password, mfaSecret!);
		await aura.sideBar.signOutFromWorkflows();

		await aura.mfaComposer.loginWithMfaRecoveryCode(email, password, RECOVERY_CODE);

		await expect(aura.page).toHaveURL(/workflows/);
	});

	test('Should be able to disable MFA in account with MFA code', async ({ aura }) => {
		await aura.mfaComposer.enableMfa(email, password, mfaSecret!);
		await aura.sideBar.signOutFromWorkflows();

		await aura.mfaComposer.loginWithMfaCode(email, password, mfaSecret!);

		const disableToken = authenticator.generate(mfaSecret!);
		await aura.settingsPersonal.triggerDisableMfa();
		await aura.settingsPersonal.fillMfaCodeAndSave(disableToken);

		await expect(aura.settingsPersonal.getEnableMfaButton()).toBeVisible();
	});

	test('Should prompt for MFA code when email changes', async ({ aura }) => {
		await aura.mfaComposer.enableMfa(email, password, mfaSecret!);

		await aura.settingsPersonal.goToPersonalSettings();
		await aura.settingsPersonal.fillEmail(TEST_DATA.NEW_EMAIL);
		await aura.settingsPersonal.pressEnterOnEmail();

		const mfaCode = authenticator.generate(mfaSecret!);
		await aura.settingsPersonal.fillMfaCodeAndSave(mfaCode);

		await expect(
			aura.notifications.getNotificationByTitleOrContent(NOTIFICATIONS.PERSONAL_DETAILS_UPDATED),
		).toBeVisible();
	});

	test('Should prompt for MFA recovery code when email changes', async ({ aura }) => {
		await aura.mfaComposer.enableMfa(email, password, mfaSecret!);

		await aura.settingsPersonal.goToPersonalSettings();
		await aura.settingsPersonal.fillEmail(TEST_DATA.NEW_EMAIL);
		await aura.settingsPersonal.pressEnterOnEmail();

		await expect(aura.settingsPersonal.getMfaCodeOrRecoveryCodeInput()).toBeVisible();
	});

	test('Should not prompt for MFA code or recovery code when first name or last name changes', async ({
		aura,
	}) => {
		await aura.mfaComposer.enableMfa(email, password, mfaSecret!);

		await aura.settingsPersonal.updateFirstAndLastName(
			TEST_DATA.NEW_FIRST_NAME,
			TEST_DATA.NEW_LAST_NAME,
		);

		await expect(
			aura.notifications.getNotificationByTitleOrContent(NOTIFICATIONS.PERSONAL_DETAILS_UPDATED),
		).toBeVisible();
	});

	test('Should be able to disable MFA in account with recovery code', async ({ aura }) => {
		await aura.mfaComposer.enableMfa(email, password, mfaSecret!);
		await aura.sideBar.signOutFromWorkflows();

		await aura.mfaComposer.loginWithMfaCode(email, password, mfaSecret!);

		await aura.settingsPersonal.triggerDisableMfa();
		await aura.settingsPersonal.fillMfaCodeAndSave(RECOVERY_CODE);

		await expect(aura.settingsPersonal.getEnableMfaButton()).toBeVisible();
	});
});
