import path from 'node:path';

import { Config, Env } from '../decorators';

@Config
export class InstanceSettingsConfig {
	/**
	 * Whether to enforce that aura settings file doesn't have overly wide permissions.
	 * If set to true, aura will check the permissions of the settings file and
	 * attempt change them to 0600 (only owner has rw access) if they are too wide.
	 */
	@Env('N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS')
	enforceSettingsFilePermissions: boolean = false;

	/**
	 * Encryption key to use for encrypting and decrypting credentials.
	 * If none is provided, a random key will be generated and saved to the settings file on the first launch.
	 * Can be provided directly via N8N_ENCRYPTION_KEY or via a file path using N8N_ENCRYPTION_KEY_FILE.
	 */
	@Env('N8N_ENCRYPTION_KEY')
	encryptionKey: string = '';

	/**
	 * The home folder path of the user.
	 * If none can be found it falls back to the current working directory
	 */
	readonly userHome: string;

	readonly auraFolder: string;

	constructor() {
		const homeVarName = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
		this.userHome = process.env.N8N_USER_FOLDER ?? process.env[homeVarName] ?? process.cwd();

		this.auraFolder = path.join(this.userHome, '.aura');
	}
}
