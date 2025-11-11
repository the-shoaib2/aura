import { test, expect } from '../../fixtures/base';

test.describe('Canvas Actions', () => {
	test('adds sticky to canvas with default text and position', async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await expect(aura.canvas.sticky.getAddButton()).toBeVisible();

		await aura.canvas.sticky.addSticky();

		const firstSticky = aura.canvas.sticky.getStickies().first();
		await expect(firstSticky).toHaveCSS('height', '160px');
		await expect(firstSticky).toHaveCSS('width', '240px');

		await aura.canvas.deselectAll();
		await aura.canvas.sticky.addFromContextMenu(aura.canvas.canvasPane());
		await aura.page.keyboard.press('Shift+s');

		await expect(aura.canvas.sticky.getStickies()).toHaveCount(3);

		await aura.page.keyboard.press('ControlOrMeta+Shift+s');
		await expect(aura.canvas.sticky.getStickies()).toHaveCount(3);

		await expect(aura.canvas.sticky.getStickies().first()).toHaveText(
			'I’m a note\nDouble click to edit me. Guide\n',
		);
		const guideLink = aura.canvas.sticky.getDefaultStickyGuideLink();
		await expect(guideLink).toHaveAttribute('href');
	});
});
