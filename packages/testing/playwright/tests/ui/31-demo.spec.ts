import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';
import simpleWorkflow from '../../workflows/Manual_wait_set.json';
import workflowWithPinned from '../../workflows/Webhook_set_pinned.json';

const requirements: TestRequirements = {
	config: {
		settings: {
			previewMode: true,
		},
	},
};

test.describe('Demo', () => {
	test.beforeEach(async ({ setupRequirements }) => {
		await setupRequirements(requirements);
	});

	test('can import template', async ({ aura }) => {
		await aura.demo.visitDemoPage();
		expect(await aura.notifications.getAllNotificationTexts()).toHaveLength(0);
		await aura.demo.importWorkflow(simpleWorkflow);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
	});

	test('can import workflow with pin data', async ({ aura }) => {
		await aura.demo.visitDemoPage();
		await aura.demo.importWorkflow(workflowWithPinned);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
		await aura.canvas.openNode('Webhook');
		await expect(aura.ndv.outputPanel.getTableHeaders().first()).toContainText('headers');
		await expect(aura.ndv.outputPanel.getTbodyCell(0, 3)).toContainText('dragons');
	});

	test('can override theme to dark', async ({ aura }) => {
		await aura.demo.visitDemoPage('dark');
		await expect(aura.demo.getBody()).toHaveAttribute('data-theme', 'dark');
		expect(await aura.notifications.getAllNotificationTexts()).toHaveLength(0);
	});

	test('can override theme to light', async ({ aura }) => {
		await aura.demo.visitDemoPage('light');
		await expect(aura.demo.getBody()).toHaveAttribute('data-theme', 'light');
		expect(await aura.notifications.getAllNotificationTexts()).toHaveLength(0);
	});
});
