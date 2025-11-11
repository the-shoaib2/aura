import { test, expect } from '../../fixtures/base';

test.describe('Schedule Trigger node', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.goHome();
	});

	test('should execute schedule trigger node and return timestamp in output', async ({ aura }) => {
		await aura.workflows.addResource.workflow();
		await aura.canvas.addNode('Schedule Trigger');

		await aura.ndv.execute();

		await expect(aura.ndv.outputPanel.get()).toContainText('timestamp');

		await aura.ndv.clickBackToCanvasButton();
	});
});
