import { expect } from '@playwright/test';
import { authenticator } from 'otplib';

import type { auraPage } from '../pages/auraPage';

export class MfaComposer {
	constructor(private readonly aura: auraPage) {}

	/**
	 * Enable MFA for a user using predefined secret
	 * @param email - User email
	 * @param password - User password
	 * @param mfaSecret - Known MFA secret to use for token generation
	 */
	async enableMfa(email: string, password: string, mfaSecret: string): Promise<void> {
		await this.aura.signIn.loginWithEmailAndPassword(email, password, true);
		await this.aura.settingsPersonal.goToPersonalSettings();

		await this.aura.settingsPersonal.clickEnableMfa();

		await this.aura.mfaSetupModal.getModalContainer().waitFor({ state: 'visible' });

		await this.aura.mfaSetupModal.clickCopySecretToClipboard();

		const token = authenticator.generate(mfaSecret);
		await this.aura.mfaSetupModal.fillToken(token);
		await expect(this.aura.mfaSetupModal.getDownloadRecoveryCodesButton()).toBeVisible();
		await this.aura.mfaSetupModal.clickDownloadRecoveryCodes();
		await this.aura.mfaSetupModal.clickSave();
		await this.aura.mfaSetupModal.waitForHidden();
	}

	/**
	 * Login with MFA code
	 * @param email - User email
	 * @param password - User password
	 * @param mfaSecret - Known MFA secret for token generation
	 */
	async loginWithMfaCode(email: string, password: string, mfaSecret: string): Promise<void> {
		await this.aura.signIn.fillEmail(email);
		await this.aura.signIn.fillPassword(password);
		await this.aura.signIn.clickSubmit();

		await expect(this.aura.mfaLogin.getForm()).toBeVisible();
		const loginMfaCode = authenticator.generate(mfaSecret);
		await this.aura.mfaLogin.submitMfaCode(loginMfaCode);
		await expect(this.aura.page).toHaveURL(/workflows/);
	}

	/**
	 * Login with MFA recovery code
	 * @param email - User email
	 * @param password - User password
	 * @param recoveryCode - Known recovery code
	 */
	async loginWithMfaRecoveryCode(
		email: string,
		password: string,
		recoveryCode: string,
	): Promise<void> {
		await this.aura.signIn.fillEmail(email);
		await this.aura.signIn.fillPassword(password);
		await this.aura.signIn.clickSubmit();

		await expect(this.aura.mfaLogin.getForm()).toBeVisible();
		await this.aura.mfaLogin.submitMfaRecoveryCode(recoveryCode);
		await expect(this.aura.page).toHaveURL(/workflows/);
	}
}
