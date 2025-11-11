import { assignableProjectRoleSchema } from '@aura/permissions';
import { Z } from 'zod-class';

export class ChangeUserRoleInProject extends Z.class({
	role: assignableProjectRoleSchema,
}) {}
