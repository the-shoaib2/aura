import { Service } from '@aura/di';
import { DataSource, Repository } from '@aura/typeorm';

import { Settings } from '../entities';

@Service()
export class SettingsRepository extends Repository<Settings> {
	constructor(dataSource: DataSource) {
		super(Settings, dataSource.manager);
	}

	async findByKey(key: string): Promise<Settings | null> {
		return await this.findOneBy({ key });
	}
}
