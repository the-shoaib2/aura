import { mockInstance, mockLogger } from '@aura/backend-test-utils';
import { ExecutionsConfig } from '@aura/config';
import type { Redis as SingleNodeClient } from 'ioredis';
import { mock } from 'jest-mock-extended';
import type { InstanceSettings } from 'aura-core';

import type { RedisClientService } from '@/services/redis-client.service';

import { Publisher } from '../publisher.service';
import type { PubSub } from '../pubsub.types';

describe('Publisher', () => {
	const client = mock<SingleNodeClient>();
	const logger = mockLogger();
	const hostId = 'main-bnxa1riryKUNHtln';
	const instanceSettings = mock<InstanceSettings>({ hostId });
	const redisClientService = mock<RedisClientService>({ createClient: () => client });
	const executionsConfig = mockInstance(ExecutionsConfig, { mode: 'queue' });

	describe('constructor', () => {
		it('should init Redis client in scaling mode', () => {
			const publisher = new Publisher(
				logger,
				redisClientService,
				instanceSettings,
				executionsConfig,
			);

			expect(publisher.getClient()).toEqual(client);
		});

		it('should not init Redis client in regular mode', () => {
			const regularModeConfig = mockInstance(ExecutionsConfig, { mode: 'regular' });
			const publisher = new Publisher(
				logger,
				redisClientService,
				instanceSettings,
				regularModeConfig,
			);

			expect(publisher.getClient()).toBeUndefined();
		});
	});

	describe('shutdown', () => {
		it('should disconnect Redis client', () => {
			const publisher = new Publisher(
				logger,
				redisClientService,
				instanceSettings,
				executionsConfig,
			);
			publisher.shutdown();
			expect(client.disconnect).toHaveBeenCalled();
		});
	});

	describe('publishCommand', () => {
		it('should do nothing if not in scaling mode', async () => {
			const regularModeConfig = mockInstance(ExecutionsConfig, { mode: 'regular' });
			const publisher = new Publisher(
				logger,
				redisClientService,
				instanceSettings,
				regularModeConfig,
			);
			const msg = mock<PubSub.Command>({ command: 'reload-license' });

			await publisher.publishCommand(msg);

			expect(client.publish).not.toHaveBeenCalled();
		});

		it('should publish command into `aura.commands` pubsub channel', async () => {
			const publisher = new Publisher(
				logger,
				redisClientService,
				instanceSettings,
				executionsConfig,
			);
			const msg = mock<PubSub.Command>({ command: 'reload-license' });

			await publisher.publishCommand(msg);

			expect(client.publish).toHaveBeenCalledWith(
				'aura.commands',
				JSON.stringify({ ...msg, senderId: hostId, selfSend: false, debounce: true }),
			);
		});

		it('should not debounce `add-webhooks-triggers-and-pollers`', async () => {
			const publisher = new Publisher(
				logger,
				redisClientService,
				instanceSettings,
				executionsConfig,
			);
			const msg = mock<PubSub.Command>({ command: 'add-webhooks-triggers-and-pollers' });

			await publisher.publishCommand(msg);

			expect(client.publish).toHaveBeenCalledWith(
				'aura.commands',
				JSON.stringify({
					...msg,
					_isMockObject: true,
					senderId: hostId,
					selfSend: true,
					debounce: false,
				}),
			);
		});

		it('should not debounce `remove-triggers-and-pollers`', async () => {
			const publisher = new Publisher(
				logger,
				redisClientService,
				instanceSettings,
				executionsConfig,
			);
			const msg = mock<PubSub.Command>({ command: 'remove-triggers-and-pollers' });

			await publisher.publishCommand(msg);

			expect(client.publish).toHaveBeenCalledWith(
				'aura.commands',
				JSON.stringify({
					...msg,
					_isMockObject: true,
					senderId: hostId,
					selfSend: true,
					debounce: false,
				}),
			);
		});
	});

	describe('publishWorkerResponse', () => {
		it('should publish worker response into `aura.worker-response` pubsub channel', async () => {
			const publisher = new Publisher(
				logger,
				redisClientService,
				instanceSettings,
				executionsConfig,
			);
			const msg = mock<PubSub.WorkerResponse>({
				response: 'response-to-get-worker-status',
			});

			await publisher.publishWorkerResponse(msg);

			expect(client.publish).toHaveBeenCalledWith('aura.worker-response', JSON.stringify(msg));
		});
	});
});
