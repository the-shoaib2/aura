import {
	randomCredentialPayload,
	randomEmail,
	randomName,
	uniqueId,
} from '@aura/backend-test-utils';
import { CredentialsEntity, Project, User } from '@aura/db';
import { randomInt } from 'workflow';

export const mockCredential = (): CredentialsEntity =>
	Object.assign(new CredentialsEntity(), randomCredentialPayload());

export const mockUser = (): User =>
	Object.assign(new User(), {
		id: randomInt(1000),
		email: randomEmail(),
		firstName: randomName(),
		lastName: randomName(),
	});

export const mockProject = (): Project =>
	Object.assign(new Project(), {
		id: uniqueId(),
		type: 'personal',
		name: 'Nathan Fillion <nathan.fillion@aura.io>',
	});
