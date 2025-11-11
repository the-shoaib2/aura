import { test, expect } from '../../fixtures/base';

test.describe('HTTP Request node', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should make a request with a URL and receive a response', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('HTTP Request', { closeNDV: false });

		await aura.ndv.setupHelper.httpRequest({
			url: 'https://catfact.ninja/fact',
		});
		await aura.ndv.execute();

		await expect(aura.ndv.outputPanel.get()).toContainText('fact');
	});

	test.describe('Credential-only HTTP Request Node variants', () => {
		test('should render a modified HTTP Request Node', async ({ aura }) => {
			await aura.canvas.addNode('Manual Trigger');
			await aura.canvas.addNode('VirusTotal');

			await expect(aura.ndv.getNodeNameContainer()).toContainText('VirusTotal HTTP Request');
			await expect(aura.ndv.getParameterInputField('url')).toHaveValue(
				'https://www.virustotal.com/api/v3/',
			);

			await expect(aura.ndv.getParameterInput('authentication')).toBeHidden();
			await expect(aura.ndv.getParameterInput('nodeCredentialType')).toBeHidden();

			await expect(aura.ndv.getCredentialLabel('Credential for VirusTotal')).toBeVisible();
		});
	});
});
