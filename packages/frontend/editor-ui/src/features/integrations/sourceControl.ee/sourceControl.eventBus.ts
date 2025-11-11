import { createEventBus } from '@aura/utils/event-bus';

export interface SourceControlEventBusEvents {
	/** Event when latest changes were pulled from the source control */
	pull: never;
}

export const sourceControlEventBus = createEventBus<SourceControlEventBusEvents>();
