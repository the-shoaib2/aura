import { expect } from '@playwright/test';

import type { auraPage } from '../pages/auraPage';

/**
 * A class for user interactions with templates that go across multiple pages.
 */
export class TemplatesComposer {
	constructor(private readonly aura: auraPage) {}

	/**
	 * Navigates to templates page, waits for loading to complete,
	 * selects the first available template, and imports it to a new workflow
	 * @returns Promise that resolves when the template has been imported
	 */
	async importFirstTemplate(): Promise<void> {
		await this.aura.navigate.toTemplates();
		await expect(this.aura.templates.getSkeletonLoader()).toBeHidden();
		await expect(this.aura.templates.getFirstTemplateCard()).toBeVisible();
		await expect(this.aura.templates.getTemplatesLoadingContainer()).toBeHidden();

		await this.aura.templates.clickFirstTemplateCard();
		await expect(this.aura.templates.getUseTemplateButton()).toBeVisible();

		await this.aura.templates.clickUseTemplateButton();
		await expect(this.aura.page).toHaveURL(/\/workflow\/new/);
	}

	/**
	 * Fill in dummy credentials for an app in the template credential setup flow
	 * Opens credential creation, fills name, saves, and closes modal
	 * @param appName - The name of the app (e.g. 'Shopify', 'X (Formerly Twitter)')
	 */
	async fillDummyCredentialForApp(appName: string): Promise<void> {
		await this.aura.templateCredentialSetup.openCredentialCreation(appName);
		await this.aura.templateCredentialSetup.credentialModal.getCredentialName().click();
		await this.aura.templateCredentialSetup.credentialModal.getNameInput().fill('test');
		await this.aura.templateCredentialSetup.credentialModal.save();
		await this.aura.templateCredentialSetup.credentialModal.close();
	}

	/**
	 * Fill in dummy credentials for an app and handle confirmation dialog
	 * @param appName - The name of the app
	 */
	async fillDummyCredentialForAppWithConfirm(appName: string): Promise<void> {
		await this.fillDummyCredentialForApp(appName);
		await this.aura.templateCredentialSetup.dismissMessageBox();
	}
}
