import { test, expect } from '../../fixtures/base';

test.describe('AI-716 Correctly set up agent model shows error', () => {
	test('should not show error when adding a sub-node with credential set-up', async ({ aura }) => {
		await aura.goHome();
		await aura.workflows.addResource.workflow();

		await aura.canvas.addNode('AI Agent');

		await aura.page.keyboard.press('Escape');

		await aura.canvas.addNode('OpenAI Chat Model');

		await aura.credentialsComposer.createFromNdv({
			apiKey: 'sk-123',
		});

		await aura.page.keyboard.press('Escape');

		await expect(aura.canvas.getNodeIssuesByName('OpenAI Chat Model')).toHaveCount(0);
	});
});
