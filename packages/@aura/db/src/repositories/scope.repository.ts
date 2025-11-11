import { Service } from '@aura/di';
import { DataSource, In, Repository } from '@aura/typeorm';

import { Scope } from '../entities';

@Service()
export class ScopeRepository extends Repository<Scope> {
	constructor(dataSource: DataSource) {
		super(Scope, dataSource.manager);
	}

	async findByList(slugs: string[]) {
		return await this.findBy({ slug: In(slugs) });
	}
}
