import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from '@aura/typeorm';

import { ExecutionEntity } from './execution-entity';

@Entity()
export class ExecutionMetadata {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne('ExecutionEntity', 'metadata', {
		onDelete: 'CASCADE',
	})
	execution: ExecutionEntity;

	@Column()
	executionId: string;

	@Column('text')
	key: string;

	@Column('text')
	value: string;
}
