import type { Scope as ScopeType } from '@aura/permissions';
import { Column, Entity, PrimaryColumn } from '@aura/typeorm';

@Entity({
	name: 'scope',
})
export class Scope {
	@PrimaryColumn({
		type: String,
		name: 'slug',
	})
	slug: ScopeType;

	@Column({
		type: String,
		nullable: true,
		name: 'displayName',
	})
	displayName: string | null;

	@Column({
		type: String,
		nullable: true,
		name: 'description',
	})
	description: string | null;
}
