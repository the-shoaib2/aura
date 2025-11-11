import type { ModuleInterface } from '@aura/decorators';
import { BackendModule } from '@aura/decorators';

@BackendModule({ name: 'provisioning', licenseFlag: ['feat:oidc', 'feat:saml', 'feat:ldap'] })
export class ProvisioningModule implements ModuleInterface {
	async init() {
		await import('./provisioning.controller.ee');
	}
}
