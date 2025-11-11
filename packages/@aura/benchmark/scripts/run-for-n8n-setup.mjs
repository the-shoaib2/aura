#!/usr/bin/env zx
/**
 * This script runs the benchmarks for the given aura setup.
 */
// @ts-check
import path from 'path';
import { $, argv, fs } from 'zx';
import { DockerComposeClient } from './clients/docker-compose-client.mjs';
import { flagsObjectToCliArgs } from './utils/flags.mjs';
import { EOL } from 'os';

const paths = {
	auraSetupsDir: path.join(__dirname, 'aura-setups'),
	mockApiDataPath: path.join(__dirname, 'mock-api'),
};

const N8N_ENCRYPTION_KEY = 'very-secret-encryption-key';

/**
 * Discovers runner services in the docker-compose setup, where the name matches exactly `runners` or ends with `_runners`
 */
async function discoverRunnerServices(dockerComposeClient) {
	const result = await dockerComposeClient.$('config', '--services');

	return result.stdout
		.trim()
		.split(EOL)
		.filter((service) => service === 'runners' || service.endsWith('_runners'));
}

async function main() {
	const [auraSetupToUse] = argv._;
	validateN8nSetup(auraSetupToUse);

	const composeFilePath = path.join(paths.auraSetupsDir, auraSetupToUse);
	const setupScriptPath = path.join(paths.auraSetupsDir, auraSetupToUse, 'setup.mjs');
	const auraTag = argv.auraDockerTag || process.env.N8N_DOCKER_TAG || 'latest';
	const benchmarkTag = argv.benchmarkDockerTag || process.env.BENCHMARK_DOCKER_TAG || 'latest';
	const k6ApiToken = argv.k6ApiToken || process.env.K6_API_TOKEN || undefined;
	const resultWebhookUrl =
		argv.resultWebhookUrl || process.env.BENCHMARK_RESULT_WEBHOOK_URL || undefined;
	const resultWebhookAuthHeader =
		argv.resultWebhookAuthHeader || process.env.BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER || undefined;
	const baseRunDir = argv.runDir || process.env.RUN_DIR || '/aura';
	const auraLicenseCert = argv.auraLicenseCert || process.env.N8N_LICENSE_CERT || undefined;
	const auraLicenseActivationKey = process.env.N8N_LICENSE_ACTIVATION_KEY || undefined;
	const auraLicenseTenantId = argv.auraLicenseTenantId || process.env.N8N_LICENSE_TENANT_ID || '1';
	const envTag = argv.env || 'local';
	const vus = argv.vus;
	const duration = argv.duration;
	const scenarioFilter = argv.scenarioFilter;

	const hasN8nLicense = !!auraLicenseCert || !!auraLicenseActivationKey;
	if (auraSetupToUse === 'scaling-multi-main' && !hasN8nLicense) {
		console.error(
			'aura license is required to run the multi-main scaling setup. Please provide N8N_LICENSE_CERT or N8N_LICENSE_ACTIVATION_KEY (and N8N_LICENSE_TENANT_ID if needed)',
		);
		process.exit(1);
	}

	if (!fs.existsSync(baseRunDir)) {
		console.error(
			`The run directory "${baseRunDir}" does not exist. Please specify a valid directory using --runDir`,
		);
		process.exit(1);
	}

	const runDir = path.join(baseRunDir, auraSetupToUse);
	fs.emptyDirSync(runDir);

	const dockerComposeClient = new DockerComposeClient({
		$: $({
			cwd: composeFilePath,
			verbose: true,
			env: {
				PATH: process.env.PATH,
				N8N_VERSION: auraTag,
				N8N_LICENSE_CERT: auraLicenseCert,
				N8N_LICENSE_ACTIVATION_KEY: auraLicenseActivationKey,
				N8N_LICENSE_TENANT_ID: auraLicenseTenantId,
				N8N_ENCRYPTION_KEY,
				BENCHMARK_VERSION: benchmarkTag,
				K6_API_TOKEN: k6ApiToken,
				BENCHMARK_RESULT_WEBHOOK_URL: resultWebhookUrl,
				BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER: resultWebhookAuthHeader,
				RUN_DIR: runDir,
				MOCK_API_DATA_PATH: paths.mockApiDataPath,
			},
		}),
	});

	// Run the setup script if it exists
	if (fs.existsSync(setupScriptPath)) {
		const setupScript = await import(setupScriptPath);
		await setupScript.setup({ runDir });
	}

	try {
		const runnerServices = await discoverRunnerServices(dockerComposeClient);
		await dockerComposeClient.$('up', '-d', '--remove-orphans', 'aura', ...runnerServices);

		const tags = Object.entries({
			Env: envTag,
			N8nVersion: auraTag,
			N8nSetup: auraSetupToUse,
		})
			.map(([key, value]) => `${key}=${value}`)
			.join(',');

		const cliArgs = flagsObjectToCliArgs({
			scenarioNamePrefix: auraSetupToUse,
			scenarioFilter,
			vus,
			duration,
			tags,
		});

		await dockerComposeClient.$('run', 'benchmark', 'run', ...cliArgs);
	} catch (error) {
		console.error('An error occurred while running the benchmarks:');
		console.error(error.message);
		console.error('');
		await printContainerStatus(dockerComposeClient);
		throw error;
	} finally {
		await dumpLogs(dockerComposeClient);
		await dockerComposeClient.$('down');
	}
}

async function printContainerStatus(dockerComposeClient) {
	console.error('Container statuses:');
	await dockerComposeClient.$('ps', '-a');
}

async function dumpLogs(dockerComposeClient) {
	console.info('Container logs:');
	await dockerComposeClient.$('logs');
}

function printUsage() {
	const availableSetups = getAllN8nSetups();
	console.log('Usage: zx runForN8nSetup.mjs --runDir /path/for/aura/data <aura setup to use>');
	console.log(`   eg: zx runForN8nSetup.mjs --runDir /path/for/aura/data ${availableSetups[0]}`);
	console.log('');
	console.log('Flags:');
	console.log(
		'  --runDir <path>             Directory to share with the aura container for storing data. Default is /aura',
	);
	console.log('  --auraDockerTag <tag>        Docker tag for aura image. Default is latest');
	console.log(
		'  --benchmarkDockerTag <tag>  Docker tag for benchmark cli image. Default is latest',
	);
	console.log('  --k6ApiToken <token>        K6 API token to upload the results');
	console.log('');
	console.log('Available setups:');
	console.log(availableSetups.join(', '));
}

/**
 * @returns {string[]}
 */
function getAllN8nSetups() {
	return fs.readdirSync(paths.auraSetupsDir);
}

function validateN8nSetup(givenSetup) {
	const availableSetups = getAllN8nSetups();
	if (!availableSetups.includes(givenSetup)) {
		printUsage();
		process.exit(1);
	}
}

main();
