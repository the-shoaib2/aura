import type { CurrentsFixtures, CurrentsWorkerFixtures } from '@currents/playwright';
import { fixtures as currentsFixtures } from '@currents/playwright';
import { test as base, expect, request } from '@playwright/test';
import type { N8NStack } from 'aura-containers/aura-test-container-creation';
import { createN8NStack } from 'aura-containers/aura-test-container-creation';
import { ContainerTestHelpers } from 'aura-containers/aura-test-container-helpers';

import { setupDefaultInterceptors } from '../config/intercepts';
import { auraPage } from '../pages/auraPage';
import { ApiHelpers } from '../services/api-helper';
import { ProxyServer } from '../services/proxy-server';
import { TestError, type TestRequirements } from '../Types';
import { setupTestRequirements } from '../utils/requirements';

type TestFixtures = {
	aura: auraPage;
	api: ApiHelpers;
	baseURL: string;
	setupRequirements: (requirements: TestRequirements) => Promise<void>;
	proxyServer: ProxyServer;
};

type WorkerFixtures = {
	auraUrl: string;
	dbSetup: undefined;
	chaos: ContainerTestHelpers;
	auraContainer: N8NStack;
	containerConfig: ContainerConfig;
	addContainerCapability: ContainerConfig;
};

interface ContainerConfig {
	postgres?: boolean;
	queueMode?: {
		mains: number;
		workers: number;
	};
	env?: Record<string, string>;
	proxyServerEnabled?: boolean;
	taskRunner?: boolean;
	sourceControl?: boolean;
	email?: boolean;
	resourceQuota?: {
		memory?: number; // in GB
		cpu?: number; // in cores
	};
}

/**
 * Extended Playwright test with aura-specific fixtures.
 * Supports both external aura instances (via N8N_BASE_URL) and containerized testing.
 * Provides tag-driven authentication and database management.
 */
export const test = base.extend<
	TestFixtures & CurrentsFixtures,
	WorkerFixtures & CurrentsWorkerFixtures
>({
	...currentsFixtures.baseFixtures,
	...currentsFixtures.coverageFixtures,
	...currentsFixtures.actionFixtures,

	// Add a container capability to the test e.g proxy server, task runner, etc
	addContainerCapability: [
		async ({}, use) => {
			await use({});
		},
		{ scope: 'worker', box: true },
	],

	// Container configuration from the project use options
	containerConfig: [
		async ({ addContainerCapability }, use, workerInfo) => {
			const projectConfig = workerInfo.project.use as { containerConfig?: ContainerConfig };
			const baseConfig = projectConfig?.containerConfig ?? {};

			// Build merged configuration
			const merged: ContainerConfig = {
				...baseConfig,
				...addContainerCapability,
				env: {
					...baseConfig.env,
					...addContainerCapability.env,
					E2E_TESTS: 'true',
				},
			};

			await use(merged);
		},
		{ scope: 'worker', box: true },
	],

	// Create a new aura container if N8N_BASE_URL is not set, otherwise use the existing aura instance
	auraContainer: [
		async ({ containerConfig }, use) => {
			const envBaseURL = process.env.N8N_BASE_URL;

			if (envBaseURL) {
				await use(null as unknown as N8NStack);
				return;
			}

			console.log('Creating container with config:', containerConfig);
			const container = await createN8NStack(containerConfig);

			console.log(`Container URL: ${container.baseUrl}`);

			await use(container);
			await container.stop();
		},
		{ scope: 'worker', box: true },
	],

	// Set the aura URL for based on the N8N_BASE_URL environment variable or the aura container
	auraUrl: [
		async ({ auraContainer }, use) => {
			const envBaseURL = process.env.N8N_BASE_URL ?? auraContainer?.baseUrl;
			await use(envBaseURL);
		},
		{ scope: 'worker' },
	],

	// Reset the database for the new container
	dbSetup: [
		async ({ auraUrl, auraContainer }, use) => {
			if (auraContainer) {
				console.log('Resetting database for new container');
				const apiContext = await request.newContext({ baseURL: auraUrl });
				const api = new ApiHelpers(apiContext);
				await api.resetDatabase();
				await apiContext.dispose();
			}
			await use(undefined);
		},
		{ scope: 'worker' },
	],

	// Create container test helpers for the aura container.
	chaos: [
		async ({ auraContainer }, use) => {
			if (process.env.N8N_BASE_URL) {
				throw new TestError(
					'Chaos testing is not supported when using N8N_BASE_URL environment variable. Remove N8N_BASE_URL to use containerized testing.',
				);
			}
			const helpers = new ContainerTestHelpers(auraContainer.containers);
			await use(helpers);
		},
		{ scope: 'worker' },
	],

	baseURL: async ({ auraUrl, dbSetup }, use) => {
		void dbSetup; // Ensure dbSetup runs first
		await use(auraUrl);
	},

	aura: async ({ context }, use, testInfo) => {
		await setupDefaultInterceptors(context);
		const page = await context.newPage();
		const auraInstance = new auraPage(page);
		await auraInstance.api.setupFromTags(testInfo.tags);
		// Enable project features for the tests, this is used in several tests, but is never disabled in tests, so we can have it on by default
		await auraInstance.start.withProjectFeatures();
		await use(auraInstance);
	},

	// This is a completely isolated API context for tests that don't need the browser
	api: async ({ baseURL }, use, testInfo) => {
		const context = await request.newContext({ baseURL });
		const api = new ApiHelpers(context);
		await api.setupFromTags(testInfo.tags);
		await use(api);
		await context.dispose();
	},

	setupRequirements: async ({ aura, context }, use) => {
		const setupFunction = async (requirements: TestRequirements): Promise<void> => {
			await setupTestRequirements(aura, context, requirements);
		};

		await use(setupFunction);
	},

	proxyServer: async ({ auraContainer }, use) => {
		// auraContainer is "null" if running tests in "local" mode
		if (!auraContainer) {
			throw new TestError(
				'Testing with Proxy server is not supported when using N8N_BASE_URL environment variable. Remove N8N_BASE_URL to use containerized testing.',
			);
		}

		const proxyServerContainer = auraContainer.containers.find((container) =>
			container.getName().endsWith('proxyserver'),
		);

		// proxy server is not initialized in local mode (it be only supported in container modes)
		// tests that require proxy server should have "@capability:proxy" so that they are skipped in local mode
		if (!proxyServerContainer) {
			throw new TestError('Proxy server container not initialized. Cannot initialize client.');
		}

		const serverUrl = `http://${proxyServerContainer?.getHost()}:${proxyServerContainer?.getFirstMappedPort()}`;
		const proxyServer = new ProxyServer(serverUrl);

		await use(proxyServer);
	},
});

export { expect };

/*
Dependency Graph:
Worker Scope: containerConfig → auraContainer → [auraUrl, chaos] → dbSetup
Test Scope:
  - UI Stream: dbSetup → baseURL → context → page → aura
  - API Stream: dbSetup → baseURL → api
Note: baseURL depends on dbSetup to ensure database is ready before tests run
Both streams are independent after baseURL, allowing for pure API tests or combined UI+API tests
*/
