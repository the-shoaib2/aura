import { test, expect } from '../../fixtures/base';

test.describe('RAG callout experiment', () => {
	test.describe('NDV callout', () => {
		test('should show callout and open template on click', async ({ aura }) => {
			await aura.start.fromBlankCanvas();
			await aura.canvas.addNode('Zep Vector Store', {
				action: 'Add documents to vector store',
				closeNDV: false,
			});

			await expect(aura.canvas.getRagCalloutTip()).toBeVisible();

			const popupPromise = aura.page.waitForEvent('popup');
			await aura.canvas.clickRagTemplateLink();

			const popup = await popupPromise;
			expect(popup.url()).toContain('/workflows/templates/rag-starter-template?fromJson=true');

			await popup.close();
		});
	});

	test.describe('search callout', () => {
		test('should show callout and open template on click', async ({ aura }) => {
			await aura.start.fromBlankCanvas();
			await aura.canvas.clickNodeCreatorPlusButton();
			await aura.canvas.fillNodeCreatorSearchBar('rag');

			const popupPromise = aura.page.waitForEvent('popup');
			await expect(aura.canvas.getRagTemplateLink()).toBeVisible();
			await aura.canvas.clickRagTemplateLink();

			const popup = await popupPromise;
			expect(popup.url()).toContain('/workflows/templates/rag-starter-template?fromJson=true');

			await popup.close();
		});
	});
});
