import { test, expect } from '../../fixtures/base';

const NOTIFICATIONS = {
	WORKFLOW_CREATED: 'Workflow successfully created',
};

test.describe('Editor zoom should work after route changes', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.api.enableFeature('debugInEditor');
		await aura.api.enableFeature('workflowHistory');

		await aura.workflowComposer.createWorkflowFromJsonFile(
			'Lots_of_nodes.json',
			'Lots of nodes test',
		);
		await aura.notifications.waitForNotificationAndClose(NOTIFICATIONS.WORKFLOW_CREATED);
	});

	test('should maintain zoom functionality after switching between Editor and Workflow history and Workflow list', async ({
		aura,
	}) => {
		const initialNodeCount = await aura.canvas.getCanvasNodes().count();
		expect(initialNodeCount).toBeGreaterThan(0);

		await aura.canvasComposer.switchBetweenEditorAndHistory();
		await aura.canvasComposer.zoomInAndCheckNodes();

		await aura.canvasComposer.switchBetweenEditorAndHistory();
		await aura.canvasComposer.switchBetweenEditorAndHistory();
		await aura.canvasComposer.zoomInAndCheckNodes();

		await aura.canvasComposer.switchBetweenEditorAndWorkflowList();
		await aura.canvasComposer.zoomInAndCheckNodes();

		await aura.canvasComposer.switchBetweenEditorAndWorkflowList();
		await aura.canvasComposer.switchBetweenEditorAndWorkflowList();
		await aura.canvasComposer.zoomInAndCheckNodes();

		await aura.canvasComposer.switchBetweenEditorAndHistory();
		await aura.canvasComposer.switchBetweenEditorAndWorkflowList();
	});
});
