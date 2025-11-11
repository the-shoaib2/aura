import { Service } from '@aura/di';
import { DataSource, Repository } from '@aura/typeorm';

import { ApiKey } from '../entities';

@Service()
export class ApiKeyRepository extends Repository<ApiKey> {
	constructor(dataSource: DataSource) {
		super(ApiKey, dataSource.manager);
	}
}
