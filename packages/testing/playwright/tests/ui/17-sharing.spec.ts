import { test, expect } from '../../fixtures/base';

const OWNER_EMAIL = 'nathan@aura.io';
const ADMIN_EMAIL = 'admin@aura.io';
const MEMBER_0_EMAIL = 'member@aura.io'; // U2
const MEMBER_1_EMAIL = 'member2@aura.io'; // U3

const TEST_API_KEY = '1234567890';
const TEST_ACCESS_TOKEN = '1234567890';

test.describe('@isolated', () => {
	test.describe.configure({ mode: 'serial' });

	test.describe('Sharing - Workflow and Credential Sharing (Sequential)', () => {
		test.beforeAll(async ({ api }) => {
			await api.resetDatabase();
			await api.enableFeature('sharing');
			await api.enableFeature('advancedPermissions');
			await api.enableFeature('projectRole:admin');
			await api.enableFeature('projectRole:editor');
		});

		test('should create C1, W1, W2, share W1 with U3, as U2', async ({ aura }) => {
			await aura.api.signin('member', 0);

			await aura.credentialsComposer.createFromList(
				'Notion API',
				{ apiKey: TEST_API_KEY },
				{ name: 'Credential C1' },
			);

			await aura.navigate.toWorkflow('new');
			await aura.canvas.setWorkflowName('Workflow W1');
			await aura.canvas.addNode('Manual Trigger');
			await aura.canvas.addNode('Notion', { action: 'Append a block' });

			// Verify C1 auto-selected
			await expect(aura.ndv.getCredentialSelect()).toHaveValue('Credential C1');
			await aura.ndv.clickBackToCanvasButton();

			// Share W1 with U3 before saving
			await aura.canvas.openShareModal();
			await aura.workflowSharingModal.addUser(MEMBER_1_EMAIL);
			await aura.workflowSharingModal.save();
			await aura.canvas.saveWorkflow();

			await aura.navigate.toWorkflows();
			await aura.workflows.addResource.workflow();
			await aura.canvas.importWorkflow('Test_workflow_1.json', 'Workflow W2');
		});

		test('should create C2, share C2 with U1 and U2, as U3', async ({ aura }) => {
			await aura.api.signin('member', 1);

			// Manual approach to access Sharing tab during creation
			await aura.navigate.toCredentials();
			await aura.credentials.addResource.credential();
			await aura.credentials.selectCredentialType('Airtable Personal Access Token API');

			await aura.credentials.credentialModal.fillField('accessToken', TEST_ACCESS_TOKEN);
			await aura.credentials.credentialModal.getCredentialName().click();
			await aura.credentials.credentialModal.getNameInput().fill('Credential C2');

			await aura.credentials.credentialModal.changeTab('Sharing');
			await aura.credentials.credentialModal.addUserToSharing(OWNER_EMAIL);
			await aura.credentials.credentialModal.addUserToSharing(MEMBER_0_EMAIL);
			await aura.credentials.credentialModal.saveSharing();
			await aura.credentials.credentialModal.close();
		});

		test('should open W1, add node using C2 as U3', async ({ aura }) => {
			await aura.api.signin('member', 1);

			await aura.navigate.toWorkflows();

			// U3 only sees W1 (not W2)
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(1);
			await expect(aura.workflows.cards.getWorkflow('Workflow W1')).toBeVisible();

			await aura.workflows.cards.getWorkflow('Workflow W1').click();

			await aura.canvas.addNode('Airtable', { action: 'Create a record' });
			await expect(aura.ndv.getCredentialSelect()).toHaveValue('Credential C2');
			await aura.ndv.clickBackToCanvasButton();
			await aura.canvas.saveWorkflow();

			await aura.canvas.openNode('Append a block');

			// C1 is shown but disabled (U3 doesn't own it)
			await expect(aura.ndv.getNodeCredentialsSelect()).toHaveValue('Credential C1');
			await expect(aura.ndv.getNodeCredentialsSelect()).toBeDisabled();

			await aura.ndv.clickBackToCanvasButton();
		});

		test('should open W1, add node using C2 as U2', async ({ aura }) => {
			await aura.api.signin('member', 0);

			await aura.navigate.toWorkflows();

			// U2 sees W1 and W2 (both owned by U2)
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(2);
			await expect(aura.workflows.cards.getWorkflow('Workflow W1')).toBeVisible();
			await expect(aura.workflows.cards.getWorkflow('Workflow W2')).toBeVisible();

			await aura.workflows.cards.getWorkflow('Workflow W1').click();

			await aura.canvas.addNode('Airtable', { action: 'Create a record' });
			await expect(aura.ndv.getCredentialSelect()).toHaveValue('Credential C2');
			await aura.ndv.clickBackToCanvasButton();
			await aura.canvas.saveWorkflow();

			await aura.canvas.openNode('Append a block');

			// C1 is enabled (U2 owns it)
			await expect(aura.ndv.getNodeCredentialsSelect().locator('input')).toHaveValue(
				'Credential C1',
			);
			await expect(aura.ndv.getNodeCredentialsSelect().locator('input')).toBeEnabled();

			await aura.ndv.clickBackToCanvasButton();
		});

		test('should not have access to W2, as U3', async ({ aura }) => {
			const w2 = await aura.workflowComposer.getWorkflowByName('Workflow W2');

			await aura.api.signin('member', 1);

			await aura.page.goto(`/workflow/${w2.id}`);

			await expect(aura.page).toHaveURL('/entity-not-authorized/workflow');
		});

		test('should have access to W1, W2, as U1', async ({ aura }) => {
			await aura.api.signin('owner');

			await aura.navigate.toWorkflows();

			// Owner sees W1 and W2 (created by U2)
			await expect(aura.workflows.cards.getWorkflows()).toHaveCount(2);
			await expect(aura.workflows.cards.getWorkflow('Workflow W1')).toBeVisible();
			await expect(aura.workflows.cards.getWorkflow('Workflow W2')).toBeVisible();

			await aura.workflows.cards.getWorkflow('Workflow W1').click();

			// C1 is enabled for owner
			await aura.canvas.openNode('Append a block');
			await expect(aura.ndv.getNodeCredentialsSelect().locator('input')).toHaveValue(
				'Credential C1',
			);
			await expect(aura.ndv.getNodeCredentialsSelect().locator('input')).toBeEnabled();
			await aura.ndv.clickBackToCanvasButton();

			await aura.navigate.toWorkflows();

			await aura.workflows.cards.getWorkflow('Workflow W2').click();
			await aura.canvas.clickExecuteWorkflowButton();
		});

		test('should automatically test C2 when opened by U2 sharee', async ({ aura }) => {
			await aura.api.signin('member', 0);

			await aura.navigate.toCredentials();

			await aura.credentials.cards.getCredential('Credential C2').click();

			await expect(aura.credentials.credentialModal.getTestSuccessTag()).toBeVisible();
		});

		test('should work for admin role on credentials created by others', async ({ aura }) => {
			await aura.api.signin('member', 0);
			await aura.navigate.toCredentials();
			await aura.credentials.addResource.credential();
			await aura.credentials.selectCredentialType('Notion API');
			await aura.credentials.credentialModal.fillField('apiKey', TEST_API_KEY);
			await aura.credentials.credentialModal.renameCredential('Credential C3');
			await aura.credentials.credentialModal.save();
			await aura.credentials.credentialModal.close();

			await aura.api.signin('admin');
			await aura.navigate.toCredentials();
			await aura.credentials.cards.getCredential('Credential C3').click();

			await expect(aura.credentials.credentialModal.getTestSuccessTag()).toBeVisible();

			// Admin cannot see sensitive data (masked)
			const passwordInput = aura.credentials.credentialModal
				.getCredentialInputs()
				.locator('input')
				.first();
			const inputValue = await passwordInput.inputValue();
			expect(inputValue).toContain('__aura_BLANK_VALUE_');

			await aura.credentials.credentialModal.changeTab('Sharing');

			await expect(
				aura.credentials.credentialModal
					.getModal()
					.getByText('Sharing a credential allows people to use it in their workflows'),
			).toBeVisible();

			await aura.credentials.credentialModal.getUsersSelect().click();

			await expect(
				aura.credentials.credentialModal.getVisibleDropdown().getByTestId('project-sharing-info'),
			).toHaveCount(3);

			// Admin can share with self
			await expect(
				aura.credentials.credentialModal.getVisibleDropdown().getByText('admin@aura.io'),
			).toBeVisible();

			await aura.credentials.credentialModal.getVisibleDropdown().getByText(OWNER_EMAIL).click();

			await aura.credentials.credentialModal.addUserToSharing(MEMBER_1_EMAIL);
			await aura.credentials.credentialModal.addUserToSharing(ADMIN_EMAIL);

			await aura.credentials.credentialModal.saveSharing();
			await aura.credentials.credentialModal.close();
		});

		test('credentials should work between team and personal projects', async ({ aura, api }) => {
			await api.resetDatabase();

			await api.enableFeature('sharing');
			await api.enableFeature('advancedPermissions');
			await api.enableFeature('projectRole:admin');
			await api.enableFeature('projectRole:editor');
			await api.setMaxTeamProjectsQuota(-1);

			await aura.api.signin('owner');
			await aura.navigate.toHome();

			await aura.projectComposer.createProject('Development');

			await aura.sideBar.clickHomeButton();
			await aura.workflows.clickNewWorkflowCard();
			await aura.canvas.importWorkflow('Test_workflow_1.json', 'Test workflow');

			await aura.sideBar.clickHomeButton();
			await aura.projectTabs.clickCredentialsTab();
			await aura.credentials.emptyListCreateCredentialButton.click();
			await aura.credentials.selectCredentialType('Notion API');
			await aura.credentials.credentialModal.fillField('apiKey', TEST_API_KEY);
			await aura.credentials.credentialModal.renameCredential('Notion API');
			await aura.credentials.credentialModal.save();
			await aura.credentials.credentialModal.close();

			await aura.credentials.cards.getCredential('Notion API').click();
			await aura.credentials.credentialModal.changeTab('Sharing');
			await aura.credentials.credentialModal.getUsersSelect().click();

			const sharingDropdown = aura.credentials.credentialModal.getVisibleDropdown();
			await expect(sharingDropdown.locator('li')).toHaveCount(4);
			await expect(sharingDropdown.getByText('Development')).toBeVisible();

			await sharingDropdown.getByText('Development').click();
			await aura.credentials.credentialModal.saveSharing();
			await aura.credentials.credentialModal.close();

			await aura.projectTabs.clickWorkflowsTab();
			await aura.workflows.shareWorkflow('Test workflow');

			await aura.workflowSharingModal.getUsersSelect().click();
			const workflowSharingDropdown = aura.workflowSharingModal.getVisibleDropdown();
			await expect(workflowSharingDropdown.locator('li')).toHaveCount(3);

			await workflowSharingDropdown.locator('li').first().click();
			await aura.workflowSharingModal.save();

			await aura.sideBar.getProjectMenuItems().first().click();
			await aura.workflows.clickNewWorkflowCard();
			await aura.canvas.importWorkflow('Test_workflow_1.json', 'Test workflow 2');

			// Team project workflow cannot be shared
			await aura.canvas.openShareModal();
			await expect(aura.workflowSharingModal.getUsersSelect()).toHaveCount(0);

			await aura.workflowSharingModal.close();

			await aura.sideBar.getProjectMenuItems().first().click();
			await aura.projectTabs.clickCredentialsTab();
			await aura.credentials.addResource.credential();
			await aura.credentials.selectCredentialType('Notion API');
			await aura.credentials.credentialModal.fillField('apiKey', TEST_API_KEY);
			await aura.credentials.credentialModal.renameCredential('Notion API 2');
			await aura.credentials.credentialModal.save();

			await aura.credentials.credentialModal.changeTab('Sharing');
			await aura.credentials.credentialModal.getUsersSelect().click();

			const sharingDropdown2 = aura.credentials.credentialModal.getVisibleDropdown();
			await expect(sharingDropdown2.locator('li')).toHaveCount(4);

			await sharingDropdown2.locator('li').first().click();
			await aura.credentials.credentialModal.saveSharing();
			await aura.credentials.credentialModal.close();

			// One credential labeled "Personal"
			await expect(aura.credentials.cards.getCredentials()).toHaveCount(2);
			await expect(
				aura.credentials.cards.getCredentials().filter({ hasText: 'Personal' }),
			).toHaveCount(1);
		});
	});

	test.describe('Credential Usage in Cross Shared Workflows', () => {
		test.beforeEach(async ({ aura, api }) => {
			await api.resetDatabase();
			await api.enableFeature('sharing');
			await api.enableFeature('advancedPermissions');
			await api.enableFeature('projectRole:admin');
			await api.enableFeature('projectRole:editor');
			await api.setMaxTeamProjectsQuota(-1);

			await aura.api.signin('owner');
			await aura.navigate.toCredentials();
		});

		test('should only show credentials from the same team project', async ({ aura }) => {
			await aura.credentialsComposer.createFromList('Notion API', { apiKey: 'test' });

			const devProject = await aura.projectComposer.createProject('Development');
			await aura.projectTabs.clickCredentialsTab();
			await aura.credentialsComposer.createFromList(
				'Notion API',
				{ apiKey: 'test' },
				{ projectId: devProject.projectId },
			);

			const testProject = await aura.projectComposer.createProject('Test');
			await aura.projectTabs.clickCredentialsTab();
			await aura.credentialsComposer.createFromList(
				'Notion API',
				{ apiKey: 'test' },
				{ projectId: testProject.projectId },
			);

			await aura.projectTabs.clickWorkflowsTab();
			await aura.workflows.clickNewWorkflowCard();

			await aura.canvas.addNode('Notion');
			await aura.canvas.getFirstAction().click();

			// Only Test project credential visible
			await aura.ndv.getNodeCredentialsSelect().click();
			await expect(aura.ndv.getVisiblePopper().locator('li')).toHaveCount(1);
		});

		test('should only show credentials in their personal project for members', async ({ aura }) => {
			await aura.credentialsComposer.createFromList('Notion API', { apiKey: 'test' });

			await aura.navigate.toCredentials();
			await aura.credentials.addResource.credential();
			await aura.credentials.selectCredentialType('Notion API');
			await aura.credentials.credentialModal.fillField('apiKey', 'test');
			await aura.credentials.credentialModal.save();

			await aura.credentials.credentialModal.changeTab('Sharing');
			await aura.credentials.credentialModal.addUserToSharing(MEMBER_0_EMAIL);
			await aura.credentials.credentialModal.saveSharing();
			await aura.credentials.credentialModal.close();

			await aura.api.signin('member', 0);
			await aura.navigate.toCredentials();
			await aura.credentialsComposer.createFromList('Notion API', { apiKey: 'test' });

			await aura.navigate.toWorkflows();
			await aura.workflows.addResource.workflow();

			await aura.canvas.addNode('Notion');
			await aura.canvas.getFirstAction().click();

			// Own credential and shared credential visible
			await aura.ndv.getNodeCredentialsSelect().click();
			await expect(aura.ndv.getVisiblePopper().locator('li')).toHaveCount(2);
		});

		test('should only show credentials in their personal project for members if the workflow was shared with them', async ({
			aura,
		}) => {
			const workflowName = 'Test workflow';

			await aura.credentialsComposer.createFromList('Notion API', { apiKey: 'test' });

			await aura.navigate.toWorkflows();
			await aura.workflows.addResource.workflow();
			await aura.canvas.setWorkflowName(workflowName);
			await aura.page.keyboard.press('Enter');
			await aura.canvas.openShareModal();
			await aura.workflowSharingModal.addUser(MEMBER_0_EMAIL);
			await aura.workflowSharingModal.save();

			await aura.api.signin('member', 0);
			await aura.navigate.toCredentials();
			await aura.credentialsComposer.createFromList('Notion API', { apiKey: 'test' });

			await aura.navigate.toWorkflows();
			await aura.workflows.cards.getWorkflow(workflowName).click();

			await aura.canvas.addNode('Notion');
			await aura.canvas.getFirstAction().click();

			// Only own credential visible (not owner's)
			await aura.ndv.getNodeCredentialsSelect().click();
			await expect(aura.ndv.getVisiblePopper().locator('li')).toHaveCount(1);
		});

		test("should show all credentials from all personal projects the workflow's been shared into for the global owner", async ({
			aura,
		}) => {
			const workflowName = 'Test workflow';

			await aura.api.signin('member', 1);
			await aura.navigate.toCredentials();
			await aura.credentials.addResource.credential();
			await aura.credentials.selectCredentialType('Notion API');
			await aura.credentials.credentialModal.fillField('apiKey', 'test');
			await aura.credentials.credentialModal.save();
			await aura.credentials.credentialModal.close();

			await aura.api.signin('admin');
			await aura.navigate.toCredentials();
			await aura.credentials.addResource.credential();
			await aura.credentials.selectCredentialType('Notion API');
			await aura.credentials.credentialModal.fillField('apiKey', 'test');
			await aura.credentials.credentialModal.save();
			await aura.credentials.credentialModal.close();

			await aura.api.signin('member', 0);
			await aura.navigate.toCredentials();
			await aura.credentialsComposer.createFromList('Notion API', { apiKey: 'test' });
			await aura.navigate.toWorkflows();
			await aura.workflows.addResource.workflow();
			await aura.canvas.setWorkflowName(workflowName);
			await aura.page.keyboard.press('Enter');
			await aura.canvas.openShareModal();
			await aura.workflowSharingModal.addUser(OWNER_EMAIL);
			await aura.workflowSharingModal.addUser(ADMIN_EMAIL);
			await aura.workflowSharingModal.save();

			await aura.api.signin('owner');
			await aura.navigate.toCredentials();
			await aura.credentialsComposer.createFromList('Notion API', { apiKey: 'test' });
			await aura.navigate.toWorkflows();
			await aura.workflows.cards.getWorkflow(workflowName).click();

			await aura.canvas.addNode('Notion');
			await aura.canvas.getFirstAction().click();

			// Owner sees 3 credentials: admin's, U2's, owner's
			await aura.ndv.getNodeCredentialsSelect().click();
			await expect(aura.ndv.getVisiblePopper().locator('li')).toHaveCount(3);
		});

		test('should show all personal credentials if the global owner owns the workflow', async ({
			aura,
		}) => {
			await aura.api.signin('member', 0);
			await aura.navigate.toCredentials();
			await aura.credentials.addResource.credential();
			await aura.credentials.selectCredentialType('Notion API');
			await aura.credentials.credentialModal.fillField('apiKey', 'test');
			await aura.credentials.credentialModal.save();
			await aura.credentials.credentialModal.close();

			await aura.api.signin('owner');
			await aura.navigate.toWorkflows();
			await aura.workflows.addResource.workflow();
			await aura.canvas.addNode('Notion');
			await aura.canvas.getFirstAction().click();

			// Owner sees member's credential (global owner privilege)
			await aura.ndv.getNodeCredentialsSelect().click();
			await expect(aura.ndv.getVisiblePopper().locator('li')).toHaveCount(1);
		});
	});
});
