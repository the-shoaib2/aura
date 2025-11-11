export type TLicenseBlock = string;

export type TEntitlement = {
	id?: string;
	productId: string;
	productMetadata?: Record<string, unknown>;
	features?: Record<string, unknown>;
	featureOverrides?: Record<string, unknown>;
	validFrom: Date;
	validTo: Date;
};

export type LicenseManagerOptions = {
	server?: string;
	tenantId?: number | string;
	productIdentifier?: string;
	autoRenewEnabled?: boolean;
	renewOnInit?: boolean;
	autoRenewOffset?: number;
	detachFloatingOnShutdown?: boolean;
	offlineMode?: boolean;
	logger?: {
		debug?: (...args: any[]) => void;
		info?: (...args: any[]) => void;
		warn?: (...args: any[]) => void;
		error?: (...args: any[]) => void;
	};
	loadCertStr?: () => Promise<TLicenseBlock>;
	saveCertStr?: (value: TLicenseBlock) => Promise<void>;
	deviceFingerprint?: () => string;
	collectUsageMetrics?: () => Promise<unknown[]>;
	collectPassthroughData?: () => Promise<Record<string, unknown>>;
	onFeatureChange?: () => Promise<void> | void;
	onLicenseRenewed?: () => Promise<void> | void;
	onExpirySoon?: () => void;
	expirySoonOffsetMins?: number;
};

export class LicenseManager {
	constructor(options?: LicenseManagerOptions);
	initialize(): Promise<void>;
	activate(activationKey: string, eulaUri?: string): Promise<void>;
	reload(): Promise<void>;
	renew(): Promise<void>;
	clear(): Promise<void>;
	shutdown(): Promise<void>;
	hasFeatureEnabled(featureKey: string): boolean;
	getFeatureValue<T = unknown>(featureKey: string): T | undefined;
	getCurrentEntitlements(): TEntitlement[];
	getManagementJwt(): string;
	getConsumerId(): string;
	enableAutoRenewals(): void;
	disableAutoRenewals(): void;
	toString(): string;
}
