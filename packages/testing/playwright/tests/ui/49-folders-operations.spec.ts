import { test, expect } from '../../fixtures/base';

test.describe('Folders - Operations', () => {
	test.describe('Rename and delete folders', () => {
		test('should rename folder from breadcrumb dropdown', async ({ aura }) => {
			await aura.start.fromNewProject();
			const folderName = await aura.workflows.addFolder();
			const folderCard = aura.workflows.cards.getFolder(folderName);
			await aura.workflows.cards.openCardActions(folderCard);
			await aura.workflows.cards.getCardAction('open').click();
			await aura.breadcrumbs.renameCurrentBreadcrumb('Renamed');
			await aura.breadcrumbs.getHomeProjectBreadcrumb().click();
			await expect(aura.workflows.cards.getFolder('Renamed')).toBeVisible();
		});

		test('should rename folder from card dropdown', async ({ aura }) => {
			await aura.start.fromNewProject();
			const folderName = await aura.workflows.addFolder();
			const folderCard = aura.workflows.cards.getFolder(folderName);
			await aura.workflows.cards.openCardActions(folderCard);
			await aura.workflows.cards.getCardAction('rename').click();
			await aura.workflows.fillFolderModal('Renamed', 'Rename');
			await expect(aura.workflows.cards.getFolder('Renamed')).toBeVisible();
		});

		test('should delete empty folder from card dropdown', async ({ aura }) => {
			await aura.start.fromNewProject();
			const folderName = await aura.workflows.addFolder();
			await aura.workflows.cards.deleteFolder(folderName);
			await expect(aura.workflows.cards.getFolder(folderName)).toBeHidden();
		});

		test('should delete empty folder from breadcrumb dropdown', async ({ aura }) => {
			await aura.start.fromNewProject();
			const folderName = await aura.workflows.addFolder();
			await aura.workflows.cards.openFolder(folderName);
			await aura.breadcrumbs.getFolderBreadcrumbsActionToggle().click();
			await aura.breadcrumbs.getActionToggleDropdown('delete').click();
			await expect(aura.workflows.cards.getFolder(folderName)).toBeHidden();
		});

		test('should warn before deleting non-empty folder from breadcrumb dropdown', async ({
			aura,
		}) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const folder = await aura.api.projects.createFolder(projectId);
			await aura.api.workflows.createInProject(projectId, {
				folder: folder.id,
			});
			await aura.navigate.toFolder(folder.id, projectId);
			await aura.breadcrumbs.getFolderBreadcrumbsActionToggle().click();
			await aura.breadcrumbs.getActionToggleDropdown('delete').click();
			await expect(aura.workflows.deleteFolderModal()).toBeVisible();
			await expect(aura.workflows.deleteModalConfirmButton()).toBeDisabled();
		});

		test('should warn before deleting non-empty folder from card dropdown', async ({ aura }) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const folder = await aura.api.projects.createFolder(projectId);
			await aura.api.workflows.createInProject(projectId, {
				folder: folder.id,
			});
			await aura.navigate.toProject(projectId);
			const folderCard = aura.workflows.cards.getFolder(folder.name);
			await aura.workflows.cards.openCardActions(folderCard);
			await aura.workflows.cards.getCardAction('delete').click();
			await expect(aura.workflows.deleteFolderModal()).toBeVisible();
			await expect(aura.workflows.deleteModalConfirmButton()).toBeDisabled();
		});

		test('should transfer contents when deleting non-empty folder - from card dropdown', async ({
			aura,
		}) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const folderToDelete = await aura.api.projects.createFolder(projectId);
			await aura.api.workflows.createInProject(projectId, {
				folder: folderToDelete.id,
			});
			const destinationFolder = await aura.api.projects.createFolder(projectId);

			await aura.navigate.toProject(projectId);

			const folderCard = aura.workflows.cards.getFolder(folderToDelete.name);
			await aura.workflows.cards.openCardActions(folderCard);
			await aura.workflows.cards.getCardAction('delete').click();
			await aura.workflows.deleteModalTransferRadioButton().click();
			await aura.workflows.transferFolderDropdown().click();
			await aura.workflows.transferFolderOption(destinationFolder.name).click();
			await aura.workflows.deleteModalConfirmButton().click();

			await expect(
				aura.notifications.getNotificationByTitleOrContent('Folder deleted'),
			).toBeVisible();

			await aura.navigate.toFolder(destinationFolder.id, projectId);
			await expect(aura.workflows.cards.getWorkflows()).toBeVisible();
		});
	});

	test.describe('Move folders and workflows', () => {
		test('should move empty folder to another folder - from folder card action', async ({
			aura,
		}) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const sourceFolder = await aura.api.projects.createFolder(projectId);
			const destinationFolder = await aura.api.projects.createFolder(projectId);

			await aura.navigate.toProject(projectId);

			const sourceFolderCard = aura.workflows.cards.getFolder(sourceFolder.name);
			await aura.workflows.cards.openCardActions(sourceFolderCard);
			await aura.workflows.cards.getCardAction('move').click();

			await expect(aura.workflows.moveFolderModal()).toBeVisible();
			await aura.workflows.moveFolderDropdown().click();
			await aura.workflows.moveFolderOption(destinationFolder.name).click();
			await aura.workflows.moveFolderConfirmButton().click();

			await expect(
				aura.notifications.getNotificationByTitleOrContent('Successfully moved folder'),
			).toBeVisible();

			await aura.navigate.toFolder(destinationFolder.id, projectId);
			await expect(aura.workflows.cards.getFolder(sourceFolder.name)).toBeVisible();
		});

		test('should move folder with contents to another folder - from folder card action', async ({
			aura,
		}) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const sourceFolder = await aura.api.projects.createFolder(projectId);
			const destinationFolder = await aura.api.projects.createFolder(projectId);

			await aura.api.workflows.createInProject(projectId, {
				folder: sourceFolder.id,
			});

			await aura.navigate.toProject(projectId);

			const sourceFolderCard = aura.workflows.cards.getFolder(sourceFolder.name);
			await aura.workflows.cards.openCardActions(sourceFolderCard);
			await aura.workflows.cards.getCardAction('move').click();

			await expect(aura.workflows.moveFolderModal()).toBeVisible();
			await aura.workflows.moveFolderDropdown().click();
			await aura.workflows.moveFolderOption(destinationFolder.name).click();
			await aura.workflows.moveFolderConfirmButton().click();

			await expect(
				aura.notifications.getNotificationByTitleOrContent('Successfully moved folder'),
			).toBeVisible();

			await aura.navigate.toFolder(destinationFolder.id, projectId);
			await expect(aura.workflows.cards.getFolder(sourceFolder.name)).toBeVisible();
			await aura.workflows.cards.openFolder(sourceFolder.name);
			await expect(aura.workflows.cards.getWorkflows()).toBeVisible();
		});

		test('should move empty folder to another folder - from list breadcrumbs', async ({ aura }) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const sourceFolder = await aura.api.projects.createFolder(projectId);
			const destinationFolder = await aura.api.projects.createFolder(projectId);

			await aura.navigate.toFolder(sourceFolder.id, projectId);
			await aura.breadcrumbs.getFolderBreadcrumbsActionToggle().click();
			await aura.breadcrumbs.getActionToggleDropdown('move').click();

			await expect(aura.workflows.moveFolderModal()).toBeVisible();
			await aura.workflows.moveFolderDropdown().click();
			await aura.workflows.moveFolderOption(destinationFolder.name).click();
			await aura.workflows.moveFolderConfirmButton().click();

			await aura.navigate.toFolder(destinationFolder.id, projectId);
			await expect(aura.workflows.cards.getFolder(sourceFolder.name)).toBeVisible();
		});

		test('should move folder with contents to another folder - from list dropdown', async ({
			aura,
		}) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const sourceFolder = await aura.api.projects.createFolder(projectId);
			const destinationFolder = await aura.api.projects.createFolder(projectId);

			await aura.api.workflows.createInProject(projectId, {
				folder: sourceFolder.id,
			});

			await aura.navigate.toFolder(sourceFolder.id, projectId);
			await aura.breadcrumbs.getFolderBreadcrumbsActionToggle().click();
			await aura.breadcrumbs.getActionToggleDropdown('move').click();

			await expect(aura.workflows.moveFolderModal()).toBeVisible();
			await aura.workflows.moveFolderDropdown().click();
			await aura.workflows.moveFolderOption(destinationFolder.name).click();
			await aura.workflows.moveFolderConfirmButton().click();

			await aura.navigate.toFolder(destinationFolder.id, projectId);
			await expect(aura.workflows.cards.getFolder(sourceFolder.name)).toBeVisible();
			await aura.workflows.cards.openFolder(sourceFolder.name);
			await expect(aura.workflows.cards.getWorkflows()).toBeVisible();
		});

		test('should move folder to project root - from folder card action', async ({ aura }) => {
			const project = await aura.api.projects.createProject();
			const parentFolder = await aura.api.projects.createFolder(project.id);
			const childFolderName = 'Child Folder';
			const childFolder = await aura.api.projects.createFolder(
				project.id,
				childFolderName,
				parentFolder.id,
			);

			await aura.navigate.toFolder(parentFolder.id, project.id);

			const childFolderCard = aura.workflows.cards.getFolder(childFolder.name);
			await aura.workflows.cards.openCardActions(childFolderCard);
			await aura.workflows.cards.getCardAction('move').click();

			await expect(aura.workflows.moveFolderModal()).toBeVisible();
			await aura.workflows.moveFolderDropdown().click();

			const rootOption = 'No folder (project root)';
			await aura.workflows.moveFolderOption(rootOption).click();
			await aura.workflows.moveFolderConfirmButton().click();

			await expect(
				aura.notifications.getNotificationByTitleOrContent('Successfully moved folder'),
			).toBeVisible();

			await aura.navigate.toProject(project.id);
			await expect(aura.workflows.cards.getFolder(childFolder.name)).toBeVisible();
		});

		test('should move workflow from project root to folder', async ({ aura }) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const destinationFolder = await aura.api.projects.createFolder(projectId);

			await aura.api.workflows.createInProject(projectId);

			await aura.navigate.toProject(projectId);

			const workflowCard = aura.workflows.cards.getWorkflows().first();
			await aura.workflows.cards.openCardActions(workflowCard);
			await aura.workflows.cards.getCardAction('moveToFolder').click();

			await expect(aura.workflows.moveFolderModal()).toBeVisible();
			await aura.workflows.moveFolderDropdown().click();
			await aura.workflows.moveFolderOption(destinationFolder.name).click();
			await aura.workflows.moveFolderConfirmButton().click();

			await expect(
				aura.notifications.getNotificationByTitleOrContent('Successfully moved workflow'),
			).toBeVisible();

			await aura.navigate.toFolder(destinationFolder.id, projectId);
			await expect(aura.workflows.cards.getWorkflows()).toBeVisible();
		});

		test('should move workflow to another folder', async ({ aura }) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const sourceFolder = await aura.api.projects.createFolder(projectId);
			const destinationFolder = await aura.api.projects.createFolder(projectId);

			const { name: workflowName } = await aura.api.workflows.createInProject(projectId, {
				folder: sourceFolder.id,
			});

			await aura.navigate.toFolder(sourceFolder.id, projectId);

			const workflowCard = aura.workflows.cards.getWorkflow(workflowName);
			await aura.workflows.cards.openCardActions(workflowCard);
			await aura.workflows.cards.getCardAction('moveToFolder').click();

			await expect(aura.workflows.moveFolderModal()).toBeVisible();
			await aura.workflows.moveFolderDropdown().click();
			await aura.workflows.moveFolderOption(destinationFolder.name).click();
			await aura.workflows.moveFolderConfirmButton().click();

			await expect(
				aura.notifications.getNotificationByTitleOrContent('Successfully moved workflow'),
			).toBeVisible();

			await aura.navigate.toFolder(destinationFolder.id, projectId);
			await expect(aura.workflows.cards.getWorkflow(workflowName)).toBeVisible();

			await aura.navigate.toFolder(sourceFolder.id, projectId);
			await expect(aura.workflows.cards.getWorkflow(workflowName)).toBeHidden();
		});
	});
});
