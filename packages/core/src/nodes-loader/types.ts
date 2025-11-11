export namespace aura {
	export interface PackageJson {
		name: string;
		version: string;
		aura?: {
			credentials?: string[];
			nodes?: string[];
		};
		author?: {
			name?: string;
			email?: string;
		};
	}
}
