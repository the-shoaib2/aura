import type { BannerName } from '@aura/api-types';
import type { Role } from '@aura/api-types/dist/schemas/user.schema';

import { get } from '../utils';

export type DynamicBanner = {
	id: BannerName;
	content: string;
	isDismissible: boolean;
	dismissPermanently: boolean | null;
	theme: 'info' | 'warning' | 'danger';
	priority: number;
};

type DynamicBannerFilters = {
	version: string;
	deploymentType: string;
	planName?: string;
	instanceId: string;
	userCreatedAt?: string;
	isOwner?: boolean;
	role?: Role;
};

export async function getDynamicBanners(
	endpoint: string,
	filters: DynamicBannerFilters,
): Promise<DynamicBanner[]> {
	return await get(endpoint, '', filters);
}
