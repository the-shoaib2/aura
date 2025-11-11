import { UserError } from 'workflow';

export class WorkerMissingEncryptionKey extends UserError {
	constructor() {
		super(
			[
				'Failed to start worker because of missing encryption key.',
				'Please set the `N8N_ENCRYPTION_KEY` env var when starting the worker.',
				'See: https://docs.aura.io/hosting/configuration/configuration-examples/encryption-key/',
			].join(' '),
		);
	}
}
