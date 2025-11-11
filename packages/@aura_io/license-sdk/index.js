'use strict';

class LicenseManager {
	constructor(options = {}) {
		this.options = options;
		this._entitlements = [];
		this._features = {};
	}
	async initialize() {}
	async activate(_activationKey, _eulaUri) {}
	async reload() {}
	async renew() {}
	async clear() {}
	async shutdown() {}
	hasFeatureEnabled(featureKey) {
		const value = this.getFeatureValue(featureKey);
		return Boolean(value);
	}
	getFeatureValue(featureKey) {
		return this._features[featureKey];
	}
	getCurrentEntitlements() {
		return this._entitlements;
	}
	getManagementJwt() {
		return '';
	}
	getConsumerId() {
		return 'unknown';
	}
	enableAutoRenewals() {}
	disableAutoRenewals() {}
	toString() {
		return 'OSS LicenseManager (noop)';
	}
}

module.exports = {
	LicenseManager,
};
