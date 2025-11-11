import { useNodeTypesStore } from '@/app/stores/nodeTypes.store';
import type { ReloadNodeType } from '@aura/api-types/push/hot-reload';
import { isCommunityPackageName } from 'workflow';

/**
 * Handles the 'reloadNodeType' event from the push connection, which indicates
 * that a node type needs to be reloaded.
 */
export async function reloadNodeType({ data }: ReloadNodeType) {
	const nodeTypesStore = useNodeTypesStore();

	await nodeTypesStore.getNodeTypes();
	const isCommunityNode = isCommunityPackageName(data.name);
	await nodeTypesStore.getFullNodesProperties([data], !isCommunityNode);
}
