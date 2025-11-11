import type { WorkflowDeactivated } from '@aura/api-types/push/workflow';
import { useWorkflowsStore } from '@/app/stores/workflows.store';

export async function workflowDeactivated({ data }: WorkflowDeactivated) {
	const workflowsStore = useWorkflowsStore();

	workflowsStore.setWorkflowInactive(data.workflowId);
}
