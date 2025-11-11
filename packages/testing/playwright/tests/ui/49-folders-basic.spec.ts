import { test, expect } from '../../fixtures/base';

test.describe('Folders - Basic Operations', () => {
	const FOLDER_CREATED_NOTIFICATION = 'Folder created';
	test('should create folder from the workflows page using addResource dropdown', async ({
		aura,
	}) => {
		await aura.start.fromNewProject();
		const folderName = await aura.workflows.addFolder();
		await expect(aura.workflows.cards.getFolder(folderName)).toBeVisible();
		await expect(aura.workflows.cards.getFolders()).toHaveCount(1);
	});

	test('should create folder from inside a folder', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		const folder = await aura.api.projects.createFolder(projectId);
		const folderName = folder.name;
		await aura.workflows.cards.openFolder(folderName);
		const childFolderName = await aura.workflows.addFolder();
		await expect(aura.workflows.cards.getFolder(childFolderName)).toBeVisible();
	});

	test('should create a folder from breadcrumbs', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		const folder = await aura.api.projects.createFolder(projectId);
		const folderName = folder.name;
		await aura.workflows.cards.openFolder(folderName);
		// This opens the folder actions menu
		await aura.workflows.getFolderBreadcrumbsActions().click();

		await aura.workflows.getFolderBreadcrumbsAction('create').click();
		const childFolderName = 'My Child Folder';
		await aura.workflows.fillFolderModal(childFolderName);

		await expect(aura.workflows.cards.getFolder(childFolderName)).toBeVisible();
	});

	test('should create a folder from the list header button', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		await aura.api.projects.createFolder(projectId);
		await aura.workflows.addFolderButton().click();
		const childFolderName = 'My Child Folder';
		await aura.workflows.fillFolderModal(childFolderName);

		await expect(aura.workflows.cards.getFolder(childFolderName)).toBeVisible();
	});

	test('should create a folder from the card dropdown', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		const folder = await aura.api.projects.createFolder(projectId);
		const folderName = folder.name;
		const folderCard = aura.workflows.cards.getFolder(folderName);
		await aura.workflows.cards.openCardActions(folderCard);
		await aura.workflows.cards.getCardAction('create').click();
		const childFolderName = 'My Child Folder';
		await aura.workflows.fillFolderModal(childFolderName);
		await expect(aura.workflows.cards.getFolder(childFolderName)).toBeVisible();
	});

	test('should navigate from nested folder back to project root via breadcrumbs', async ({
		aura,
	}) => {
		const projectId = await aura.start.fromNewProject();
		const parentFolder = await aura.api.projects.createFolder(projectId);
		const childFolder = await aura.api.projects.createFolder(
			projectId,
			'Child Folder',
			parentFolder.id,
		);
		const grandChildFolder = await aura.api.projects.createFolder(
			projectId,
			'Grand Child Folder',
			childFolder.id,
		);

		await aura.navigate.toFolder(grandChildFolder.id, projectId);
		await expect(aura.breadcrumbs.getCurrentBreadcrumb()).toContainText(grandChildFolder.name);

		// Hidden breadcrumb should be visible because not all breadcrumbs can fit in the UI
		await aura.breadcrumbs.getHiddenBreadcrumbs().click();
		await expect(aura.breadcrumbs.getActionToggleDropdown(parentFolder.id)).toBeVisible();

		await aura.breadcrumbs.getBreadcrumb(childFolder.name).click();
		await expect(aura.workflows.cards.getFolder(grandChildFolder.name)).toBeVisible();

		await aura.breadcrumbs.getBreadcrumb(parentFolder.name).click();
		await expect(aura.workflows.cards.getFolder(childFolder.name)).toBeVisible();

		await aura.breadcrumbs.getHomeProjectBreadcrumb().click();
		await expect(aura.workflows.cards.getFolder(parentFolder.name)).toBeVisible();
	});

	test('should find nested folders through search from project root', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		const rootFolder = await aura.api.projects.createFolder(projectId, 'Root Test Folder');
		const childFolder = await aura.api.projects.createFolder(
			projectId,
			'Child Test Folder',
			rootFolder.id,
		);
		const grandChildFolder = await aura.api.projects.createFolder(
			projectId,
			'Grand Child Test Folder',
			childFolder.id,
		);

		// Start at project root
		await aura.navigate.toProject(projectId);

		// Search for "Grand Child" from root - should find the deeply nested folder
		await aura.workflows.search('Grand Child');

		// Verify the grandchild folder appears in search results
		await expect(aura.workflows.cards.getFolder(grandChildFolder.name)).toBeVisible();

		// Verify other folders are filtered out
		await expect(aura.workflows.cards.getFolder(rootFolder.name)).toBeHidden();
		await expect(aura.workflows.cards.getFolder(childFolder.name)).toBeHidden();

		// Clear search and verify all folders are shown again
		await aura.workflows.clearSearch();
		await expect(aura.workflows.cards.getFolder(rootFolder.name)).toBeVisible();
		await expect(aura.workflows.cards.getFolder(childFolder.name)).toBeHidden(); // Child is inside root
		await expect(aura.workflows.cards.getFolder(grandChildFolder.name)).toBeHidden(); // Grandchild is inside child
	});

	test('should create workflow in a folder', async ({ aura }) => {
		const { name: projectName, id: projectId } = await aura.api.projects.createProject();
		const folder = await aura.api.projects.createFolder(projectId);
		await aura.navigate.toFolder(folder.id, projectId);
		await aura.workflows.addResource.workflow();
		await aura.canvas.saveWorkflow();
		const successMessage = `Workflow successfully created in "${projectName}", within "${folder.name}"`;
		await expect(aura.notifications.getNotificationByTitleOrContent(successMessage)).toBeVisible();
		await aura.navigate.toFolder(folder.id, projectId);
		await expect(aura.workflows.cards.getWorkflows()).toBeVisible();
	});

	test('should not create folders with invalid names in the UI', async ({ aura }) => {
		await aura.start.fromNewProject();
		const invalidNames = ['folder[test]', 'folder/test'];
		const errorMessage = 'Folder name cannot contain the following characters';
		const emptyErrorMessage = 'Folder name cannot be empty';
		const tooLongErrorMessage = 'Folder name cannot be longer than 128 characters';
		const dotsErrorMessage = 'Folder name cannot contain only dots';
		await aura.workflows.addResource.folder();

		for (const invalidName of invalidNames) {
			await aura.modal.fillInput(invalidName);
			await expect(aura.modal.container.getByText(errorMessage, { exact: false })).toBeVisible();
		}

		await aura.modal.fillInput('');
		await expect(aura.modal.container.getByText(emptyErrorMessage)).toBeVisible();

		await aura.modal.fillInput('a'.repeat(129));
		await expect(aura.modal.container.getByText(tooLongErrorMessage)).toBeVisible();

		await aura.modal.fillInput('...');
		await expect(aura.modal.container.getByText(dotsErrorMessage)).toBeVisible();
	});

	test('should navigate to a folder using card actions', async ({ aura }) => {
		const projectId = await aura.start.fromNewProject();
		const folder = await aura.api.projects.createFolder(projectId);
		const folderName = folder.name;
		const folderCard = aura.workflows.cards.getFolder(folderName);
		await aura.workflows.cards.openCardActions(folderCard);
		await aura.workflows.cards.getCardAction('open').click();
		await expect(aura.breadcrumbs.getCurrentBreadcrumb()).toContainText(folderName);
	});

	test('should navigate to a folder using notification', async ({ aura }) => {
		await aura.start.fromNewProject();
		const folderName = await aura.workflows.addFolder();
		await aura.notifications
			.getNotificationByTitleOrContent(FOLDER_CREATED_NOTIFICATION)
			.getByText('Open folder')
			.click();
		await expect(aura.breadcrumbs.getCurrentBreadcrumb()).toContainText(folderName);
	});
});
