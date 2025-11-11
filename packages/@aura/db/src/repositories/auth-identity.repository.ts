import { Service } from '@aura/di';
import { DataSource, Repository } from '@aura/typeorm';

import { AuthIdentity } from '../entities';

@Service()
export class AuthIdentityRepository extends Repository<AuthIdentity> {
	constructor(dataSource: DataSource) {
		super(AuthIdentity, dataSource.manager);
	}
}
