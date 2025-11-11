import { CODE_NODE_NAME, MANUAL_TRIGGER_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';

test.use({
	addContainerCapability: {
		taskRunner: true,
	},
});

/**
 * Task Runner Capability Tests
 *
 * These tests require the task runner container to be running.
 * Use @capability:task-runner tag to ensure they only run in task runner mode.
 */
test.describe('Task Runner Capability @capability:task-runner', () => {
	test('should execute Javascript with task runner enabled', async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in JavaScript', closeNDV: true });

		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});

	test('should execute Python with task runner enabled', async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);
		await aura.canvas.addNode(CODE_NODE_NAME, { action: 'Code in Python (Beta)', closeNDV: true });
		await aura.workflowComposer.executeWorkflowAndWaitForNotification(
			'Workflow executed successfully',
		);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});
});
