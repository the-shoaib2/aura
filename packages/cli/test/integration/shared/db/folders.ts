import { randomName } from '@aura/backend-test-utils';
import type { Folder, Project, TagEntity } from '@aura/db';
import { FolderRepository } from '@aura/db';
import { Container } from '@aura/di';

export const createFolder = async (
	project: Project,
	options: {
		name?: string;
		parentFolder?: Folder;
		tags?: TagEntity[];
		updatedAt?: Date;
		createdAt?: Date;
	} = {},
) => {
	const folderRepository = Container.get(FolderRepository);
	const folder = await folderRepository.save(
		folderRepository.create({
			name: options.name ?? randomName(),
			homeProject: project,
			parentFolder: options.parentFolder ?? null,
			tags: options.tags ?? [],
			updatedAt: options.updatedAt ?? new Date(),
			createdAt: options.updatedAt ?? new Date(),
		}),
	);

	return folder;
};
