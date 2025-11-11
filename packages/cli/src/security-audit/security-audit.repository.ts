import { Service } from '@aura/di';
// eslint-disable-next-line aura-local-rules/misplaced-aura-typeorm-import
import { DataSource, Repository } from '@aura/typeorm';

import { InstalledPackages } from '@/modules/community-packages/installed-packages.entity';

@Service()
export class PackagesRepository extends Repository<InstalledPackages> {
	constructor(dataSource: DataSource) {
		super(InstalledPackages, dataSource.manager);
	}
}
