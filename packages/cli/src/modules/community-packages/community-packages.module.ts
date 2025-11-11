import type { EntityClass, ModuleInterface } from '@aura/decorators';
import { BackendModule } from '@aura/decorators';
import { Container } from '@aura/di';
import { InstanceSettings } from 'aura-core';
import path from 'node:path';

@BackendModule({ name: 'community-packages' })
export class CommunityPackagesModule implements ModuleInterface {
	async init() {
		await import('./community-packages.controller');
		await import('./community-node-types.controller');
	}

	async entities() {
		const { InstalledNodes } = await import('./installed-nodes.entity');
		const { InstalledPackages } = await import('./installed-packages.entity');

		return [InstalledNodes, InstalledPackages] as EntityClass[];
	}

	async settings() {
		const { CommunityPackagesConfig } = await import('./community-packages.config');

		return {
			communityNodesEnabled: Container.get(CommunityPackagesConfig).enabled,
			unverifiedCommunityNodesEnabled: Container.get(CommunityPackagesConfig).unverifiedEnabled,
		};
	}

	async loadDir() {
		const { CommunityPackagesConfig } = await import('./community-packages.config');

		const { preventLoading } = Container.get(CommunityPackagesConfig);

		if (preventLoading) return null;

		return path.join(Container.get(InstanceSettings).nodesDownloadDir, 'node_modules');
	}
}
