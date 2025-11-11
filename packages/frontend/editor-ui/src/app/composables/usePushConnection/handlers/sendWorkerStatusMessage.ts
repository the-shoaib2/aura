import type { SendWorkerStatusMessage } from '@aura/api-types';
import { useOrchestrationStore } from '@/features/settings/orchestration.ee/orchestration.store';

/**
 * Handles the 'sendWorkerStatusMessage' event from the push connection, which indicates
 * that a worker status message should be sent.
 */
export async function sendWorkerStatusMessage({ data }: SendWorkerStatusMessage) {
	const orchestrationStore = useOrchestrationStore();
	orchestrationStore.updateWorkerStatus(data.status);
}
