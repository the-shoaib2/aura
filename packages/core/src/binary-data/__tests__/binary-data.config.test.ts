import { Container } from '@aura/di';

import { InstanceSettings } from '@/instance-settings';
import { mockInstance } from '@test/utils';

import { BinaryDataConfig } from '../binary-data.config';

describe('BinaryDataConfig', () => {
	const auraFolder = '/test/aura';
	const encryptionKey = 'test-encryption-key';
	console.warn = jest.fn().mockImplementation(() => {});

	const now = new Date('2025-01-01T01:23:45.678Z');
	jest.useFakeTimers({ now });

	beforeEach(() => {
		process.env = {};
		jest.resetAllMocks();
		Container.reset();
		mockInstance(InstanceSettings, { encryptionKey, auraFolder });
	});

	it('should use default values when no env variables are defined', () => {
		const config = Container.get(BinaryDataConfig);

		expect(config.availableModes).toEqual(['filesystem']);
		expect(config.mode).toBe('default');
		expect(config.localStoragePath).toBe('/test/aura/binaryData');
	});

	it('should use values from env variables when defined', () => {
		process.env.aura_AVAILABLE_BINARY_DATA_MODES = 'filesystem,s3';
		process.env.aura_DEFAULT_BINARY_DATA_MODE = 's3';
		process.env.aura_BINARY_DATA_STORAGE_PATH = '/custom/storage/path';
		process.env.aura_BINARY_DATA_SIGNING_SECRET = 'super-secret';

		const config = Container.get(BinaryDataConfig);

		expect(config.mode).toEqual('s3');
		expect(config.availableModes).toEqual(['filesystem', 's3']);
		expect(config.localStoragePath).toEqual('/custom/storage/path');
		expect(config.signingSecret).toBe('super-secret');
	});

	it('should derive the signing secret from the encryption-key, when none is passed in', () => {
		const config = Container.get(BinaryDataConfig);

		expect(config.signingSecret).toBe('96eHYcXMF6J1Pn6dhdkOEt6H2BMa6kR5oR0ce7llWyA=');
	});

	it('should fallback to default for mode', () => {
		process.env.aura_DEFAULT_BINARY_DATA_MODE = 'invalid-mode';

		const config = Container.get(BinaryDataConfig);

		expect(config.mode).toEqual('default');
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining('Invalid value for aura_DEFAULT_BINARY_DATA_MODE'),
		);
	});

	it('should fallback to default for available modes', () => {
		process.env.aura_AVAILABLE_BINARY_DATA_MODES = 'filesystem,invalid-mode,s3';

		const config = Container.get(BinaryDataConfig);

		expect(config.availableModes).toEqual(['filesystem']);
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining('Invalid value for aura_AVAILABLE_BINARY_DATA_MODES'),
		);
	});
});
