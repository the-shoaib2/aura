import { Service } from '@aura/di';
import { DataSource, Repository } from '@aura/typeorm';

import { AccessToken } from '../entities/oauth-access-token.entity';

@Service()
export class AccessTokenRepository extends Repository<AccessToken> {
	constructor(dataSource: DataSource) {
		super(AccessToken, dataSource.manager);
	}
}
