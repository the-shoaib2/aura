import { nanoid } from 'nanoid';

import { test, expect } from '../../fixtures/base';

test.describe('Project Settings - Member Management', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
	});

	test('should display project settings page with correct layout @auth:owner', async ({ aura }) => {
		// Create a new project
		const projectName = `UI Test ${nanoid(8)}`;
		const { projectId } = await aura.projectComposer.createProject(projectName);

		// Navigate to project settings
		await aura.navigate.toProjectSettings(projectId);
		await expect(aura.projectSettings.getTitle()).toHaveText(projectName);

		// Verify basic project settings form elements are visible (inner controls)
		await expect(aura.projectSettings.getNameInput()).toBeVisible();
		await expect(aura.projectSettings.getDescriptionTextarea()).toBeVisible();
		await aura.projectSettings.expectMembersSelectIsVisible();

		// Verify members table is visible when there are members
		await aura.projectSettings.expectTableIsVisible();

		// Initially should have only the owner (current user)
		await aura.projectSettings.expectTableHasMemberCount(1);

		// Verify save/cancel buttons are disabled initially (no changes)
		await expect(aura.projectSettings.getSaveButton()).toBeDisabled();
		await expect(aura.projectSettings.getCancelButton()).toBeDisabled();

		// Delete button should always be visible
		await expect(aura.projectSettings.getDeleteButton()).toBeVisible();
	});

	test('should allow editing project name and description @auth:owner', async ({ aura }) => {
		// Create a new project
		const projectName = `Edit Test ${nanoid(8)}`;
		const { projectId } = await aura.projectComposer.createProject(projectName);

		// Navigate to project settings
		await aura.navigate.toProjectSettings(projectId);
		await expect(aura.projectSettings.getTitle()).toHaveText(projectName);

		// Update project name
		const newName = 'Updated Project Name';
		await aura.projectSettings.fillProjectName(newName);

		// Update project description
		const newDescription = 'This is an updated project description.';
		await aura.projectSettings.fillProjectDescription(newDescription);

		// Save changes
		await aura.projectSettings.clickSaveButton();

		// Wait for success notification
		await expect(
			aura.page.getByText('Project Updated Project Name saved successfully', { exact: false }),
		).toBeVisible();

		// Verify the form shows the updated values
		await aura.projectSettings.expectProjectNameValue(newName);
		await aura.projectSettings.expectProjectDescriptionValue(newDescription);
	});

	test('should display members table with correct structure @auth:owner', async ({ aura }) => {
		// Create a new project
		const projectName = `Table Structure ${nanoid(8)}`;
		const { projectId } = await aura.projectComposer.createProject(projectName);

		// Navigate to project settings
		await aura.navigate.toProjectSettings(projectId);
		await expect(aura.projectSettings.getTitle()).toHaveText(projectName);

		const table = aura.projectSettings.getMembersTable();

		// Verify table headers are present
		await expect(table.getByText('User')).toBeVisible();
		await expect(table.getByText('Role')).toBeVisible();

		// Verify the owner is displayed in the table
		const memberRows = table.locator('tbody tr');
		await expect(memberRows).toHaveCount(1);

		// Verify owner cannot change their own role
		const ownerRow = memberRows.first();
		const roleDropdown = ownerRow.getByTestId('project-member-role-dropdown');
		await expect(roleDropdown).toHaveCount(0);
	});

	test('should display role dropdown for members but not for current user @auth:owner', async ({
		aura,
	}) => {
		// Create a new project
		const projectName = `Role Dropdown ${nanoid(8)}`;
		const { projectId } = await aura.projectComposer.createProject(projectName);

		// Navigate to project settings
		await aura.navigate.toProjectSettings(projectId);
		await expect(aura.projectSettings.getTitle()).toHaveText(projectName);

		// Current user (owner) should not have a role dropdown
		const currentUserRow = aura.page.locator('tbody tr').first();
		await expect(currentUserRow.getByTestId('project-member-role-dropdown')).toHaveCount(0);

		// The role should be displayed as static text for the current user
		await expect(currentUserRow.getByText('Admin')).toBeVisible();
	});

	test('should show project settings form validation @auth:owner', async ({ aura }) => {
		// Create a new project
		const projectName = `Validation ${nanoid(8)}`;
		const { projectId } = await aura.projectComposer.createProject(projectName);

		// Navigate to project settings
		await aura.navigate.toProjectSettings(projectId);
		await expect(aura.projectSettings.getTitle()).toHaveText(projectName);

		// Clear the project name (required field)
		await aura.projectSettings.fillProjectName('');

		// Save button should be disabled when required field is empty
		await expect(aura.projectSettings.getSaveButton()).toBeDisabled();

		// Fill in a valid name
		await aura.projectSettings.fillProjectName('Valid Project Name');

		// Save button should now be enabled
		await expect(aura.projectSettings.getSaveButton()).toBeEnabled();
	});

	test('should handle unsaved changes state @auth:owner', async ({ aura }) => {
		// Create a new project
		const projectName = `Unsaved Changes ${nanoid(8)}`;
		const { projectId } = await aura.projectComposer.createProject(projectName);

		// Navigate to project settings
		await aura.navigate.toProjectSettings(projectId);
		await expect(aura.projectSettings.getTitle()).toHaveText(projectName);

		// Initially, save and cancel buttons should be disabled (no changes)
		await expect(aura.projectSettings.getSaveButton()).toBeDisabled();
		await expect(aura.projectSettings.getCancelButton()).toBeDisabled();

		// Make a change to the project name
		await aura.projectSettings.fillProjectName('Modified Name');

		// Save and cancel buttons should now be enabled
		await expect(aura.projectSettings.getSaveButton()).toBeEnabled();
		await expect(aura.projectSettings.getCancelButton()).toBeEnabled();

		// Cancel changes
		await aura.projectSettings.clickCancelButton();

		// Buttons should be disabled again (no changes)
		await expect(aura.projectSettings.getSaveButton()).toBeDisabled();
		await expect(aura.projectSettings.getCancelButton()).toBeDisabled();
	});

	test('should display delete project section with warning @auth:owner', async ({ aura }) => {
		// Create a new project
		const projectName = `Delete Test ${nanoid(8)}`;
		const { projectId } = await aura.projectComposer.createProject(projectName);

		// Navigate to project settings
		await aura.navigate.toProjectSettings(projectId);
		await expect(aura.projectSettings.getTitle()).toHaveText(projectName);

		// Scroll to bottom to see delete section
		await aura.projectSettings.getDeleteButton().scrollIntoViewIfNeeded();

		// Verify danger section is visible with warning
		// Copy was updated in UI to use sentence case and expanded description
		await expect(aura.page.getByText('Danger zone')).toBeVisible();
		await expect(
			aura.page.getByText(
				'When deleting a project, you can also choose to move all workflows and credentials to another project.',
			),
		).toBeVisible();
		await expect(aura.projectSettings.getDeleteButton()).toBeVisible();
	});

	test('should persist settings after page reload @auth:owner', async ({ aura }) => {
		// Create a new project
		const projectName = `Persistence ${nanoid(8)}`;
		const { projectId } = await aura.projectComposer.createProject(projectName);

		// Navigate to project settings
		await aura.navigate.toProjectSettings(projectId);
		await expect(aura.projectSettings.getTitle()).toHaveText(projectName);

		// Update project details
		const newProjectName = 'Persisted Project Name';
		const projectDescription = 'This description should persist after reload';

		await aura.projectSettings.fillProjectName(newProjectName);
		await aura.projectSettings.fillProjectDescription(projectDescription);
		await aura.projectSettings.clickSaveButton();

		// Wait for save confirmation (partial match to include project name)
		await expect(
			aura.page.getByText('Project Persisted Project Name saved successfully', { exact: false }),
		).toBeVisible();

		// Reload the page
		await aura.page.reload();
		await expect(aura.projectSettings.getTitle()).toHaveText('Persisted Project Name');

		// Verify data persisted
		await aura.projectSettings.expectProjectNameValue(newProjectName);
		await aura.projectSettings.expectProjectDescriptionValue(projectDescription);

		// Verify table still shows the owner
		await aura.projectSettings.expectTableHasMemberCount(1);
	});
});
