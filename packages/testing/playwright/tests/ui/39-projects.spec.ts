import { nanoid } from 'nanoid';

import {
	INSTANCE_ADMIN_CREDENTIALS,
	INSTANCE_MEMBER_CREDENTIALS,
	INSTANCE_OWNER_CREDENTIALS,
} from '../../config/test-users';
import { test, expect } from '../../fixtures/base';

const MANUAL_TRIGGER_NODE_NAME = 'Manual Trigger';
const EXECUTE_WORKFLOW_NODE_NAME = 'Execute Sub-workflow';
const NOTION_NODE_NAME = 'Notion';
const EDIT_FIELDS_SET_NODE_NAME = 'Edit Fields (Set)';
const NOTION_API_KEY = 'abc123Playwright';

test.describe('Projects', () => {
	test.describe.configure({ mode: 'serial' });

	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
		// Enable features required for project workflows and moving resources
		await aura.api.enableFeature('sharing');
		await aura.api.enableFeature('folders');
		await aura.api.enableFeature('advancedPermissions');
		await aura.api.enableFeature('projectRole:admin');
		await aura.api.enableFeature('projectRole:editor');
		await aura.api.setMaxTeamProjectsQuota(-1);
	});

	test.describe('when starting from scratch @db:reset', () => {
		test('should not show project add button and projects to a member if not invited to any project @auth:member', async ({
			aura,
		}) => {
			await expect(aura.sideBar.getAddFirstProjectButton()).toBeDisabled();
			await expect(aura.sideBar.getProjectMenuItems()).toHaveCount(0);
		});

		test('should filter credentials by project ID when creating new workflow or hard reloading an opened workflow', async ({
			aura,
		}) => {
			const { projectName, projectId } = await aura.projectComposer.createProject();
			await aura.projectComposer.addCredentialToProject(
				projectName,
				'Notion API',
				'apiKey',
				NOTION_API_KEY,
			);

			const credentials = await aura.api.credentials.getCredentialsByProject(projectId);
			expect(credentials).toHaveLength(1);

			const { projectId: project2Id } = await aura.projectComposer.createProject();
			const credentials2 = await aura.api.credentials.getCredentialsByProject(project2Id);
			expect(credentials2).toHaveLength(0);
		});

		test('should allow changing an inaccessible credential when the workflow was moved to a team project @auth:owner', async ({
			aura,
		}) => {
			await aura.navigate.toCredentials();
			await aura.credentials.emptyListCreateCredentialButton.click();

			await aura.credentials.createCredentialFromCredentialPicker(
				'Notion API',
				{
					apiKey: NOTION_API_KEY,
				},
				{
					name: 'Credential in Home project',
				},
			);

			await aura.navigate.toWorkflows();
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(0);

			await aura.sideBar.addWorkflowFromUniversalAdd('Personal');

			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.addNode(NOTION_NODE_NAME, { action: 'Append a block', closeNDV: true });
			await aura.canvas.saveWorkflow();

			const { projectId, projectName } = await aura.projectComposer.createProject('Project 1');

			await aura.api.projects.addUserToProjectByEmail(
				projectId,
				INSTANCE_MEMBER_CREDENTIALS[0].email,
				'project:editor',
			);

			await aura.sideBar.clickPersonalMenuItem();
			await aura.sideBar.clickWorkflowsLink();

			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(1);

			await aura.workflowComposer.moveToProject('My workflow', projectName);

			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(0);

			await aura.sideBar.clickProjectMenuItem(projectName);
			await aura.navigate.toWorkflows();

			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(1);
			await expect(
				aura.workflows.cards.getWorkflow('My workflow').getByText('Personal'),
			).toBeHidden();

			await aura.sideBar.clickSignout();
			await aura.page.waitForURL(/\/signin/);
			await aura.signIn.loginWithEmailAndPassword(
				INSTANCE_MEMBER_CREDENTIALS[0].email,
				INSTANCE_MEMBER_CREDENTIALS[0].password,
			);

			await expect(aura.workflows.getProjectName()).toBeVisible();

			await aura.sideBar.clickProjectMenuItem(projectName);
			await aura.navigate.toWorkflows();

			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(1);

			await aura.workflows.cards.clickWorkflowCard('My workflow');

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);

			await aura.canvas.openNode('Append a block');

			await expect(aura.ndv.getCredentialSelectInput()).toBeEnabled();
		});

		test('should create sub-workflow and credential in the sub-workflow in the same project @auth:owner', async ({
			aura,
		}) => {
			const { projectName } = await aura.projectComposer.createProject();
			await aura.sideBar.addWorkflowFromUniversalAdd(projectName);
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.saveWorkflow();
			await expect(
				aura.notifications.getNotificationByTitleOrContent('Workflow successfully created'),
			).toBeVisible();

			await aura.canvas.addNode(EXECUTE_WORKFLOW_NODE_NAME, { action: 'Execute A Sub Workflow' });

			const subaura = await aura.start.fromNewPage(() =>
				aura.ndv.selectWorkflowResource(`Create a Sub-Workflow in '${projectName}'`),
			);

			await subaura.ndv.clickBackToCanvasButton();

			await subaura.canvas.deleteNodeByName('Replace me with your logic');
			await subaura.canvas.addNode(NOTION_NODE_NAME, { action: 'Append a block' });
			await subaura.credentialsComposer.createFromNdv({
				apiKey: NOTION_API_KEY,
			});

			await subaura.ndv.clickBackToCanvasButton();
			await subaura.canvas.saveWorkflow();

			await subaura.navigate.toWorkflows();
			await subaura.sideBar.clickProjectMenuItem(projectName);
			await subaura.navigate.toWorkflows();

			await expect(subaura.workflows.cards.getWorkflows()).toHaveCount(2);

			await expect(subaura.page.getByRole('heading', { name: 'My Sub-Workflow' })).toBeVisible();

			await subaura.navigate.toCredentials();

			await expect(subaura.credentials.cards.getCredentials()).toHaveCount(1);
			await expect(subaura.page.getByRole('heading', { name: 'Notion account' })).toBeVisible();
		});

		test('should create credential from workflow in the correct project after editor page refresh @auth:owner', async ({
			aura,
		}) => {
			const { projectName } = await aura.projectComposer.createProject(`Dev ${nanoid(8)}`);

			await aura.sideBar.clickProjectMenuItem(projectName);
			await aura.navigate.toWorkflows();

			await aura.workflows.clickNewWorkflowCard();
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.saveWorkflow();

			// Wait for save notification to confirm workflow is saved
			await expect(
				aura.notifications.getNotificationByTitleOrContent('Workflow successfully created'),
			).toBeVisible();
			// Wait for URL to update with workflow ID after save
			await aura.page.waitForURL(/\/workflow\/[^/]+$/);

			await aura.page.reload();
			await expect(aura.canvas.getCanvasNodes()).toHaveCount(1);

			await aura.canvas.addNode(NOTION_NODE_NAME, { action: 'Append a block' });
			await aura.credentialsComposer.createFromNdv({
				apiKey: NOTION_API_KEY,
			});
			await aura.ndv.close();
			await aura.canvas.saveWorkflow();

			await aura.sideBar.clickProjectMenuItem(projectName);
			await aura.navigate.toCredentials();

			await expect(aura.credentials.cards.getCredentials()).toHaveCount(1);
		});

		test('should set and update project icon @auth:admin', async ({ aura }) => {
			const DEFAULT_ICON = 'layers';
			const NEW_PROJECT_NAME = `Test Project ${nanoid(8)}`;

			await aura.projectComposer.createProject(NEW_PROJECT_NAME);

			await expect(aura.projectSettings.getIconPickerButton().locator('svg')).toHaveAttribute(
				'data-icon',
				DEFAULT_ICON,
			);

			await aura.projectSettings.clickIconPickerButton();
			await aura.projectSettings.selectIconTab('Emojis');

			await aura.projectSettings.selectFirstEmoji();

			await expect(
				aura.notifications.getNotificationByTitle('Project icon updated successfully'),
			).toBeVisible();

			await expect(aura.projectSettings.getIconPickerButton()).toContainText('😀');

			await aura.sideBar.expand();
			await expect(
				aura.sideBar.getProjectMenuItems().filter({ hasText: NEW_PROJECT_NAME }),
			).toContainText('😀');
		});

		test('should be able to create a workflow when in the workflow editor @auth:owner', async ({
			aura,
		}) => {
			await aura.navigate.toWorkflow('new');
			await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });
			await aura.canvas.saveWorkflow();
			await expect(
				aura.notifications.getNotificationByTitleOrContent('Workflow successfully created'),
			).toBeVisible();

			const savedWorkflowUrl = aura.page.url();

			await aura.sideBar.addWorkflowFromUniversalAdd('Personal');

			// Close dropdown/menu
			await aura.page.locator('body').click();

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);

			await aura.page.goBack();

			expect(aura.page.url()).toBe(savedWorkflowUrl);
			await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);

			await aura.sideBar.addWorkflowFromUniversalAdd('Personal');

			expect(aura.page.url()).toContain('/workflow/new');

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(0);
		});
	});

	test.describe('when moving resources between projects @db:reset', () => {
		test.describe.configure({ mode: 'serial' });

		test.beforeEach(async ({ aura }) => {
			// Create workflow + credential in Home/Personal project
			await aura.api.workflows.createWorkflow({
				name: 'Workflow in Home project',
				nodes: [],
				connections: {},
				active: false,
			});
			await aura.api.credentials.createCredential({
				name: 'Credential in Home project',
				type: 'notionApi',
				data: { apiKey: '1234567890' },
			});

			// Create Project 1 with resources
			const project1 = await aura.api.projects.createProject('Project 1');
			await aura.api.workflows.createInProject(project1.id, {
				name: 'Workflow in Project 1',
			});
			await aura.api.credentials.createCredential({
				name: 'Credential in Project 1',
				type: 'notionApi',
				data: { apiKey: '1234567890' },
				projectId: project1.id,
			});

			// Create Project 2 with resources
			const project2 = await aura.api.projects.createProject('Project 2');
			await aura.api.workflows.createInProject(project2.id, {
				name: 'Workflow in Project 2',
			});
			await aura.api.credentials.createCredential({
				name: 'Credential in Project 2',
				type: 'notionApi',
				data: { apiKey: '1234567890' },
				projectId: project2.id,
			});

			// Navigate to home to load sidebar with new projects
			await aura.goHome();
		});

		test('should move the workflow to expected projects @auth:owner', async ({ aura }) => {
			// Move workflow from Personal to Project 2
			await aura.sideBar.clickPersonalMenuItem();
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(1);
			await aura.workflowComposer.moveToProject('Workflow in Home project', 'Project 2');

			// Verify Personal has 0 workflows
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(0);

			// Move workflow from Project 1 to Project 2
			await aura.sideBar.clickProjectMenuItem('Project 1');
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(1);
			await aura.workflowComposer.moveToProject('Workflow in Project 1', 'Project 2');

			// Move workflow from Project 2 to member user
			await aura.sideBar.clickProjectMenuItem('Project 2');
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(3);
			await aura.workflowComposer.moveToProject(
				'Workflow in Home project',
				INSTANCE_MEMBER_CREDENTIALS[0].email,
				null,
			);

			// Verify Project 2 has 2 workflows remaining
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(2);
		});

		test('should move the credential to expected projects @auth:owner', async ({ aura }) => {
			// Move credential from Project 1 to Project 2
			await aura.sideBar.clickProjectMenuItem('Project 1');
			await aura.sideBar.clickCredentialsLink();
			await expect(aura.credentials.cards.getCredentials()).toHaveCount(1);

			const credentialCard1 = aura.credentials.cards.getCredential('Credential in Project 1');
			await aura.credentials.cards.openCardActions(credentialCard1);
			await aura.credentials.cards.getCardAction('move').click();
			await expect(aura.resourceMoveModal.getMoveCredentialButton()).toBeDisabled();

			await aura.resourceMoveModal.getProjectSelectCredential().locator('input').click();
			await expect(aura.page.getByRole('option')).toHaveCount(5);
			await aura.resourceMoveModal.selectProjectOption('Project 2');
			await aura.resourceMoveModal.clickMoveCredentialButton();

			await expect(aura.credentials.cards.getCredentials()).toHaveCount(0);

			// Move credential from Project 2 to admin user
			await aura.sideBar.clickProjectMenuItem('Project 2');
			await aura.sideBar.clickCredentialsLink();
			await expect(aura.credentials.cards.getCredentials()).toHaveCount(2);

			const credentialCard2 = aura.credentials.cards.getCredential('Credential in Project 1');
			await aura.credentials.cards.openCardActions(credentialCard2);
			await aura.credentials.cards.getCardAction('move').click();
			await expect(aura.resourceMoveModal.getMoveCredentialButton()).toBeDisabled();

			await aura.resourceMoveModal.getProjectSelectCredential().locator('input').click();
			await expect(aura.page.getByRole('option')).toHaveCount(5);
			await aura.resourceMoveModal.selectProjectOption(INSTANCE_ADMIN_CREDENTIALS.email);
			await aura.resourceMoveModal.clickMoveCredentialButton();

			await expect(aura.credentials.cards.getCredentials()).toHaveCount(1);

			// Move credential from admin user (Home) back to owner user
			await aura.sideBar.clickHomeMenuItem();
			await aura.navigate.toCredentials();
			await expect(aura.credentials.cards.getCredentials()).toHaveCount(3);

			const credentialCard3 = aura.credentials.cards.getCredential('Credential in Project 1');
			await aura.credentials.cards.openCardActions(credentialCard3);
			await aura.credentials.cards.getCardAction('move').click();
			await expect(aura.resourceMoveModal.getMoveCredentialButton()).toBeDisabled();

			await aura.resourceMoveModal.getProjectSelectCredential().locator('input').click();
			await expect(aura.page.getByRole('option')).toHaveCount(5);
			await aura.resourceMoveModal.selectProjectOption(INSTANCE_OWNER_CREDENTIALS.email);
			await aura.resourceMoveModal.clickMoveCredentialButton();

			// Verify final state: 3 credentials total, 2 with Personal badge
			await expect(aura.credentials.cards.getCredentials()).toHaveCount(3);
			await expect(
				aura.credentials.cards.getCredentials().filter({ hasText: 'Personal' }),
			).toHaveCount(2);
		});
	});
});
