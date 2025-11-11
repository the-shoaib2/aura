import type { AxiosRequestConfig } from 'axios';

import { ApiClient } from './api-client';

export class AuthenticatedApiClient extends ApiClient {
	constructor(
		apiBaseUrl: string,
		private readonly authCookie: string,
	) {
		super(apiBaseUrl);
	}

	static async createUsingUsernameAndPassword(
		apiClient: ApiClient,
		loginDetails: {
			email: string;
			password: string;
		},
	): Promise<AuthenticatedApiClient> {
		const response = await apiClient.restApiRequest('/login', {
			method: 'POST',
			data: {
				emailOrLdapLoginId: loginDetails.email,
				password: loginDetails.password,
			},
		});

		if (response.data === 'aura is starting up. Please wait') {
			await apiClient.delay(1000);
			return await this.createUsingUsernameAndPassword(apiClient, loginDetails);
		}

		const cookieHeader = response.headers['set-cookie'];
		const authCookie = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;
		if (!authCookie) {
			throw new Error(
				'Did not receive authentication cookie even tho login succeeded: ' +
					JSON.stringify(
						{
							status: response.status,
							headers: response.headers,
							data: response.data,
						},
						null,
						2,
					),
			);
		}

		return new AuthenticatedApiClient(apiClient.apiBaseUrl, authCookie);
	}

	async get<T>(endpoint: string) {
		return await this.authenticatedRequest<T>(endpoint, {
			method: 'GET',
		});
	}

	async post<T>(endpoint: string, data: unknown) {
		return await this.authenticatedRequest<T>(endpoint, {
			method: 'POST',
			data,
		});
	}

	async patch<T>(endpoint: string, data: unknown) {
		return await this.authenticatedRequest<T>(endpoint, {
			method: 'PATCH',
			data,
		});
	}

	async delete<T>(endpoint: string) {
		return await this.authenticatedRequest<T>(endpoint, {
			method: 'DELETE',
		});
	}

	protected async authenticatedRequest<T>(endpoint: string, init: Omit<AxiosRequestConfig, 'url'>) {
		return await this.restApiRequest<T>(endpoint, {
			...init,
			headers: {
				...init.headers,
				cookie: this.authCookie,
			},
		});
	}
}
