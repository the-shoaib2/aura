import { Service } from '@aura/di';
import { DataSource, Repository } from '@aura/typeorm';

import { OAuthClient } from '../entities/oauth-client.entity';

@Service()
export class OAuthClientRepository extends Repository<OAuthClient> {
	constructor(dataSource: DataSource) {
		super(OAuthClient, dataSource.manager);
	}
}
