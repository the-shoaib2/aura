/**
 * Integration Categories
 *
 * Organizes integrations into logical categories for easy discovery and management
 */

// Export all category plugins
export * from './system';
export * from './network';
export * from './ai';
export * from './core';
export * from './integration';
export * from './dev';
export * from './creative';
export * from './analytics';
export * from './security';
export * from './automation';
export * from './data';
export * from './cloud';
export * from './iot';
export * from './communication';
export * from './ui';
export * from './map';
export * from './finance';
export * from './travel';
export * from './util';
export * from './game';
export * from './experimental';

export const INTEGRATION_CATEGORIES = {
	COMMUNICATION: 'communication',
	CRM: 'crm',
	DATABASE: 'database',
	CLOUD: 'cloud',
	PRODUCTIVITY: 'productivity',
	DEVELOPMENT: 'development',
	ECOMMERCE: 'ecommerce',
	ANALYTICS: 'analytics',
	AI_ML: 'ai-ml',
	STORAGE: 'storage',
	SOCIAL: 'social',
	MARKETING: 'marketing',
	WORKFLOW: 'workflow',
	TRIGGERS: 'triggers',
	SYSTEM: 'system',
	FINANCE: 'finance',
	HR: 'hr',
	SUPPORT: 'support',
	LEGAL: 'legal',
	REAL_ESTATE: 'real-estate',
	WEATHER: 'weather',
	NEWS: 'news',
	GAMING: 'gaming',
	EDUCATION: 'education',
	HEALTHCARE: 'healthcare',
	IOT: 'iot',
	BLOCKCHAIN: 'blockchain',
	OTHER: 'other',
} as const;

export type IntegrationCategoryType =
	(typeof INTEGRATION_CATEGORIES)[keyof typeof INTEGRATION_CATEGORIES];

export const CATEGORY_INFO: Record<
	IntegrationCategoryType,
	{ displayName: string; description: string; icon?: string }
> = {
	[INTEGRATION_CATEGORIES.COMMUNICATION]: {
		displayName: 'Communication',
		description: 'Messaging, email, SMS, and video communication platforms',
		icon: '💬',
	},
	[INTEGRATION_CATEGORIES.CRM]: {
		displayName: 'CRM',
		description: 'Customer relationship management platforms',
		icon: '👥',
	},
	[INTEGRATION_CATEGORIES.DATABASE]: {
		displayName: 'Database',
		description: 'SQL, NoSQL, and specialized databases',
		icon: '🗄️',
	},
	[INTEGRATION_CATEGORIES.CLOUD]: {
		displayName: 'Cloud Services',
		description: 'AWS, Azure, GCP, and other cloud platforms',
		icon: '☁️',
	},
	[INTEGRATION_CATEGORIES.PRODUCTIVITY]: {
		displayName: 'Productivity',
		description: 'Notes, spreadsheets, project management tools',
		icon: '📊',
	},
	[INTEGRATION_CATEGORIES.DEVELOPMENT]: {
		displayName: 'Development',
		description: 'Version control, CI/CD, issue tracking, APIs',
		icon: '💻',
	},
	[INTEGRATION_CATEGORIES.ECOMMERCE]: {
		displayName: 'E-commerce',
		description: 'Online stores, payments, fulfillment',
		icon: '🛒',
	},
	[INTEGRATION_CATEGORIES.ANALYTICS]: {
		displayName: 'Analytics',
		description: 'Web analytics, business intelligence, data visualization',
		icon: '📈',
	},
	[INTEGRATION_CATEGORIES.AI_ML]: {
		displayName: 'AI & ML',
		description: 'LLMs, vector databases, ML platforms',
		icon: '🤖',
	},
	[INTEGRATION_CATEGORIES.STORAGE]: {
		displayName: 'Storage',
		description: 'Cloud storage, CDN, backup services',
		icon: '💾',
	},
	[INTEGRATION_CATEGORIES.SOCIAL]: {
		displayName: 'Social Media',
		description: 'Social networks, video platforms, forums',
		icon: '📱',
	},
	[INTEGRATION_CATEGORIES.MARKETING]: {
		displayName: 'Marketing',
		description: 'Email marketing, SEO, advertising, landing pages',
		icon: '📢',
	},
	[INTEGRATION_CATEGORIES.WORKFLOW]: {
		displayName: 'Workflow',
		description: 'Core workflow nodes and transformers',
		icon: '🔄',
	},
	[INTEGRATION_CATEGORIES.TRIGGERS]: {
		displayName: 'Triggers',
		description: 'Webhooks, schedules, manual triggers',
		icon: '⚡',
	},
	[INTEGRATION_CATEGORIES.SYSTEM]: {
		displayName: 'System',
		description: 'OS-level operations: file, mouse, keyboard, window, audio, network, etc.',
		icon: '⚙️',
	},
	[INTEGRATION_CATEGORIES.FINANCE]: {
		displayName: 'Finance',
		description: 'Accounting, invoicing, payment processing',
		icon: '💰',
	},
	[INTEGRATION_CATEGORIES.HR]: {
		displayName: 'HR',
		description: 'Human resources, recruiting, payroll',
		icon: '👔',
	},
	[INTEGRATION_CATEGORIES.SUPPORT]: {
		displayName: 'Support',
		description: 'Customer support, helpdesk, ticketing',
		icon: '🎧',
	},
	[INTEGRATION_CATEGORIES.LEGAL]: {
		displayName: 'Legal',
		description: 'Document signing, legal services',
		icon: '⚖️',
	},
	[INTEGRATION_CATEGORIES.REAL_ESTATE]: {
		displayName: 'Real Estate',
		description: 'Property listings, real estate APIs',
		icon: '🏠',
	},
	[INTEGRATION_CATEGORIES.WEATHER]: {
		displayName: 'Weather',
		description: 'Weather APIs and services',
		icon: '🌤️',
	},
	[INTEGRATION_CATEGORIES.NEWS]: {
		displayName: 'News',
		description: 'News APIs, RSS feeds, content aggregation',
		icon: '📰',
	},
	[INTEGRATION_CATEGORIES.GAMING]: {
		displayName: 'Gaming',
		description: 'Gaming platforms, APIs, and services',
		icon: '🎮',
	},
	[INTEGRATION_CATEGORIES.EDUCATION]: {
		displayName: 'Education',
		description: 'Learning platforms, educational tools',
		icon: '📚',
	},
	[INTEGRATION_CATEGORIES.HEALTHCARE]: {
		displayName: 'Healthcare',
		description: 'Medical services, health tracking',
		icon: '🏥',
	},
	[INTEGRATION_CATEGORIES.IOT]: {
		displayName: 'IoT',
		description: 'Internet of Things devices and platforms',
		icon: '🔌',
	},
	[INTEGRATION_CATEGORIES.BLOCKCHAIN]: {
		displayName: 'Blockchain',
		description: 'Blockchain platforms, cryptocurrencies',
		icon: '⛓️',
	},
	[INTEGRATION_CATEGORIES.OTHER]: {
		displayName: 'Other',
		description: 'Miscellaneous integrations',
		icon: '🔧',
	},
};
