import { nanoid } from 'nanoid';

import { test, expect } from '../../fixtures/base';

const NOTIFICATIONS = {
	CREATED: 'Workflow successfully created',
	ARCHIVED: 'archived',
	UNARCHIVED: 'unarchived',
	DELETED: 'deleted',
};

test.describe('Workflows', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
	});

	test('should create a new workflow using empty state card', async ({ aura }) => {
		const { projectId } = await aura.projectComposer.createProject();
		await aura.page.goto(`projects/${projectId}/workflows`);
		await aura.workflows.clickNewWorkflowCard();
		await expect(aura.page).toHaveURL(/workflow\/new/);
	});

	test('should create a new workflow using add workflow button and save successfully', async ({
		aura,
	}) => {
		await aura.workflows.addResource.workflow();

		const uniqueIdForCreate = nanoid(8);
		const workflowName = `Test Workflow ${uniqueIdForCreate}`;
		await aura.canvas.setWorkflowName(workflowName);
		await aura.canvas.saveWorkflow();

		await expect(aura.notifications.getNotificationByTitle(NOTIFICATIONS.CREATED)).toBeVisible();
	});

	test('should search for workflows', async ({ aura }) => {
		const uniqueId = nanoid(8);
		const specificName = `Specific Test ${uniqueId}`;
		const genericName = `Generic Test ${uniqueId}`;

		await aura.workflowComposer.createWorkflow(specificName);
		await aura.goHome();
		await aura.workflowComposer.createWorkflow(genericName);
		await aura.goHome();

		// Search for specific workflow
		await aura.workflows.search(specificName);
		await expect(aura.workflows.cards.getWorkflow(specificName)).toBeVisible();

		// Search with partial term
		await aura.workflows.clearSearch();
		await aura.workflows.search(uniqueId);
		await expect(aura.workflows.cards.getWorkflows()).toHaveCount(2);

		// Search for non-existent
		await aura.workflows.clearSearch();
		await aura.workflows.search('NonExistentWorkflow123');
		await expect(aura.workflows.cards.getWorkflows()).toHaveCount(0);
		await expect(aura.page.getByText('No workflows found')).toBeVisible();
	});

	test('should archive and unarchive a workflow', async ({ aura }) => {
		const uniqueIdForArchive = nanoid(8);
		const workflowName = `Archive Test ${uniqueIdForArchive}`;
		await aura.workflowComposer.createWorkflow(workflowName);
		await aura.goHome();

		// Create a second workflow so we can still see filters
		await aura.workflowComposer.createWorkflow();
		await aura.goHome();

		const workflow = aura.workflows.cards.getWorkflow(workflowName);
		await aura.workflows.archiveWorkflow(workflow);
		await expect(aura.notifications.getNotificationByTitle(NOTIFICATIONS.ARCHIVED)).toBeVisible();

		await expect(workflow).toBeHidden();
		await aura.workflows.toggleShowArchived();
		await expect(workflow).toBeVisible();

		await aura.workflows.unarchiveWorkflow(workflow);
		await expect(aura.notifications.getNotificationByTitle(NOTIFICATIONS.UNARCHIVED)).toBeVisible();
	});

	test('should delete an archived workflow', async ({ aura }) => {
		const uniqueIdForDelete = nanoid(8);
		const workflowName = `Delete Test ${uniqueIdForDelete}`;
		await aura.workflowComposer.createWorkflow(workflowName);
		await aura.goHome();
		await aura.workflowComposer.createWorkflow();
		await aura.goHome();

		const workflow = aura.workflows.cards.getWorkflow(workflowName);
		await aura.workflows.archiveWorkflow(workflow);
		await expect(aura.notifications.getNotificationByTitle(NOTIFICATIONS.ARCHIVED)).toBeVisible();

		await aura.workflows.toggleShowArchived();

		await aura.workflows.deleteWorkflow(workflow);
		await expect(aura.notifications.getNotificationByTitle(NOTIFICATIONS.DELETED)).toBeVisible();

		await expect(workflow).toBeHidden();
	});

	test('should filter workflows by tag', async ({ aura }) => {
		const { projectId } = await aura.projectComposer.createProject();
		await aura.page.goto(`projects/${projectId}/workflows`);
		// Create tagged workflow
		const uniqueIdForTagged = nanoid(8);
		await aura.workflowComposer.createWorkflow(uniqueIdForTagged);
		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
		const tags = await aura.canvas.addTags();
		await aura.goHome();
		// Create untagged workflow
		await aura.workflowComposer.createWorkflow();
		await aura.goHome();
		await aura.workflows.filterByTag(tags[0]);

		await expect(aura.workflows.cards.getWorkflow(uniqueIdForTagged)).toBeVisible();
	});

	test('should preserve search and filters in URL', async ({ aura }) => {
		const { projectId } = await aura.projectComposer.createProject();
		await aura.page.goto(`projects/${projectId}/workflows`);
		const uniqueIdForTagged = nanoid(8);

		await aura.workflowComposer.createWorkflow(`My Tagged Workflow ${uniqueIdForTagged}`);
		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
		const tags = await aura.canvas.addTags(2);

		await aura.goHome();
		await aura.workflows.search('Tagged');
		await aura.workflows.filterByTag(tags[0]);

		await expect(aura.page).toHaveURL(/search=Tagged/);

		await aura.page.reload();

		await expect(aura.workflows.getSearchBar()).toHaveValue('Tagged');
		await expect(
			aura.workflows.cards.getWorkflow(`My Tagged Workflow ${uniqueIdForTagged}`),
		).toBeVisible();
	});

	test('should share a workflow', async ({ aura }) => {
		const uniqueIdForShare = nanoid(8);
		const workflowName = `Share Test ${uniqueIdForShare}`;
		await aura.workflowComposer.createWorkflow(workflowName);
		await aura.goHome();

		await aura.workflows.shareWorkflow(workflowName);
		await expect(aura.workflowSharingModal.getModal()).toBeVisible();
	});
});
