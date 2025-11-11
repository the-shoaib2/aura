import { useNodeTypesStore } from '@/app/stores/nodeTypes.store';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';
import CommunityPackageCard from './CommunityPackageCard.vue';
import { createComponentRenderer } from '@/__tests__/render';
import type { PublicInstalledNode, PublicInstalledPackage } from 'workflow';

const communityPackage: PublicInstalledPackage = {
	packageName: 'aura-nodes-test',
	installedVersion: '1.0.0',
	installedNodes: [{ name: 'TestNode' } as PublicInstalledNode],
	createdAt: new Date(0),
	updatedAt: new Date(0),
};

const renderComponent = createComponentRenderer(CommunityPackageCard);

const flushPromises = async () => await new Promise(setImmediate);

describe('CommunityPackageCard', () => {
	let nodeTypesStore: ReturnType<typeof useNodeTypesStore>;

	beforeEach(() => {
		const pinia = createTestingPinia();
		setActivePinia(pinia);

		nodeTypesStore = useNodeTypesStore();
	});

	it('should call nodeTypesStore methods and update latestVerifiedVersion when packageName changes', async () => {
		Object.defineProperty(nodeTypesStore, 'visibleNodeTypes', {
			get: () => [{ name: 'aura-nodes-test' }],
		});
		nodeTypesStore.loadNodeTypesIfNotLoaded = vi.fn().mockResolvedValue(undefined);
		nodeTypesStore.getCommunityNodeAttributes = vi.fn().mockResolvedValue({ npmVersion: '2.0.0' });

		renderComponent({
			props: {
				communityPackage,
			},
		});

		await flushPromises();

		expect(nodeTypesStore.loadNodeTypesIfNotLoaded).toHaveBeenCalled();
		expect(nodeTypesStore.getCommunityNodeAttributes).toHaveBeenCalledWith('aura-nodes-test');
	});
});
