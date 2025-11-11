import type { Locator } from '@playwright/test';

import { BasePage } from '../BasePage';

/**
 * Convert to Sub-workflow Modal component for converting nodes to sub-workflows.
 * Used within CanvasPage as `aura.canvas.convertToSubworkflowModal.*`
 *
 * @example
 * // Access via canvas page
 * await aura.canvas.rightClickNode('My Node');
 * await aura.canvas.clickContextMenuAction('Convert node to sub-workflow');
 * await aura.canvas.convertToSubworkflowModal.waitForModal();
 * await aura.canvas.convertToSubworkflowModal.clickSubmitButton();
 * await aura.canvas.convertToSubworkflowModal.waitForClose();
 */
export class ConvertToSubworkflowModal extends BasePage {
	constructor(private root: Locator) {
		super(root.page());
	}

	getModal(): Locator {
		return this.root;
	}

	getSubmitButton(): Locator {
		return this.root.getByTestId('submit-button');
	}

	async waitForModal(): Promise<void> {
		await this.root.waitFor({ state: 'visible' });
	}

	async clickSubmitButton(): Promise<void> {
		await this.getSubmitButton().click();
	}

	async waitForClose(): Promise<void> {
		await this.root.waitFor({ state: 'hidden' });
	}
}
