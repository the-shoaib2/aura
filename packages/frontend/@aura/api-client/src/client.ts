import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
	baseURL?: string;
	timeout?: number;
	headers?: Record<string, string>;
}

export class ApiClient {
	private client: AxiosInstance;

	constructor(config: ApiClientConfig = {}) {
		// Use relative paths for Next.js API routes when no baseURL is provided
		// This allows the API routes to work in both development and production
		const baseURL =
			config.baseURL ||
			process.env.NEXT_PUBLIC_GATEWAY_URL ||
			(typeof window !== 'undefined' ? '' : 'http://localhost:3000');

		this.client = axios.create({
			baseURL,
			timeout: config.timeout || 30000,
			headers: {
				'Content-Type': 'application/json',
				...config.headers,
			},
		});

		// Request interceptor
		this.client.interceptors.request.use(
			(config) => {
				// Add auth token if available
				const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			},
		);

		// Response interceptor
		this.client.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					// Handle unauthorized
					if (typeof window !== 'undefined') {
						localStorage.removeItem('auth_token');
						window.location.href = '/login';
					}
				}
				return Promise.reject(error);
			},
		);
	}

	get<T = any>(url: string, config?: AxiosRequestConfig) {
		return this.client.get<T>(url, config);
	}

	post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
		return this.client.post<T>(url, data, config);
	}

	put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
		return this.client.put<T>(url, data, config);
	}

	patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
		return this.client.patch<T>(url, data, config);
	}

	delete<T = any>(url: string, config?: AxiosRequestConfig) {
		return this.client.delete<T>(url, config);
	}
}

// Default instance
export const apiClient = new ApiClient();
