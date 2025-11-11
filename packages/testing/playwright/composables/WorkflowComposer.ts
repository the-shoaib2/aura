import type { Request } from '@playwright/test';
import { expect } from '@playwright/test';
import type { IWorkflowBase } from 'workflow';
import { nanoid } from 'nanoid';

import type { auraPage } from '../pages/auraPage';

/**
 * A class for user interactions with workflows that go across multiple pages.
 */
export class WorkflowComposer {
	constructor(private readonly aura: auraPage) {}

	/**
	 * Executes a successful workflow and waits for the notification to be closed.
	 * This waits for http calls and also closes the notification.
	 */
	async executeWorkflowAndWaitForNotification(
		notificationMessage: string,
		options: { timeout?: number } = {},
	) {
		const { timeout = 3000 } = options;
		const responsePromise = this.aura.page.waitForResponse(
			(response) =>
				response.url().includes('/rest/workflows/') &&
				response.url().includes('/run') &&
				response.request().method() === 'POST',
		);

		await this.aura.canvas.clickExecuteWorkflowButton();
		await responsePromise;
		await this.aura.notifications.waitForNotificationAndClose(notificationMessage, { timeout });
	}

	/**
	 * Creates a new workflow by clicking the add workflow button and setting the name
	 * @param workflowName - The name of the workflow to create
	 */
	async createWorkflow(workflowName = 'My New Workflow') {
		await this.aura.workflows.addResource.workflow();
		await this.aura.canvas.setWorkflowName(workflowName);

		const responsePromise = this.aura.page.waitForResponse(
			(response) =>
				response.url().includes('/rest/workflows') && response.request().method() === 'POST',
		);
		await this.aura.canvas.saveWorkflow();

		await responsePromise;
	}

	/**
	 * Creates a new workflow by importing a JSON file
	 * @param fileName - The workflow JSON file name (e.g., 'test_pdf_workflow.json', will search in workflows folder)
	 * @param name - Optional custom name. If not provided, generates a unique name
	 * @returns The actual workflow name that was used
	 */
	async createWorkflowFromJsonFile(
		fileName: string,
		name?: string,
	): Promise<{ workflowName: string }> {
		const workflowName = name ?? `Imported Workflow ${nanoid(8)}`;
		await this.aura.goHome();
		await this.aura.workflows.addResource.workflow();
		await this.aura.canvas.importWorkflow(fileName, workflowName);
		return { workflowName };
	}

	/**
	 * Creates a new workflow by importing from a URL
	 * @param url - The URL to import the workflow from
	 * @returns Promise that resolves when the import is complete
	 */
	async importWorkflowFromURL(url: string): Promise<void> {
		await this.aura.workflows.addResource.workflow();
		await this.aura.canvas.clickWorkflowMenu();
		await this.aura.canvas.clickImportFromURL();
		await this.aura.canvas.fillImportURLInput(url);
		await this.aura.canvas.clickConfirmImportURL();
	}

	/**
	 * Opens the import from URL dialog and then dismisses it by clicking outside
	 */
	async openAndDismissImportFromURLDialog(): Promise<void> {
		await this.aura.workflows.addResource.workflow();
		await this.aura.canvas.clickWorkflowMenu();
		await this.aura.canvas.clickImportFromURL();
		await this.aura.canvas.clickOutsideModal();
	}

	/**
	 * Opens the import from URL dialog and then cancels it
	 */
	async openAndCancelImportFromURLDialog(): Promise<void> {
		await this.aura.workflows.addResource.workflow();
		await this.aura.canvas.clickWorkflowMenu();
		await this.aura.canvas.clickImportFromURL();
		await this.aura.canvas.clickCancelImportURL();
	}

	/**
	 * Saves the current workflow and waits for the POST request to complete
	 * @returns The Request object containing the save request details
	 */
	async saveWorkflowAndWaitForRequest(): Promise<Request> {
		const saveRequestPromise = this.aura.page.waitForRequest(
			(req) => req.url().includes('/rest/workflows') && req.method() === 'POST',
		);
		await this.aura.canvas.clickSaveWorkflowButton();
		return await saveRequestPromise;
	}

