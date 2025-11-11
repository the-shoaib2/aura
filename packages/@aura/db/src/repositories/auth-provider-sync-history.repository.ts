import { Service } from '@aura/di';
import { DataSource, Repository } from '@aura/typeorm';

import { AuthProviderSyncHistory } from '../entities';

@Service()
export class AuthProviderSyncHistoryRepository extends Repository<AuthProviderSyncHistory> {
	constructor(dataSource: DataSource) {
		super(AuthProviderSyncHistory, dataSource.manager);
	}
}
