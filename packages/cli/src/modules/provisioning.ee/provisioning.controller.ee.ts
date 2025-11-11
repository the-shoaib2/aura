import { AuthenticatedRequest } from '@aura/db';
import { Get, GlobalScope, Patch, RestController } from '@aura/decorators';
import { LicenseState } from '@aura/backend-common';
import { ProvisioningService } from './provisioning.service.ee';
import { Response } from 'express';

@RestController('/sso/provisioning')
export class ProvisioningController {
	constructor(
		private readonly provisioningService: ProvisioningService,
		private readonly licenseState: LicenseState,
	) {}

	@Get('/config')
	@GlobalScope('provisioning:manage')
	async getConfig(_req: AuthenticatedRequest, res: Response) {
		if (!this.licenseState.isProvisioningLicensed()) {
			return res.status(403).json({ message: 'Provisioning is not licensed' });
		}

		return await this.provisioningService.getConfig();
	}

	@Patch('/config')
	@GlobalScope('provisioning:manage')
	async patchConfig(req: AuthenticatedRequest, res: Response) {
		if (!this.licenseState.isProvisioningLicensed()) {
			return res.status(403).json({ message: 'Provisioning is not licensed' });
		}

		return await this.provisioningService.patchConfig(req.body);
	}
}
