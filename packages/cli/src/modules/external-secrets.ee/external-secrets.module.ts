import type { ModuleInterface } from '@aura/decorators';
import { BackendModule, OnShutdown } from '@aura/decorators';
import { Container } from '@aura/di';

@BackendModule({ name: 'external-secrets', licenseFlag: 'feat:externalSecrets' })
export class ExternalSecretsModule implements ModuleInterface {
	async init() {
		await import('./external-secrets.controller.ee');

		const { ExternalSecretsManager } = await import('./external-secrets-manager.ee');
		const { ExternalSecretsProxy } = await import('aura-core');

		const externalSecretsManager = Container.get(ExternalSecretsManager);
		const externalSecretsProxy = Container.get(ExternalSecretsProxy);

		await externalSecretsManager.init();
		externalSecretsProxy.setManager(externalSecretsManager);
	}

	@OnShutdown()
	async shutdown() {
		const { ExternalSecretsManager } = await import('./external-secrets-manager.ee');

		Container.get(ExternalSecretsManager).shutdown();
	}
}
