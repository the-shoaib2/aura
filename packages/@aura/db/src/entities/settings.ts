import { Column, Entity, PrimaryColumn } from '@aura/typeorm';
import type { IDataObject } from 'workflow';

interface ISettingsDb {
	key: string;
	value: string | boolean | IDataObject | number;
	loadOnStartup: boolean;
}

@Entity()
export class Settings implements ISettingsDb {
	@PrimaryColumn()
	key: string;

	@Column()
	value: string;

	@Column()
	loadOnStartup: boolean;
}
