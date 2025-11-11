import { Logger } from '@aura/backend-common';
import { PubSubEventName, PubSubMetadata } from '@aura/decorators';
import { Container, Service } from '@aura/di';
import { InstanceSettings } from 'aura-core';

import { PubSubEventBus } from './pubsub.eventbus';

@Service()
export class PubSubRegistry {
	constructor(
		private readonly logger: Logger,
		private readonly instanceSettings: InstanceSettings,
		private readonly pubSubMetadata: PubSubMetadata,
		private readonly pubsubEventBus: PubSubEventBus,
	) {
		this.logger = this.logger.scoped('pubsub');
	}

	private eventHandlers: Array<{
		eventName: PubSubEventName;
		handler: Parameters<PubSubEventBus['on']>[1];
	}> = [];

	init() {
		const { instanceSettings, pubSubMetadata } = this;
		// We clear the event handlers before registering new ones
		for (const { eventName, handler } of this.eventHandlers) {
			this.pubsubEventBus.off(eventName, handler);
		}
		this.eventHandlers = [];

		// Register all event handlers that match the current instance type and role
		const handlers = pubSubMetadata.getHandlers();
		for (const { eventHandlerClass, methodName, eventName, filter } of handlers) {
			const handlerClass = Container.get(eventHandlerClass);
			if (!filter?.instanceType || filter.instanceType === instanceSettings.instanceType) {
				this.logger.debug(
					`Registered a "${eventName}" event handler on ${eventHandlerClass.name}#${methodName}`,
				);
				const eventHandler = async (...args: unknown[]) => {
					// Since the instance role can change, this check needs to be in the event listener
					const shouldTrigger =
						filter?.instanceType !== 'main' ||
						!filter.instanceRole ||
						filter.instanceRole === instanceSettings.instanceRole;
					if (shouldTrigger) await handlerClass[methodName].call(handlerClass, ...args);
				};
				this.pubsubEventBus.on(eventName, eventHandler);
				this.eventHandlers.push({ eventName, handler: eventHandler });
			}
		}
	}
}
