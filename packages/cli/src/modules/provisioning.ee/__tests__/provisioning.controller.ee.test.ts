import type { LicenseState } from '@aura/backend-common';
import { mock } from 'jest-mock-extended';

import { ProvisioningController } from '../provisioning.controller.ee';
import { type ProvisioningService } from '@/modules/provisioning.ee/provisioning.service.ee';
import { type Response } from 'express';
import { type AuthenticatedRequest } from '@aura/db';
import { type ProvisioningConfigDto } from '@aura/api-types';

const provisioningService = mock<ProvisioningService>();
const licenseState = mock<LicenseState>();

const controller = new ProvisioningController(provisioningService, licenseState);

describe('ProvisioningController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getConfig', () => {
		const req = mock<AuthenticatedRequest>();
		const res = mock<Response>({
			json: jest.fn().mockReturnThis(),
			status: jest.fn().mockReturnThis(),
		});

		it('should return 403 if provisioning is not licensed', async () => {
			licenseState.isProvisioningLicensed.mockReturnValue(false);
			await controller.getConfig(req, res);

			expect(res.status).toHaveBeenCalledWith(403);
		});

		it('should return the provisioning config', async () => {
			const configResponse: ProvisioningConfigDto = {
				scopesProvisionInstanceRole: true,
				scopesProvisionProjectRoles: true,
				scopesName: 'aura_test_scope',
				scopesInstanceRoleClaimName: 'aura_test_instance_role',
				scopesProjectsRolesClaimName: 'aura_test_projects_roles',
			};

			licenseState.isProvisioningLicensed.mockReturnValue(true);
			provisioningService.getConfig.mockResolvedValue(configResponse);

			const config = await controller.getConfig(req, res);

			expect(config).toEqual(configResponse);
		});
	});

	describe('patchConfig', () => {
		const req = mock<AuthenticatedRequest>();
		const res = mock<Response>({
			json: jest.fn().mockReturnThis(),
			status: jest.fn().mockReturnThis(),
		});

		it('should return 403 if provisioning is not licensed', async () => {
			licenseState.isProvisioningLicensed.mockReturnValue(false);
			await controller.patchConfig(req, res);

			expect(res.status).toHaveBeenCalledWith(403);
		});

		it('should patch the provisioning config', async () => {
			const configResponse: ProvisioningConfigDto = {
				scopesProvisionInstanceRole: false,
				scopesProvisionProjectRoles: false,
				scopesName: 'aura_test_scope',
				scopesInstanceRoleClaimName: 'aura_test_instance_role',
				scopesProjectsRolesClaimName: 'aura_test_projects_roles',
			};

			licenseState.isProvisioningLicensed.mockReturnValue(true);
			provisioningService.patchConfig.mockResolvedValue(configResponse);

			const config = await controller.patchConfig(req, res);

			expect(config).toEqual(configResponse);
		});
	});
});
