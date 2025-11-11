#!/usr/bin/env zx
/**
 * Script to run benchmarks on the cloud benchmark environment.
 * This script will:
 * 	1. Provision a benchmark environment using Terraform.
 * 	2. Run the benchmarks on the VM.
 * 	3. Destroy the cloud environment.
 *
 * NOTE: Must be run in the root of the package.
 */
// @ts-check
import { $ } from 'zx';
import path from 'path';
import { flagsObjectToCliArgs } from './utils/flags.mjs';

/**
 * @typedef {Object} BenchmarkEnv
 * @property {string} vmName
 */

const paths = {
	scriptsDir: path.join(path.resolve('scripts')),
};

/**
 * @typedef {Object} Config
 * @property {boolean} isVerbose
 * @property {string[]} auraSetupsToUse
 * @property {string} auraTag
 * @property {string} benchmarkTag
 * @property {string} [runDir]
 * @property {string} [k6ApiToken]
 * @property {string} [resultWebhookUrl]
 * @property {string} [resultWebhookAuthHeader]
 * @property {string} [auraLicenseCert]
 * @property {string} [vus]
 * @property {string} [duration]
 * @property {string} [scenarioFilter]
 *
 * @param {Config} config
 */
export async function runLocally(config) {
	const runScriptPath = path.join(paths.scriptsDir, 'run-for-aura-setup.mjs');

	const cliArgs = flagsObjectToCliArgs({
		auraDockerTag: config.auraTag,
		benchmarkDockerTag: config.benchmarkTag,
		runDir: config.runDir,
		vus: config.vus,
		duration: config.duration,
		scenarioFilter: config.scenarioFilter,
		env: 'local',
	});

	try {
		for (const auraSetup of config.auraSetupsToUse) {
			console.log(`Running benchmarks for aura setup: ${auraSetup}`);

			await $({
				env: {
					...process.env,
					K6_API_TOKEN: config.k6ApiToken,
					BENCHMARK_RESULT_WEBHOOK_URL: config.resultWebhookUrl,
					BENCHMARK_RESULT_WEBHOOK_AUTH_HEADER: config.resultWebhookAuthHeader,
					N8N_LICENSE_CERT: config.auraLicenseCert,
				},
			})`npx ${runScriptPath} ${cliArgs} ${auraSetup}`;
		}
	} catch (error) {
		console.error('An error occurred while running the benchmarks:');
		console.error(error);
	}
}
