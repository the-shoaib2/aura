import { Service } from '@aura/di';
import { DataSource, Repository } from '@aura/typeorm';

import { RefreshToken } from '../entities/oauth-refresh-token.entity';

@Service()
export class RefreshTokenRepository extends Repository<RefreshToken> {
	constructor(dataSource: DataSource) {
		super(RefreshToken, dataSource.manager);
	}
}
