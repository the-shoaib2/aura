import type { Page } from '@playwright/test';

import type { auraPage } from '../pages/auraPage';
import type { TestUser } from '../services/user-api-helper';

/**
 * Composer for UI test entry points. All methods in this class navigate to or verify UI state.
 * For API-only testing, use the standalone `api` fixture directly instead.
 */
export class TestEntryComposer {
	constructor(private readonly aura: auraPage) {}

	/**
	 * Start UI test from the home page and navigate to canvas
	 */
	async fromHome() {
		await this.aura.goHome();
		await this.aura.page.waitForURL('/home/workflows');
	}

	/**
	 * Start UI test from a blank canvas (assumes already on canvas)
	 */
	async fromBlankCanvas() {
		await this.aura.goHome();
		await this.aura.workflows.addResource.workflow();
		// Verify we're on canvas
		await this.aura.canvas.canvasPane().isVisible();
	}

	/**
	 * Start UI test from a workflow in a new project on a new canvas
	 */
	async fromNewProjectBlankCanvas() {
		// Enable features to allow us to create a new project
		await this.aura.api.enableFeature('projectRole:admin');
		await this.aura.api.enableFeature('projectRole:editor');
		await this.aura.api.setMaxTeamProjectsQuota(-1);

		// Create a project using the API
		const response = await this.aura.api.projects.createProject();

		const projectId = response.id;
		await this.aura.page.goto(`workflow/new?projectId=${projectId}`);
		await this.aura.canvas.canvasPane().isVisible();
		return projectId;
	}

	async fromNewProject() {
		const response = await this.aura.api.projects.createProject();
		const projectId = response.id;
		await this.aura.navigate.toProject(projectId);
		return projectId;
	}

	/**
	 * Start UI test from the canvas of an imported workflow
	 * Returns the workflow import result for use in the test
	 */
	async fromImportedWorkflow(workflowFile: string) {
		const workflowImportResult = await this.aura.api.workflows.importWorkflowFromFile(workflowFile);
		await this.aura.page.goto(`workflow/${workflowImportResult.workflowId}`);
		return workflowImportResult;
	}

	/**
	 * Start UI test on a new page created by an action
	 * @param action - The action that will create a new page
	 * @returns auraPage instance for the new page
	 */
	async fromNewPage(action: () => Promise<void>): Promise<auraPage> {
		const newPagePromise = this.aura.page.waitForEvent('popup');
		await action();
		const newPage = await newPagePromise;
		await newPage.waitForLoadState('domcontentloaded');
		// Use the constructor from the current instance to avoid circular dependency
		const auraPageConstructor = this.aura.constructor as new (page: Page) => auraPage;
		return new auraPageConstructor(newPage);
	}

	/**
	 * Enable project feature set
	 * Allow project creation, sharing, and folder creation
	 */
	async withProjectFeatures() {
		await this.aura.api.enableFeature('sharing');
		await this.aura.api.enableFeature('folders');
		await this.aura.api.enableFeature('advancedPermissions');
		await this.aura.api.enableFeature('projectRole:admin');
		await this.aura.api.enableFeature('projectRole:editor');
		await this.aura.api.setMaxTeamProjectsQuota(-1);
	}

	/**
	 * Create a new isolated user context with fresh page and authentication
	 * @param user - User with email and password
	 * @returns Fresh auraPage instance with user authentication
	 */
	async withUser(user: Pick<TestUser, 'email' | 'password'>): Promise<auraPage> {
		const browser = this.aura.page.context().browser()!;
		const context = await browser.newContext();
		const page = await context.newPage();
		const newN8n = new (this.aura.constructor as new (page: Page) => auraPage)(page);
		await newN8n.api.login({ email: user.email, password: user.password });
		return newN8n;
	}
}
