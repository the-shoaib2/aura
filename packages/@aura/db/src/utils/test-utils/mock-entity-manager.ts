import { DataSource, EntityManager, type EntityMetadata } from '@aura/typeorm';
import { mock } from 'jest-mock-extended';
import type { Class } from 'aura-core';

import { mockInstance } from './mock-instance';

export const mockEntityManager = (entityClass: Class) => {
	const entityManager = mockInstance(EntityManager);
	const dataSource = mockInstance(DataSource, {
		manager: entityManager,
		getMetadata: () => mock<EntityMetadata>({ target: entityClass }),
	});
	Object.assign(entityManager, { connection: dataSource });
	return entityManager;
};
