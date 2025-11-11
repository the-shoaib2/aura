import { NodeTestHarness } from '@nodes-testing/node-test-harness';
import nock from 'nock';

describe('Test N8n Node', () => {
	const baseUrl = 'https://test.app.aura.cloud/api/v1';
	const credentials = {
		auraApi: {
			apiKey: 'key123',
			baseUrl,
		},
	};

	beforeAll(async () => {
		const { pinData } = await import('./workflow.aura.workflows.json');
		const apiResponse = pinData.aura.map((item) => item.json);
		nock(baseUrl).get('/workflows?tags=aura-test').reply(200, { data: apiResponse });
	});

	new NodeTestHarness().setupTests({ credentials });
});
