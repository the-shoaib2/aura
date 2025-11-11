import type { User } from '@aura/db';
import { hasGlobalScope } from '@aura/permissions';

export class SourceControlContext {
	constructor(private readonly userInternal: User) {}

	get user() {
		return this.userInternal;
	}

	hasAccessToAllProjects() {
		return hasGlobalScope(this.userInternal, 'project:update');
	}
}
