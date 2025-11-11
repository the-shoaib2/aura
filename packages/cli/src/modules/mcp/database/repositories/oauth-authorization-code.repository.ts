import { Service } from '@aura/di';
import { DataSource, Repository } from '@aura/typeorm';

import { AuthorizationCode } from '../entities/oauth-authorization-code.entity';

@Service()
export class AuthorizationCodeRepository extends Repository<AuthorizationCode> {
	constructor(dataSource: DataSource) {
		super(AuthorizationCode, dataSource.manager);
	}
}