	/**
	 * Duplicates a workflow via the duplicate modal UI.
	 * Verifies the form interaction completes without errors.
	 * Note: This opens a new window/tab with the duplicated workflow but doesn't interact with it.
	 * @param name - The name for the duplicated workflow
	 * @param tag - Optional tag to add to the workflow
	 */
	async duplicateWorkflow(name: string, tag?: string): Promise<void> {
		await this.aura.workflowSettingsModal.getWorkflowMenu().click();
		await this.aura.workflowSettingsModal.getDuplicateMenuItem().click();

		const modal = this.aura.workflowSettingsModal.getDuplicateModal();
		await expect(modal).toBeVisible();

		const nameInput = this.aura.workflowSettingsModal.getDuplicateNameInput();
		await expect(nameInput).toBeVisible();
		await nameInput.press('ControlOrMeta+a');
		await nameInput.fill(name);

		if (tag) {
			const tagsInput = this.aura.workflowSettingsModal.getDuplicateTagsInput();
			await tagsInput.fill(tag);
			await tagsInput.press('Enter');
			await tagsInput.press('Escape');
		}

		const saveButton = this.aura.workflowSettingsModal.getDuplicateSaveButton();
		await expect(saveButton).toBeVisible();
		await saveButton.click();
	}

	/**
	 * Get workflow by name via API
	 * @param workflowName - Name of the workflow to find
	 * @returns Workflow object with id, name, and other properties
	 */
	async getWorkflowByName(workflowName: string): Promise<IWorkflowBase> {
		const response = await this.aura.api.request.get('/rest/workflows', {
			params: new URLSearchParams({ filter: JSON.stringify({ name: workflowName }) }),
		});
		const workflows = await response.json();
		return workflows.data[0];
	}

	/**
	 * Moves a workflow to a different project or user.
	 * @param workflowName - The name of the workflow to move
	 * @param projectNameOrEmail - The destination project name or user email
	 * @param folder - The folder name (e.g., 'My Folder') or 'No folder (project root)' to place the workflow at project root level.
	 *   Pass null when moving to another user's personal project, as users cannot create folders in other users' personal spaces,
	 *   so the folder dropdown will not be shown. Defaults to 'No folder (project root)' which places the workflow at the root level.
	 */
	async moveToProject(
		workflowName: string,
		projectNameOrEmail: string,
		folder: string | null = 'No folder (project root)',
	): Promise<void> {
		const workflowCard = this.aura.workflows.cards.getWorkflow(workflowName);
		await this.aura.workflows.cards.openCardActions(workflowCard);
		await this.aura.workflows.cards.getCardAction('moveToFolder').click();
		await this.selectProjectInMoveModal(projectNameOrEmail);

		if (folder !== null) {
			// Wait for folder dropdown to appear after project selection
			await this.aura.resourceMoveModal.getFolderSelect().waitFor({ state: 'visible' });
			await this.selectFolderInMoveModal(folder);
		}

		await this.aura.resourceMoveModal.clickConfirmMoveButton();
	}

	private async selectProjectInMoveModal(projectNameOrEmail: string): Promise<void> {
		const workflowSelect = this.aura.resourceMoveModal.getProjectSelect();
		const input = workflowSelect.locator('input');
		await input.click();
		await input.waitFor({ state: 'visible' });
		await this.aura.page.keyboard.press('ControlOrMeta+a');
		await this.aura.page.keyboard.press('Backspace');
		await this.aura.page.keyboard.type(projectNameOrEmail, { delay: 50 });

		const projectOption = this.aura.page
			.getByTestId('project-sharing-info')
			.getByText(projectNameOrEmail)
			.first();
		await projectOption.waitFor({ state: 'visible' });
		await projectOption.click();
	}

	private async selectFolderInMoveModal(folderName: string): Promise<void> {
		await this.aura.resourceMoveModal.getFolderSelect().locator('input').click();
		await this.aura.page.keyboard.type(folderName, { delay: 50 });

		const folderOption = this.aura.page.getByTestId('move-to-folder-option').getByText(folderName);
		await folderOption.waitFor({ state: 'visible' });
		await folderOption.click();
	}
}
