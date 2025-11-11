import type { Request } from 'express';
import { mock } from 'jest-mock-extended';

import { sanitizeWebhookRequest } from '@/webhooks/webhook-request-sanitizer';

describe('webhookRequestSanitizer', () => {
	let mockRequest: Request;

	beforeEach(() => {
		mockRequest = mock<Request>();
	});

	describe('when no cookies are present', () => {
		it('should call next() without modifying request', () => {
			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBeUndefined();
		});

		it('should handle undefined cookies object', () => {
			(mockRequest.cookies as unknown) = undefined;

			sanitizeWebhookRequest(mockRequest);
		});
	});

	describe('when cookie is present in header', () => {
		it('should remove cookie from cookie header', () => {
			mockRequest.headers = {
				cookie: 'aura-auth=abc123; other-cookie=value; another-cookie=test',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('other-cookie=value; another-cookie=test');
		});

		it('should remove cookie when it is the only cookie', () => {
			mockRequest.headers = {
				cookie: 'aura-auth=abc123',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('');
		});

		it('should remove cookie when it is the last cookie', () => {
			mockRequest.headers = {
				cookie: 'other-cookie=value; aura-auth=abc123',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('other-cookie=value');
		});

		it('should remove cookie when it is in the middle', () => {
			mockRequest.headers = {
				cookie: 'first-cookie=value1; aura-auth=abc123; last-cookie=value2',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('first-cookie=value1; last-cookie=value2');
		});

		it('should handle multiple aura-auth cookies', () => {
			mockRequest.headers = {
				cookie: 'aura-auth=abc123; other-cookie=value; aura-auth=def456',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('other-cookie=value');
		});

		it('should handle whitespace around cookies', () => {
			mockRequest.headers = {
				cookie: '  aura-auth=abc123  ;  other-cookie=value  ',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('other-cookie=value');
		});

		it('should not remove cookies that start with aura-auth but are not exact match', () => {
			mockRequest.headers = {
				cookie: 'aura-auth-extra=value; other-cookie=value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('aura-auth-extra=value; other-cookie=value');
		});
	});

	describe('when cookie is not present in header', () => {
		it('should not modify cookie header when aura-auth is not present', () => {
			const originalCookie = 'other-cookie=value; another-cookie=test';
			mockRequest.headers = {
				cookie: originalCookie,
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe(originalCookie);
		});

		it('should handle case sensitivity correctly', () => {
			mockRequest.headers = {
				cookie: 'N8N-AUTH=abc123; other-cookie=value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('N8N-AUTH=abc123; other-cookie=value');
		});
	});

	describe('when cookie is present in parsed cookies', () => {
		it('should remove aura-auth from parsed cookies object', () => {
			mockRequest.cookies = {
				'aura-auth': 'abc123',
				'other-cookie': 'value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.cookies).toEqual({
				'other-cookie': 'value',
			});
		});

		it('should handle when aura-auth is the only cookie in parsed cookies', () => {
			mockRequest.cookies = {
				'aura-auth': 'abc123',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.cookies).toEqual({});
		});

		it('should not modify other cookies when aura-auth is not present in parsed cookies', () => {
			const originalCookies = {
				'other-cookie': 'value',
				'another-cookie': 'test',
			};
			mockRequest.cookies = { ...originalCookies };

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.cookies).toEqual(originalCookies);
		});
	});

	describe('when both header and parsed cookies contain aura-auth', () => {
		it('should remove aura-auth from both header and parsed cookies', () => {
			mockRequest.headers = {
				cookie: 'aura-auth=abc123; other-cookie=value',
			};
			mockRequest.cookies = {
				'aura-auth': 'abc123',
				'other-cookie': 'value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('other-cookie=value');
			expect(mockRequest.cookies).toEqual({
				'other-cookie': 'value',
			});
		});
	});

	describe('edge cases', () => {
		it('should handle empty cookie header', () => {
			mockRequest.headers = {
				cookie: '',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('');
		});

		it('should handle cookie header with only whitespace', () => {
			mockRequest.headers = {
				cookie: '   ',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('   ');
		});

		it('should handle cookie header with only semicolons', () => {
			mockRequest.headers = {
				cookie: ';;;',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe(';;;');
		});

		it('should handle malformed cookies without equals sign', () => {
			mockRequest.headers = {
				cookie: 'aura-auth; other-cookie=value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('other-cookie=value');
		});
	});

	describe('when aura-browserId is present in header', () => {
		it('should remove aura-browserId from cookie header', () => {
			mockRequest.headers = {
				cookie: 'aura-browserId=abc123; other-cookie=value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('other-cookie=value');
		});

		it('should remove aura-browserId from parsed cookies', () => {
			mockRequest.cookies = {
				'aura-browserId': 'abc123',
				'other-cookie': 'value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.cookies).toEqual({
				'other-cookie': 'value',
			});
		});

		it('should remove both aura-auth and aura-browserId from cookie header', () => {
			mockRequest.headers = {
				cookie: 'aura-auth=abc123; aura-browserId=def456; other-cookie=value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.headers.cookie).toBe('other-cookie=value');
		});

		it('should remove both aura-auth and aura-browserId from parsed cookies', () => {
			mockRequest.cookies = {
				'aura-auth': 'abc123',
				'aura-browserId': 'def456',
				'other-cookie': 'value',
			};

			sanitizeWebhookRequest(mockRequest);

			expect(mockRequest.cookies).toEqual({
				'other-cookie': 'value',
			});
		});
	});
});
