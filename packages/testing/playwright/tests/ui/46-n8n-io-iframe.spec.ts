import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

const telemetryDisabledRequirements: TestRequirements = {
	config: {
		settings: {
			telemetry: { enabled: false },
		},
	},
	storage: {
		'aura-telemetry': JSON.stringify({ enabled: false }),
	},
};

const telemetryEnabledRequirements: TestRequirements = {
	config: {
		settings: {
			telemetry: { enabled: true },
			instanceId: 'test-instance-id',
		},
	},
	storage: {
		'aura-telemetry': JSON.stringify({ enabled: true }),
		'aura-instance-id': 'test-instance-id',
	},
	intercepts: {
		iframeRequest: {
			url: 'https://aura.io/self-install*',
			response: '<html><body>Test iframe content</body></html>',
			contentType: 'text/html',
		},
	},
};

test.describe('aura.io iframe', () => {
	test.describe('when telemetry is disabled', () => {
		test('should not load the iframe when visiting /home/workflows', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(telemetryDisabledRequirements);

			await aura.page.goto('/');
			await aura.page.waitForLoadState();
			await expect(aura.iframe.getIframe()).not.toBeAttached();
		});
	});

	test.describe('when telemetry is enabled', () => {
		test('should load the iframe when visiting /home/workflows @auth:owner', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(telemetryEnabledRequirements);

			// Get current user ID from the API
			const currentUser = await aura.api.get('/rest/login');
			const testInstanceId = 'test-instance-id';
			const testUserId = currentUser.id;
			const iframeUrl = `https://aura.io/self-install?instanceId=${testInstanceId}&userId=${testUserId}`;

			await aura.page.goto('/');
			await aura.page.waitForLoadState();

			const iframeElement = aura.iframe.getIframeBySrc(iframeUrl);
			await expect(iframeElement).toBeAttached();

			await expect(iframeElement).toHaveAttribute('src', iframeUrl);
		});
	});
});
