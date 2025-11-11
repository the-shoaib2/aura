import { detectPackageManagerFromUserAgent } from '../../utils/package-manager';

export const createIntro = () => {
	const maybePackageManager = detectPackageManagerFromUserAgent();
	const packageManager = maybePackageManager ?? 'npm';
	return maybePackageManager ? ` ${packageManager} create @aura/node ` : ' aura-node new ';
};
