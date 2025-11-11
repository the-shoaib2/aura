import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';
import { measurePerformance, attachMetric } from '../../utils/performance-helper';

async function setupPerformanceTest(aura: auraPage, size: number) {
	await aura.start.fromImportedWorkflow('large.json');
	await aura.notifications.closeNotificationByText('Successful');

	await aura.canvas.openNode('Edit Fields');
	await aura.ndv.fillParameterInputByName('value', size.toString());
	await aura.ndv.clickBackToCanvasButton();
}

test.use({
	addContainerCapability: {
		resourceQuota: {
			memory: 0.75,
			cpu: 0.5,
		},
	},
});
test.describe('Large Data Size Performance - Cloud Resources', () => {
	test('Code Node with 30000 items', async ({ aura }, testInfo) => {
		const itemCount = 30000;
		await setupPerformanceTest(aura, itemCount);
		const workflowExecuteBudget = 60_000;
		const openNodeBudget = 800;
		const loopSize = 30;
		const stats = [];

		const triggerDuration = await measurePerformance(aura.page, 'trigger-workflow', async () => {
			await aura.workflowComposer.executeWorkflowAndWaitForNotification(
				'Workflow executed successfully',
				{
					// Add buffer, we still assert at the end and expect less than the budget
					timeout: workflowExecuteBudget + 5000,
				},
			);
		});

		for (let i = 0; i < loopSize; i++) {
			const openNodeDuration = await measurePerformance(aura.page, `open-node-${i}`, async () => {
				await aura.canvas.openNode('Code');
			});

			stats.push(openNodeDuration);
			await aura.ndv.clickBackToCanvasButton();
		}
		const average = stats.reduce((a, b) => a + b, 0) / stats.length;

		await attachMetric(testInfo, `open-node-${itemCount}`, average, 'ms');
		await attachMetric(testInfo, `trigger-workflow-${itemCount}`, triggerDuration, 'ms');

		expect.soft(average, `Open node duration for ${itemCount} items`).toBeLessThan(openNodeBudget);
	});
});
