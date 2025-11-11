import type { CreateCredentialDto } from '@aura/api-types';

import type { auraPage } from '../pages/auraPage';

export class CredentialsComposer {
	constructor(private readonly aura: auraPage) {}

	/**
	 * Create a credential through the Credentials list UI.
	 * Expects the visible label of the credential type (e.g. 'Notion API').
	 */
	async createFromList(
		credentialType: string,
		fields: Record<string, string>,
		options?: { name?: string; projectId?: string; closeDialog?: boolean },
	) {
		if (options?.projectId) {
			await this.aura.navigate.toCredentials(options.projectId);
		} else {
			await this.aura.navigate.toCredentials();
		}

		await this.aura.credentials.addResource.credential();
		await this.aura.credentials.createCredentialFromCredentialPicker(credentialType, fields, {
			name: options?.name,
			closeDialog: options?.closeDialog,
		});
	}

	/**
	 * Create a credential through the NDV flow.
	 * Type is implied by the open node's credential requirement.
	 */
	async createFromNdv(
		fields: Record<string, string>,
		options?: { name?: string; closeDialog?: boolean },
	) {
		await this.aura.ndv.clickCreateNewCredential();
		await this.aura.canvas.credentialModal.addCredential(fields, {
			name: options?.name,
			closeDialog: options?.closeDialog,
		});
	}

	/**
	 * Create a credential directly via API. Returns created credential object.
	 */
	async createFromApi(payload: CreateCredentialDto & { projectId?: string }) {
		return await this.aura.api.credentials.createCredential(payload);
	}

	/**
	 * Moves a credential to a different project.
	 * @param credentialName - The name of the credential to move
	 * @param projectNameOrEmail - The destination project name or user email
	 */
	async moveToProject(credentialName: string, projectNameOrEmail: string): Promise<void> {
		const credentialCard = this.aura.credentials.cards.getCredential(credentialName);
		await this.aura.credentials.cards.openCardActions(credentialCard);
		await this.aura.credentials.cards.getCardAction('move').click();
		await this.aura.resourceMoveModal.getProjectSelectCredential().locator('input').click();
		await this.aura.resourceMoveModal.selectProjectOption(projectNameOrEmail);
		await this.aura.resourceMoveModal.clickMoveCredentialButton();
	}
}
