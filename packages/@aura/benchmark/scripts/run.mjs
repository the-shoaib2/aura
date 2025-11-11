#!/usr/bin/env zx
/**
 * Script to run benchmarks either on the cloud benchmark environment or locally.
 * The cloud environment needs to be provisioned using Terraform before running the benchmarks.
 *
 * NOTE: Must be run in the root of the package.
 */
// @ts-check
import fs from 'fs';
import minimist from 'minimist';
import path from 'path';
import { runInCloud } from './run-in-cloud.mjs';
import { runLocally } from './run-locally.mjs';

const paths = {
	auraSetupsDir: path.join(path.resolve('scripts'), 'aura-setups'),
};

async function main() {
	const config = await parseAndValidateConfig();

	const auraSetupsToUse =
		config.auraSetupToUse === 'all' ? readAvailableN8nSetups() : [config.auraSetupToUse];

	console.log('Using aura tag', config.auraTag);
	console.log('Using benchmark cli tag', config.benchmarkTag);
	console.log('Using environment', config.env);
	console.log('Using aura setups', auraSetupsToUse.join(', '));
	console.log('');

	if (config.env === 'cloud') {
		await runInCloud({
			benchmarkTag: config.benchmarkTag,
			isVerbose: config.isVerbose,
			k6ApiToken: config.k6ApiToken,
			resultWebhookUrl: config.resultWebhookUrl,
			resultWebhookAuthHeader: config.resultWebhookAuthHeader,
			auraLicenseCert: config.auraLicenseCert,
			auraTag: config.auraTag,
			auraSetupsToUse,
			vus: config.vus,
			duration: config.duration,
			scenarioFilter: config.scenarioFilter,
		});
	} else if (config.env === 'local') {
		await runLocally({
			benchmarkTag: config.benchmarkTag,
			isVerbose: config.isVerbose,
			k6ApiToken: config.k6ApiToken,
			resultWebhookUrl: config.resultWebhookUrl,
			resultWebhookAuthHeader: config.resultWebhookAuthHeader,
			auraLicenseCert: config.auraLicenseCert,
			auraTag: config.auraTag,
			runDir: config.runDir,
			auraSetupsToUse,
			vus: config.vus,
			duration: config.duration,
			scenarioFilter: config.scenarioFilter,
		});
	} else {
		console.error('Invalid env:', config.env);
		printUsage();
		process.exit(1);
	}
}

function readAvailableN8nSetups() {
	const setups = fs.readdirSync(paths.auraSetupsDir);

	return setups;
}

/**
 * @typedef {Object} Config
 * @property {boolean} isVerbose
 * @property {'cloud' | 'local'} env
 * @property {string} auraSetupToUse
 * @property {string} auraTag
 * @property {string} benchmarkTag
 * @property {string} [k6ApiToken]
 * @property {string} [resultWebhookUrl]
 * @property {string} [resultWebhookAuthHeader]
 * @property {string} [auraLicenseCert]
 * @property {string} [runDir]
 * @property {string} [vus]
 * @property {string} [duration]
 * @property {string} [scenarioFilter]
 *
 * @returns {Promise<Config>}
 */
async function parseAndValidateConfig() {
	const args = minimist(process.argv.slice(3), {
		boolean: ['debug', 'help'],
	});

	if (args.help) {
		printUsage();
		process.exit(0);
	}

	const auraSetupToUse = await getAndValidateN8nSetup(args);
	const isVerbose = args.debug || false;
	const auraTag = args.auraTag || process.env.N8N_DOCKER_TAG || 'latest';
	const benchmarkTag = args.benchmarkTag || process.env.BENCHMARK_DOCKER_TAG || 'latest';
	const k6ApiToken = args.k6ApiToken || process.env.K6_API_TOKEN || undefined;
	const resultWebhookUrl =
		args.resultWebhookUrl || process.env.BENCHMARK_RESULT_WEBHOOK_URL || undefined;
	const resultWebhookAuthHeader =
		args.resultWebhookAuthHeader || process.env.BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER || undefined;
	const auraLicenseCert = args.auraLicenseCert || process.env.N8N_LICENSE_CERT || undefined;
	const runDir = args.runDir || undefined;
	const env = args.env || 'local';
	const vus = args.vus;
	const duration = args.duration;
	const scenarioFilter = args.scenarioFilter;

	if (!env) {
		printUsage();
		process.exit(1);
	}

	return {
		isVerbose,
		env,
		auraSetupToUse,
		auraTag,
		benchmarkTag,
		k6ApiToken,
		resultWebhookUrl,
		resultWebhookAuthHeader,
		auraLicenseCert,
		runDir,
		vus,
		duration,
		scenarioFilter,
	};
}

/**
 * @param {minimist.ParsedArgs} args
 */
async function getAndValidateN8nSetup(args) {
	// Last parameter is the aura setup to use
	const auraSetupToUse = args._[args._.length - 1];
	if (!auraSetupToUse || auraSetupToUse === 'all') {
		return 'all';
	}

	const availableSetups = readAvailableN8nSetups();

	if (!availableSetups.includes(auraSetupToUse)) {
		printUsage();
		process.exit(1);
	}

	return auraSetupToUse;
}

function printUsage() {
	const availableSetups = readAvailableN8nSetups();

	console.log(`Usage: zx scripts/${path.basename(__filename)} [aura setup name]`);
	console.log(`   eg: zx scripts/${path.basename(__filename)}`);
	console.log('');
	console.log('Options:');
	console.log(
		`  [aura setup name]     Against which aura setup to run the benchmarks. One of: ${['all', ...availableSetups].join(', ')}. Default is all`,
	);
	console.log(
		'  --env                Env where to run the benchmarks. Either cloud or local. Default is local.',
	);
	console.log('  --debug              Enable verbose output');
	console.log('  --auraTag             Docker tag for aura image. Default is latest');
	console.log('  --benchmarkTag       Docker tag for benchmark cli image. Default is latest');
	console.log('  --scenarioFilter     Filter scenarios by name (case-insensitive)');
	console.log('  --vus                How many concurrent requests to make');
	console.log('  --duration           Test duration, e.g. 1m or 30s');
	console.log(
		'  --k6ApiToken         API token for k6 cloud. Default is read from K6_API_TOKEN env var. If omitted, k6 cloud will not be used',
	);
	console.log(
		'  --runDir         Directory to share with the aura container for storing data. Needed only for local runs.',
	);
	console.log('');
}

main().catch((error) => {
	console.error('An error occurred while running the benchmarks:');
	console.error(error);

	process.exit(1);
});
