import type { Project } from '@aura/db';
import { generateNanoId, VariablesRepository } from '@aura/db';
import { Container } from '@aura/di';
import { randomString } from 'workflow';

import { VariablesService } from '@/environments.ee/variables/variables.service.ee';

export async function createVariable(key = randomString(5), value = randomString(5)) {
	const result = await Container.get(VariablesRepository).save({
		id: generateNanoId(),
		key,
		value,
	});
	await Container.get(VariablesService).updateCache();
	return result;
}

export async function createProjectVariable(
	key = randomString(5),
	value = randomString(5),
	project: Project,
) {
	const result = await Container.get(VariablesRepository).save({
		id: generateNanoId(),
		key,
		value,
		project,
	});

	await Container.get(VariablesService).updateCache();
	return result;
}

export async function getVariableByIdOrFail(id: string) {
	return await Container.get(VariablesRepository).findOneOrFail({
		where: { id },
		relations: ['project'],
	});
}

export async function getVariableByKey(key: string) {
	return await Container.get(VariablesRepository).findOne({
		where: {
			key,
		},
	});
}

export async function getVariableById(id: string) {
	return await Container.get(VariablesRepository).findOne({
		where: {
			id,
		},
	});
}
