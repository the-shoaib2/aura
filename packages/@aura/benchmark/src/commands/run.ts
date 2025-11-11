import { Command, Flags } from '@oclif/core';

import { testScenariosPath } from '@/config/common-flags';
import { ApiClient } from '@/api-client/api-client';
import { ScenarioDataFileLoader } from '@/scenario/scenario-data-loader';
import { ScenarioLoader } from '@/scenario/scenario-loader';
import type { K6Tag } from '@/test-execution/k6-executor';
import { K6Executor } from '@/test-execution/k6-executor';
import { ScenarioRunner } from '@/test-execution/scenario-runner';

export default class RunCommand extends Command {
	static description = 'Run all (default) or specified test scenarios';

	static flags = {
		testScenariosPath,
		scenarioFilter: Flags.string({
			char: 'f',
			description: 'Filter scenarios by name',
		}),
		scenarioNamePrefix: Flags.string({
			description: 'Prefix for the scenario name',
			default: 'Unnamed',
		}),
		auraBaseUrl: Flags.string({
			description: 'The base URL for the aura instance',
			default: 'http://localhost:5678',
			env: 'aura_BASE_URL',
		}),
		auraUserEmail: Flags.string({
			description: 'The email address of the aura user',
			default: 'benchmark-user@aura.io',
			env: 'aura_USER_EMAIL',
		}),
		k6ExecutablePath: Flags.string({
			doc: 'The path to the k6 binary',
			default: 'k6',
			env: 'K6_PATH',
		}),
		k6ApiToken: Flags.string({
			doc: 'The API token for k6 cloud',
			default: undefined,
			env: 'K6_API_TOKEN',
		}),
		out: Flags.string({
			description: 'The --out flag for k6',
			default: undefined,
			env: 'K6_OUT',
		}),
		resultWebhookUrl: Flags.string({
			doc: 'The URL where the benchmark results should be sent to',
			default: undefined,
			env: 'BENCHMARK_RESULT_WEBHOOK_URL',
		}),
		resultWebhookAuthHeader: Flags.string({
			doc: 'The Authorization header value for the benchmark results webhook',
			default: undefined,
			env: 'BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER',
		}),
		auraUserPassword: Flags.string({
			description: 'The password of the aura user',
			default: 'VerySecret!123',
			env: 'aura_USER_PASSWORD',
		}),
		tags: Flags.string({
			char: 't',
			description: 'Tags to attach to the run. Comma separated list of key=value pairs',
		}),
		vus: Flags.integer({
			description: 'Number of concurrent requests to make',
			default: 5,
		}),
		duration: Flags.string({
			description: 'Duration of the test with a unit, e.g. 1m',
			default: '1m',
		}),
	};

	async run() {
		const { flags } = await this.parse(RunCommand);
		const tags = await this.parseTags();
		const scenarioLoader = new ScenarioLoader();

		const scenarioRunner = new ScenarioRunner(
			new ApiClient(flags.auraBaseUrl),
			new ScenarioDataFileLoader(),
			new K6Executor({
				duration: flags.duration,
				vus: flags.vus,
				k6Out: flags.out,
				k6ExecutablePath: flags.k6ExecutablePath,
				k6ApiToken: flags.k6ApiToken,
				auraApiBaseUrl: flags.auraBaseUrl,
				tags,
				resultsWebhook: flags.resultWebhookUrl
					? {
							url: flags.resultWebhookUrl,
							authHeader: flags.resultWebhookAuthHeader,
						}
					: undefined,
			}),
			{
				email: flags.auraUserEmail,
				password: flags.auraUserPassword,
			},
			flags.scenarioNamePrefix,
		);

		const allScenarios = scenarioLoader.loadAll(flags.testScenariosPath, flags.scenarioFilter);

		await scenarioRunner.runManyScenarios(allScenarios);
	}

	private async parseTags(): Promise<K6Tag[]> {
		const { flags } = await this.parse(RunCommand);
		if (!flags.tags) {
			return [];
		}

		return flags.tags.split(',').map((tag) => {
			const [name, value] = tag.split('=');
			return { name, value };
		});
	}
}
