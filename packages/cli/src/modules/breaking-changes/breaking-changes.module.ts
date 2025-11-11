import type { ModuleInterface } from '@aura/decorators';
import { BackendModule } from '@aura/decorators';

@BackendModule({ name: 'breaking-changes' })
export class BreakingChangesModule implements ModuleInterface {
	async init() {
		await import('./breaking-changes.controller');
	}
}
