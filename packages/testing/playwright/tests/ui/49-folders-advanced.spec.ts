import { test, expect } from '../../fixtures/base';

test.describe('Folders - Advanced Operations', () => {
	test.describe('Duplicate workflows', () => {
		test('should duplicate workflow within root folder from personal projects', async ({
			aura,
		}) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const { name: workflowName } = await aura.api.workflows.createInProject(projectId);
			await aura.navigate.toProject(projectId);
			const workflowCard = aura.workflows.cards.getWorkflow(workflowName);
			await aura.workflows.cards.openCardActions(workflowCard);
			await aura.workflows.cards.getCardAction('duplicate').click();
			const duplicatePage = await aura.start.fromNewPage(async () => {
				await aura.modal.clickButton('Duplicate');
			});

			const duplicatedName = `${workflowName} copy`;
			await duplicatePage.navigate.toProject(projectId);
			await expect(duplicatePage.workflows.cards.getWorkflow(duplicatedName)).toBeVisible();
		});

		test('should duplicate workflow within a folder from personal projects', async ({ aura }) => {
			const projectId = await aura.start.fromNewProject();
			const folder = await aura.api.projects.createFolder(projectId);
			const { name: workflowName } = await aura.api.workflows.createInProject(projectId, {
				folder: folder.id,
			});
			await aura.navigate.toFolder(folder.id, projectId);

			const workflowCard = aura.workflows.cards.getWorkflow(workflowName);
			await aura.workflows.cards.openCardActions(workflowCard);
			await aura.workflows.cards.getCardAction('duplicate').click();

			const duplicatePage = await aura.start.fromNewPage(async () => {
				await aura.modal.clickButton('Duplicate');
			});

			await duplicatePage.navigate.toFolder(folder.id);
			const duplicatedName = `${workflowName} copy`;
			await expect(duplicatePage.workflows.cards.getWorkflow(duplicatedName)).toBeVisible();
		});

		test('should duplicate workflow within a folder from workflow page', async ({ aura }) => {
			const { id: projectId } = await aura.api.projects.createProject();
			const folder = await aura.api.projects.createFolder(projectId);
			const { name: workflowName, id: workflowId } = await aura.api.workflows.createInProject(
				projectId,
				{
					folder: folder.id,
				},
			);
			await aura.navigate.toCanvas(workflowId);

			await aura.workflowSettingsModal.getWorkflowMenu().click();
			await aura.workflowSettingsModal.getDuplicateMenuItem().click();
			const duplicatePage = await aura.start.fromNewPage(async () => {
				await aura.modal.clickButton('Duplicate');
			});

			const duplicatedName = `${workflowName} copy`;
			await duplicatePage.navigate.toFolder(folder.id, projectId);
			await expect(duplicatePage.workflows.cards.getWorkflow(duplicatedName)).toBeVisible();
		});
	});

	test.describe('Drag and drop', () => {
		test('should drag and drop folders into folders', async ({ aura }) => {
			const { id: projectId } = await aura.api.projects.createProject('Drag and Drop Test');
			await aura.navigate.toProject(projectId);
			const targetFolder = await aura.api.projects.createFolder(projectId, 'Drag me');
			const destinationFolder = await aura.api.projects.createFolder(
				projectId,
				'Folder Destination',
			);

			const sourceFolderCard = aura.workflows.cards.getFolder(targetFolder.name);
			const destinationFolderCard = aura.workflows.cards.getFolder(destinationFolder.name);

			await aura.interactions.precisionDragToTarget(sourceFolderCard, destinationFolderCard);

			await expect(
				aura.notifications.getNotificationByTitleOrContent(
					`${targetFolder.name} has been moved to ${destinationFolder.name}`,
				),
			).toBeVisible();

			await expect(aura.workflows.cards.getFolders()).toHaveCount(1);

			await aura.workflows.cards.openFolder(destinationFolder.name);
			await expect(aura.workflows.cards.getFolder(targetFolder.name)).toBeVisible();
		});

		test('should drag and drop folders into project root breadcrumb', async ({ aura }) => {
			const project = await aura.api.projects.createProject('Drag to root test');
			await aura.navigate.toProject(project.id);
			const parentFolder = await aura.api.projects.createFolder(project.id, 'Parent Folder');
			const targetFolder = await aura.api.projects.createFolder(
				project.id,
				'To Project root',
				parentFolder.id,
			);

			await aura.navigate.toFolder(parentFolder.id, project.id);

			const sourceFolderCard = aura.workflows.cards.getFolder(targetFolder.name);
			const projectBreadcrumb = aura.breadcrumbs.getHomeProjectBreadcrumb();

			await aura.interactions.precisionDragToTarget(sourceFolderCard, projectBreadcrumb);

			await expect(
				aura.notifications.getNotificationByTitleOrContent(
					`${targetFolder.name} has been moved to ${project.name}`,
				),
			).toBeVisible();

			await expect(aura.workflows.cards.getFolders()).toHaveCount(0);

			await aura.navigate.toProject(project.id);
			await expect(aura.workflows.cards.getFolder(targetFolder.name)).toBeVisible();
		});

		test('should drag and drop workflows into folders', async ({ aura }) => {
			const { id: projectId } = await aura.api.projects.createProject('Drag and Drop WF Test');
			const { name: workflowName } = await aura.api.workflows.createInProject(projectId, {});
			const destinationFolder = await aura.api.projects.createFolder(projectId);
			await aura.navigate.toProject(projectId);

			const sourceWorkflowCard = aura.workflows.cards.getWorkflow(workflowName);
			const destinationFolderCard = aura.workflows.cards.getFolder(destinationFolder.name);

			await aura.interactions.precisionDragToTarget(sourceWorkflowCard, destinationFolderCard);

			await expect(
				aura.notifications.getNotificationByTitleOrContent(
					`${workflowName} has been moved to ${destinationFolder.name}`,
				),
			).toBeVisible();

			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(0);

			await aura.workflows.cards.openFolder(destinationFolder.name);
			await expect(aura.workflows.cards.getWorkflow(workflowName)).toBeVisible();
		});
	});
});
