import { ApplicationError } from '@aura/errors';

import { CONFIG_MODES } from '../binary-data/utils';

export class InvalidModeError extends ApplicationError {
	constructor() {
		super(`Invalid binary data mode. Valid modes: ${CONFIG_MODES.join(', ')}`);
	}
}
