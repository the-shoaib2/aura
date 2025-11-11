import { nanoid } from 'nanoid';

import { test, expect } from '../../fixtures/base';

test.describe('Workflow tags - Tag creation', () => {
	test('should create and attach tags inline, then add more incrementally', async ({ aura }) => {
		await aura.start.fromBlankCanvas();

		const tag1 = `tag-${nanoid(6)}`;
		const tag2 = `tag-${nanoid(6)}`;
		const tag3 = `tag-${nanoid(6)}`;

		await aura.canvas.clickCreateTagButton();
		await aura.canvas.typeInTagInput(tag1);
		await aura.canvas.pressEnterToCreateTag();

		await aura.canvas.typeInTagInput(tag2);
		await aura.canvas.pressEnterToCreateTag();

		await expect(aura.canvas.getTagPills()).toHaveCount(2);

		await aura.canvas.clickNthTagPill(0);
		await aura.canvas.getVisibleDropdown().waitFor();
		await aura.canvas.typeInTagInput(tag3);
		await aura.canvas.pressEnterToCreateTag();

		await aura.canvas.clickOutsideModal();

		await expect(aura.canvas.getTagPills()).toHaveCount(3);

		// Pills should be rendered individually, not collapsed as "+3"
		const tagsContainer = aura.page.getByTestId('workflow-tags-container');
		await expect(tagsContainer).not.toHaveText(/\+\d+/);

		await expect(aura.canvas.getWorkflowSaveButton()).toContainText('Saved');
	});

	test('should create tags via modal without attaching them', async ({ aura }) => {
		await aura.start.fromBlankCanvas();

		const tag1 = `modal-${nanoid(6)}`;
		const tag2 = `modal-${nanoid(6)}`;

		await aura.canvas.openTagManagerModal();

		await aura.canvas.tagsManagerModal.clickAddNewButton();
		await aura.canvas.tagsManagerModal.getTagInputInModal().fill(tag1);
		await aura.canvas.pressEnterToCreateTag();
		await aura.canvas.tagsManagerModal.getTable().getByText(tag1).waitFor();

		await aura.canvas.tagsManagerModal.clickAddNewButton();
		await aura.canvas.tagsManagerModal.getTagInputInModal().fill(tag2);
		await aura.canvas.pressEnterToCreateTag();
		await aura.canvas.tagsManagerModal.getTable().getByText(tag2).waitFor();

		await aura.canvas.tagsManagerModal.clickDoneButton();

		await aura.canvas.clickCreateTagButton();

		await expect(aura.canvas.getTagItemInDropdownByName(tag1)).toBeVisible();
		await expect(aura.canvas.getTagItemInDropdownByName(tag2)).toBeVisible();
		await expect(aura.canvas.getTagPills()).toHaveCount(0);

		await aura.canvas.getTagItemInDropdownByName(tag1).click();
		await expect(aura.canvas.getTagPills()).toHaveCount(1);
	});
});

test.describe('Workflow tags - Tag operations', () => {
	test('should delete all tags via modal with confirmation', async ({ aura, api }) => {
		const tags = await Promise.all([
			api.tags.create(`del-${nanoid(6)}`),
			api.tags.create(`del-${nanoid(6)}`),
			api.tags.create(`del-${nanoid(6)}`),
			api.tags.create(`del-${nanoid(6)}`),
			api.tags.create(`del-${nanoid(6)}`),
		]);

		await aura.start.fromBlankCanvas();
		await aura.canvas.openTagManagerModal();

		for (let i = 0; i < 5; i++) {
			await aura.canvas.tagsManagerModal.getFirstTagRow().hover();
			await aura.canvas.tagsManagerModal.getDeleteTagButton().first().click();
			await aura.canvas.tagsManagerModal.getDeleteTagConfirmButton().click();
			await expect(aura.canvas.tagsManagerModal.getDeleteConfirmationMessage()).toBeHidden();
		}

		await aura.canvas.tagsManagerModal.clickDoneButton();
		await aura.canvas.clickCreateTagButton();

		await expect(aura.canvas.getTagItemsInDropdown()).toHaveCount(0);

		for (const tag of tags) {
			await expect(aura.canvas.getTagItemInDropdownByName(tag.name)).not.toBeAttached();
		}

		await expect(aura.canvas.getTagPills()).toHaveCount(0);
	});

	test('should detach tag by clicking X in dropdown', async ({ aura, api }) => {
		const tags = await Promise.all([
			api.tags.create(`detach-x-${nanoid(6)}`),
			api.tags.create(`detach-x-${nanoid(6)}`),
			api.tags.create(`detach-x-${nanoid(6)}`),
			api.tags.create(`detach-x-${nanoid(6)}`),
			api.tags.create(`detach-x-${nanoid(6)}`),
		]);

		await aura.start.fromBlankCanvas();

		await aura.canvas.clickCreateTagButton();
		for (const tag of tags) {
			await aura.canvas.getTagItemInDropdownByName(tag.name).click();
		}
		await expect(aura.canvas.getTagPills()).toHaveCount(5);

		await aura.canvas.clickNthTagPill(0);

		// Click X on tag pill inside the workflow-tags-dropdown component
		await aura.page.getByTestId('workflow-tags-dropdown').locator('.el-tag__close').first().click();

		await aura.canvas.clickOutsideModal();
		await aura.canvas.clickWorkflowTagsArea();

		await expect(aura.canvas.getTagPills()).toHaveCount(4);
	});

	test('should detach tag by clicking selected item in dropdown', async ({ aura, api }) => {
		const tags = await Promise.all([
			api.tags.create(`toggle-${nanoid(6)}`),
			api.tags.create(`toggle-${nanoid(6)}`),
			api.tags.create(`toggle-${nanoid(6)}`),
			api.tags.create(`toggle-${nanoid(6)}`),
			api.tags.create(`toggle-${nanoid(6)}`),
		]);

		await aura.start.fromBlankCanvas();

		await aura.canvas.clickCreateTagButton();
		for (const tag of tags) {
			await aura.canvas.getTagItemInDropdownByName(tag.name).click();
		}
		await expect(aura.canvas.getTagPills()).toHaveCount(5);

		await aura.canvas.clickWorkflowTagsContainer();
		await aura.canvas.getSelectedTagItems().first().click();

		await aura.canvas.clickOutsideModal();
		await aura.canvas.clickWorkflowTagsArea();

		await expect(aura.canvas.getTagPills()).toHaveCount(4);
	});

	test('should not show non-existing tag as selectable option', async ({ aura, api }) => {
		const tags = await Promise.all([
			api.tags.create(`exist-${nanoid(6)}`),
			api.tags.create(`exist-${nanoid(6)}`),
			api.tags.create(`exist-${nanoid(6)}`),
			api.tags.create(`exist-${nanoid(6)}`),
			api.tags.create(`exist-${nanoid(6)}`),
		]);
		const nonExisting = `nonexist-${nanoid(6)}`;

		await aura.start.fromBlankCanvas();

		await aura.canvas.clickCreateTagButton();
		for (const tag of tags) {
			await aura.canvas.getTagItemInDropdownByName(tag.name).click();
		}
		await expect(aura.canvas.getTagPills()).toHaveCount(5);

		await aura.canvas.clickOutsideModal();
		await aura.canvas.clickWorkflowTagsArea();
		await aura.canvas.typeInTagInput(nonExisting);

		const dropdownItems = aura.canvas.getVisibleDropdown().locator('li');

		await expect(dropdownItems).toHaveCount(2);
		await expect(aura.canvas.getTagItemsInDropdown()).toHaveCount(0);
	});
});
