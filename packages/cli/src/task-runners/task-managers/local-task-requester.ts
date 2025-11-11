import { Container, Service } from '@aura/di';
import type { RequesterMessage } from '@aura/task-runner';

import { EventService } from '@/events/event.service';
import { NodeTypes } from '@/node-types';
import type { RequesterMessageCallback } from '@/task-runners/task-broker/task-broker.service';
import { TaskBroker } from '@/task-runners/task-broker/task-broker.service';

import { TaskRequester } from './task-requester';

@Service()
export class LocalTaskRequester extends TaskRequester {
	taskBroker: TaskBroker;

	id = 'local-task-requester';

	constructor(nodeTypes: NodeTypes, eventService: EventService) {
		super(nodeTypes, eventService);
		this.registerRequester();
	}

	registerRequester() {
		this.taskBroker = Container.get(TaskBroker);

		this.taskBroker.registerRequester(
			this.id,
			this.onMessage.bind(this) as RequesterMessageCallback,
		);
	}

	sendMessage(message: RequesterMessage.ToBroker.All) {
		void this.taskBroker.onRequesterMessage(this.id, message);
	}
}
