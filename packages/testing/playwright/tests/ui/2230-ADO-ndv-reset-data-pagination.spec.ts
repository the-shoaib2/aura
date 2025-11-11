import { test, expect } from '../../fixtures/base';

test.describe('ADO-2230 NDV Pagination Reset', () => {
	test('should reset pagination if data size changes to less than current page', async ({
		aura,
	}) => {
		await aura.start.fromImportedWorkflow('NDV-debug-generate-data.json');

		await aura.canvas.openNode('DebugHelper');
		await aura.ndv.execute();
		await aura.notifications.quickCloseAll();

		const outputPagination = aura.ndv.getOutputPagination();
		await expect(outputPagination).toBeVisible();

		await expect(aura.ndv.getOutputPaginationPages()).toHaveCount(5);

		await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).not.toBeEmpty();
		const firstPageContent = await aura.ndv.outputPanel.getTbodyCell(0, 0).textContent();

		await aura.ndv.navigateToOutputPage(4);

		await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).not.toHaveText(firstPageContent ?? '');

		await aura.ndv.setParameterInputValue('randomDataCount', '20');

		await aura.ndv.execute();
		await aura.notifications.quickCloseAll();

		await expect(aura.ndv.getOutputPaginationPages()).toHaveCount(2);

		await expect(aura.ndv.outputPanel.getTbodyCell(0, 0)).not.toBeEmpty();
	});
});
