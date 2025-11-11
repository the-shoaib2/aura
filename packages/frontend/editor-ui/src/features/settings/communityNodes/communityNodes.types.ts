import type { PublicInstalledPackage } from 'workflow';

export interface CommunityPackageMap {
	[name: string]: PublicInstalledPackage;
}
