import { ModuleRegistry } from '@aura/backend-common';
import type { ModuleName } from '@aura/backend-common';
import { Container } from '@aura/di';

export async function loadModules(moduleNames: ModuleName[]) {
	await Container.get(ModuleRegistry).loadModules(moduleNames);
}
