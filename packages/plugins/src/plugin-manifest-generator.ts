/**
 * Plugin Manifest Generator
 *
 * Generates plugin manifests for all 200+ plugins across 21 categories
 */

import type {
	PluginManifest,
	PluginManifestRegistry,
	PermissionType,
	PermissionDefinition,
} from './plugin-manifest.types';

/**
 * Generate all plugin manifests
 */
export function generateAllPluginManifests(): PluginManifestRegistry {
	const plugins: Record<string, PluginManifest> = {};

	// 1. System & OS Plugins (18 plugins)
	const systemPlugins = generateSystemPlugins();
	Object.assign(plugins, systemPlugins);

	// 2. Network Plugins (10 plugins)
	const networkPlugins = generateNetworkPlugins();
	Object.assign(plugins, networkPlugins);

	// 3. AI Core Plugins (18 plugins)
	const aiPlugins = generateAIPlugins();
	Object.assign(plugins, aiPlugins);

	// 4. Core System Plugins (14 plugins)
	const corePlugins = generateCorePlugins();
	Object.assign(plugins, corePlugins);

	// 5. Integration Plugins (24 plugins)
	const integrationPlugins = generateIntegrationPlugins();
	Object.assign(plugins, integrationPlugins);

	// 6. Developer Tools Plugins (10 plugins)
	const devPlugins = generateDevPlugins();
	Object.assign(plugins, devPlugins);

	// 7. Creative Plugins (8 plugins)
	const creativePlugins = generateCreativePlugins();
	Object.assign(plugins, creativePlugins);

	// 8. Analytics Plugins (6 plugins)
	const analyticsPlugins = generateAnalyticsPlugins();
	Object.assign(plugins, analyticsPlugins);

	// 9. Security Plugins (8 plugins)
	const securityPlugins = generateSecurityPlugins();
	Object.assign(plugins, securityPlugins);

	// 10. Automation Plugins (6 plugins)
	const automationPlugins = generateAutomationPlugins();
	Object.assign(plugins, automationPlugins);

	// 11. Data & Database Plugins (10 plugins)
	const dataPlugins = generateDataPlugins();
	Object.assign(plugins, dataPlugins);

	// 12. Cloud & DevOps Plugins (8 plugins)
	const cloudPlugins = generateCloudPlugins();
	Object.assign(plugins, cloudPlugins);

	// 13. IoT Plugins (8 plugins)
	const iotPlugins = generateIoTPlugins();
	Object.assign(plugins, iotPlugins);

	// 14. Communication Plugins (8 plugins)
	const communicationPlugins = generateCommunicationPlugins();
	Object.assign(plugins, communicationPlugins);

	// 15. UI Plugins (10 plugins)
	const uiPlugins = generateUIPlugins();
	Object.assign(plugins, uiPlugins);

	// 16. Map Plugins (5 plugins)
	const mapPlugins = generateMapPlugins();
	Object.assign(plugins, mapPlugins);

	// 17. Finance Plugins (7 plugins)
	const financePlugins = generateFinancePlugins();
	Object.assign(plugins, financePlugins);

	// 18. Travel Plugins (5 plugins)
	const travelPlugins = generateTravelPlugins();
	Object.assign(plugins, travelPlugins);

	// 19. Utility Plugins (6 plugins)
	const utilPlugins = generateUtilPlugins();
	Object.assign(plugins, utilPlugins);

	// 20. Gaming Plugins (5 plugins)
	const gamePlugins = generateGamePlugins();
	Object.assign(plugins, gamePlugins);

	// 21. Experimental Plugins (7 plugins)
	const experimentalPlugins = generateExperimentalPlugins();
	Object.assign(plugins, experimentalPlugins);

	// Build category registry
	const categories: Record<string, any> = {};
	for (const plugin of Object.values(plugins)) {
		const category = plugin.metadata.category;
		if (!categories[category]) {
			categories[category] = {
				name: category,
				displayName: formatCategoryName(category),
				description: getCategoryDescription(category),
				plugins: [],
				count: 0,
			};
		}
		categories[category].plugins.push(plugin.metadata.name);
	}

	// Update counts
	for (const category of Object.values(categories)) {
		category.count = category.plugins.length;
	}

	return {
		version: '1.0.0',
		generatedAt: new Date().toISOString(),
		totalPlugins: Object.keys(plugins).length,
		categories,
		plugins,
	};
}

/**
 * Generate System Plugins
 */
function generateSystemPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const systemPluginsList = [
		{ name: '@system/file', description: 'File read/write, move, delete, zip/unzip' },
		{ name: '@system/mouse', description: 'Mouse automation' },
		{ name: '@system/keyboard', description: 'Keyboard simulation' },
		{ name: '@system/window', description: 'Window manager' },
		{ name: '@system/app', description: 'App launcher/killer' },
		{ name: '@system/audio', description: 'Speaker & mic control' },
		{ name: '@system/network', description: 'WiFi, IP, VPN control' },
		{ name: '@system/voice', description: 'Voice in/out' },
		{ name: '@system/screen', description: 'Screenshot, record screen' },
		{ name: '@system/clipboard', description: 'Clipboard access' },
		{ name: '@system/scheduler', description: 'Time-based job triggers' },
		{ name: '@system/power', description: 'Sleep, restart, shutdown' },
		{ name: '@system/notifications', description: 'Local system notifications' },
		{ name: '@system/hardware', description: 'Access GPU, CPU, RAM stats' },
		{ name: '@system/shell', description: 'Safe command execution' },
		{ name: '@system/security', description: 'File permissions, sandbox control' },
		{ name: '@system/process', description: 'Monitor system processes' },
		{ name: '@system/update', description: 'Auto-update & patch installer' },
	];

	for (const plugin of systemPluginsList) {
		plugins[plugin.name] = createSystemPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Network Plugins
 */
function generateNetworkPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const networkPluginsList = [
		{ name: '@network/http', description: 'Fetch, POST, REST calls' },
		{ name: '@network/socket', description: 'Real-time socket connections' },
		{ name: '@network/webhook', description: 'Inbound/outbound webhooks' },
		{ name: '@network/dns', description: 'Domain lookup, resolve' },
		{ name: '@network/proxy', description: 'Proxy routing' },
		{ name: '@network/ftp', description: 'File transfer over FTP/SFTP' },
		{ name: '@network/vpn', description: 'Manage VPN tunnels' },
		{ name: '@network/ping', description: 'Connectivity test' },
		{ name: '@network/torrent', description: 'Torrent download/upload manager' },
		{ name: '@network/cloudsync', description: 'Sync workflows to cloud' },
	];

	for (const plugin of networkPluginsList) {
		plugins[plugin.name] = createNetworkPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate AI Plugins
 */
function generateAIPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const aiPluginsList = [
		{ name: '@ai/core', description: 'Main AI runtime engine' },
		{ name: '@ai/agent', description: 'Multi-agent system' },
		{ name: '@ai/memory', description: 'Long/short term memory' },
		{ name: '@ai/rag', description: 'Knowledge retrieval' },
		{ name: '@ai/prompt', description: 'Prompt template engine' },
		{ name: '@ai/reasoner', description: 'Logical reasoning unit' },
		{ name: '@ai/planner', description: 'Task planner' },
		{ name: '@ai/tool', description: 'Agent tool handler' },
		{ name: '@ai/code', description: 'Code understanding/generation' },
		{ name: '@ai/math', description: 'Math solver' },
		{ name: '@ai/analyzer', description: 'Data analysis' },
		{ name: '@ai/vision', description: 'Image understanding' },
		{ name: '@ai/audio', description: 'Audio transcription/classification' },
		{ name: '@ai/video', description: 'Video analysis' },
		{ name: '@ai/translation', description: 'Multilingual translation' },
		{ name: '@ai/summarizer', description: 'Document summarization' },
		{ name: '@ai/speech', description: 'Speech to text / text to speech' },
		{ name: '@ai/brain', description: 'Adaptive cognitive layer' },
		{ name: '@ai/autonomy', description: 'Self-learning adaptive agent' },
	];

	for (const plugin of aiPluginsList) {
		plugins[plugin.name] = createAIPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Core Plugins
 */
function generateCorePlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const corePluginsList = [
		{ name: '@core/workflow', description: 'Visual workflow builder' },
		{ name: '@core/eventbus', description: 'Internal event communication' },
		{ name: '@core/queue', description: 'Background job manager' },
		{ name: '@core/logger', description: 'Central log system' },
		{ name: '@core/crypto', description: 'Encryption utilities' },
		{ name: '@core/database', description: 'ORM, SQLite/Postgres handler' },
		{ name: '@core/cache', description: 'Memory caching' },
		{ name: '@core/config', description: 'Global config manager' },
		{ name: '@core/errors', description: 'Error recovery & retry' },
		{ name: '@core/api', description: 'Gateway layer' },
		{ name: '@core/metrics', description: 'Performance analytics' },
		{ name: '@core/testing', description: 'Plugin sandbox testing' },
		{ name: '@core/registry', description: 'Plugin registry/loader' },
		{ name: '@core/cli', description: 'Local CLI interface' },
	];

	for (const plugin of corePluginsList) {
		plugins[plugin.name] = createCorePluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Integration Plugins
 */
function generateIntegrationPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const integrationPluginsList = [
		{ name: '@integration/github', description: 'Repo automation' },
		{ name: '@integration/gitlab', description: 'CI/CD control' },
		{ name: '@integration/notion', description: 'Notion pages' },
		{ name: '@integration/slack', description: 'Slack messages' },
		{ name: '@integration/discord', description: 'Discord bots' },
		{ name: '@integration/telegram', description: 'Telegram bots' },
		{ name: '@integration/twitter', description: 'Tweet automation' },
		{ name: '@integration/google', description: 'Drive, Sheets, Gmail' },
		{ name: '@integration/dropbox', description: 'File cloud' },
		{ name: '@integration/aws', description: 'AWS SDK tools' },
		{ name: '@integration/azure', description: 'Azure cloud' },
		{ name: '@integration/vercel', description: 'Deployments' },
		{ name: '@integration/openai', description: 'OpenAI models' },
		{ name: '@integration/anthropic', description: 'Claude models' },
		{ name: '@integration/gemini', description: 'Google Gemini models' },
		{ name: '@integration/mistral', description: 'Mistral local models' },
		{ name: '@integration/localai', description: 'LLaMA, Ollama models' },
		{ name: '@integration/stripe', description: 'Payments' },
		{ name: '@integration/paypal', description: 'Invoices/payments' },
		{ name: '@integration/firebase', description: 'Realtime DB' },
		{ name: '@integration/supabase', description: 'Auth & DB' },
		{ name: '@integration/web3', description: 'Ethereum, blockchain' },
		{ name: '@integration/ipfs', description: 'Decentralized storage' },
	];

	for (const plugin of integrationPluginsList) {
		plugins[plugin.name] = createIntegrationPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Dev Plugins
 */
function generateDevPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const devPluginsList = [
		{ name: '@dev/git', description: 'Local git commands' },
		{ name: '@dev/docker', description: 'Container automation' },
		{ name: '@dev/vscode', description: 'VSCode API automation' },
		{ name: '@dev/build', description: 'Build manager' },
		{ name: '@dev/test', description: 'Unit/integration tests' },
		{ name: '@dev/ci', description: 'CI/CD pipelines' },
		{ name: '@dev/deploy', description: 'Auto deploy tools' },
		{ name: '@dev/analyzer', description: 'Code analysis' },
		{ name: '@dev/lint', description: 'Lint fixer' },
		{ name: '@dev/ai-coder', description: 'AI code assistant' },
	];

	for (const plugin of devPluginsList) {
		plugins[plugin.name] = createDevPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Creative Plugins
 */
function generateCreativePlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const creativePluginsList = [
		{ name: '@creative/image', description: 'Image generation' },
		{ name: '@creative/music', description: 'Music generation' },
		{ name: '@creative/video', description: 'Video editing' },
		{ name: '@creative/3d', description: '3D model rendering' },
		{ name: '@creative/text', description: 'Story, script, or copywriting' },
		{ name: '@creative/design', description: 'Auto UI/UX generation' },
		{ name: '@creative/prompt-art', description: 'AI art prompts' },
		{ name: '@creative/meme', description: 'Meme generator' },
	];

	for (const plugin of creativePluginsList) {
		plugins[plugin.name] = createCreativePluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Analytics Plugins
 */
function generateAnalyticsPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const analyticsPluginsList = [
		{ name: '@analytics/usage', description: 'Track user stats' },
		{ name: '@analytics/logs', description: 'Collect logs' },
		{ name: '@analytics/ai', description: 'Agent performance metrics' },
		{ name: '@analytics/event', description: 'Event heatmaps' },
		{ name: '@analytics/system', description: 'CPU/RAM usage tracker' },
		{ name: '@analytics/dashboard', description: 'Data visualization tools' },
	];

	for (const plugin of analyticsPluginsList) {
		plugins[plugin.name] = createAnalyticsPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Security Plugins
 */
function generateSecurityPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const securityPluginsList = [
		{ name: '@security/auth', description: 'JWT, OAuth2, MFA' },
		{ name: '@security/vault', description: 'Encrypted credential store' },
		{ name: '@security/permission', description: 'Role-based access' },
		{ name: '@security/audit', description: 'Security audit log' },
		{ name: '@security/sandbox', description: 'Plugin sandbox manager' },
		{ name: '@security/network', description: 'Firewall, proxy, port scanning' },
		{ name: '@security/antivirus', description: 'Local file scanning' },
		{ name: '@security/ai-guardian', description: 'AI behavior monitor' },
	];

	for (const plugin of securityPluginsList) {
		plugins[plugin.name] = createSecurityPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Automation Plugins
 */
function generateAutomationPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const automationPluginsList = [
		{ name: '@automation/task', description: 'Run tasks periodically' },
		{ name: '@automation/trigger', description: 'Conditional automation' },
		{ name: '@automation/script', description: 'Run JS/Python/Lua scripts' },
		{ name: '@automation/ifttt', description: 'If-this-then-that system' },
		{ name: '@automation/schedule', description: 'Calendar automation' },
		{ name: '@automation/work', description: 'Workplace macros' },
	];

	for (const plugin of automationPluginsList) {
		plugins[plugin.name] = createAutomationPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Data Plugins
 */
function generateDataPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const dataPluginsList = [
		{ name: '@data/sqlite', description: 'Local DB' },
		{ name: '@data/postgres', description: 'Postgres connection' },
		{ name: '@data/mysql', description: 'MySQL connection' },
		{ name: '@data/mongo', description: 'MongoDB' },
		{ name: '@data/redis', description: 'Cache DB' },
		{ name: '@data/elasticsearch', description: 'Search index' },
		{ name: '@data/vector', description: 'Embedding vector DB' },
		{ name: '@data/csv', description: 'CSV parsing' },
		{ name: '@data/api', description: 'Data API connector' },
		{ name: '@data/spreadsheet', description: 'Spreadsheet parser' },
	];

	for (const plugin of dataPluginsList) {
		plugins[plugin.name] = createDataPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Cloud Plugins
 */
function generateCloudPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const cloudPluginsList = [
		{ name: '@cloud/docker', description: 'Docker manager' },
		{ name: '@cloud/k8s', description: 'Kubernetes automation' },
		{ name: '@cloud/vercel', description: 'Deploy and logs' },
		{ name: '@cloud/ci', description: 'CI/CD workflows' },
		{ name: '@cloud/monitor', description: 'Uptime monitoring' },
		{ name: '@cloud/aws', description: 'AWS Lambda, EC2' },
		{ name: '@cloud/azure', description: 'Azure management' },
		{ name: '@cloud/gcp', description: 'Google Cloud services' },
	];

	for (const plugin of cloudPluginsList) {
		plugins[plugin.name] = createCloudPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate IoT Plugins
 */
function generateIoTPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const iotPluginsList = [
		{ name: '@iot/device', description: 'Device registration' },
		{ name: '@iot/sensor', description: 'Sensor data read' },
		{ name: '@iot/home', description: 'Smart home control' },
		{ name: '@iot/camera', description: 'IP camera feed' },
		{ name: '@iot/arduino', description: 'Arduino board connector' },
		{ name: '@iot/raspberrypi', description: 'Pi GPIO control' },
		{ name: '@iot/robot', description: 'Robot motion control' },
		{ name: '@iot/voice', description: 'Voice-controlled device' },
	];

	for (const plugin of iotPluginsList) {
		plugins[plugin.name] = createIoTPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Communication Plugins
 */
function generateCommunicationPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const communicationPluginsList = [
		{ name: '@chat/socket', description: 'Real-time chat' },
		{ name: '@chat/discord', description: 'Discord chat bot' },
		{ name: '@chat/slack', description: 'Slack messages' },
		{ name: '@chat/telegram', description: 'Telegram bot' },
		{ name: '@chat/sms', description: 'Twilio integration' },
		{ name: '@chat/email', description: 'SMTP/IMAP handler' },
		{ name: '@chat/voice', description: 'Voice chat agent' },
		{ name: '@chat/assistant', description: 'Full conversational AI layer' },
	];

	for (const plugin of communicationPluginsList) {
		plugins[plugin.name] = createCommunicationPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate UI Plugins
 */
function generateUIPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const uiPluginsList = [
		{ name: '@ui/dock', description: 'Floating dock (Electron)' },
		{ name: '@ui/workflow', description: 'Visual flow builder' },
		{ name: '@ui/agent', description: 'Agent monitor' },
		{ name: '@ui/editor', description: 'Code editor' },
		{ name: '@ui/terminal', description: 'Console interface' },
		{ name: '@ui/inspector', description: 'Debug inspector' },
		{ name: '@ui/settings', description: 'Preferences manager' },
		{ name: '@ui/voice', description: 'Voice command panel' },
		{ name: '@ui/analytics', description: 'Visualization dashboard' },
		{ name: '@ui/theme', description: 'Theme manager' },
	];

	for (const plugin of uiPluginsList) {
		plugins[plugin.name] = createUIPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Map Plugins
 */
function generateMapPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const mapPluginsList = [
		{ name: '@map/location', description: 'Geo location' },
		{ name: '@map/google', description: 'Google Maps integration' },
		{ name: '@map/openstreet', description: 'OpenStreetMap API' },
		{ name: '@map/routing', description: 'Directions & navigation' },
		{ name: '@map/gps', description: 'GPS sensor access' },
	];

	for (const plugin of mapPluginsList) {
		plugins[plugin.name] = createMapPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Finance Plugins
 */
function generateFinancePlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const financePluginsList = [
		{ name: '@finance/crypto', description: 'Wallet connect, on-chain data' },
		{ name: '@finance/stocks', description: 'Market analysis' },
		{ name: '@finance/exchange', description: 'Crypto exchange API' },
		{ name: '@finance/banking', description: 'Bank transaction automation' },
		{ name: '@finance/payments', description: 'Payment gateway integration' },
		{ name: '@finance/invoice', description: 'Generate bills/invoices' },
		{ name: '@finance/tax', description: 'Tax calculator' },
	];

	for (const plugin of financePluginsList) {
		plugins[plugin.name] = createFinancePluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Travel Plugins
 */
function generateTravelPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const travelPluginsList = [
		{ name: '@travel/flight', description: 'Flight search' },
		{ name: '@travel/hotel', description: 'Hotel booking' },
		{ name: '@travel/weather', description: 'Weather info' },
		{ name: '@travel/location', description: 'GPS-based agent movement' },
		{ name: '@travel/maps', description: 'Map route planner' },
	];

	for (const plugin of travelPluginsList) {
		plugins[plugin.name] = createTravelPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Util Plugins
 */
function generateUtilPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const utilPluginsList = [
		{ name: '@util/time', description: 'Time/date functions' },
		{ name: '@util/string', description: 'String formatter' },
		{ name: '@util/math', description: 'Math helper' },
		{ name: '@util/random', description: 'Random generator' },
		{ name: '@util/parser', description: 'Text parsing' },
		{ name: '@util/converter', description: 'Format converter' },
	];

	for (const plugin of utilPluginsList) {
		plugins[plugin.name] = createUtilPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Game Plugins
 */
function generateGamePlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const gamePluginsList = [
		{ name: '@game/control', description: 'Gamepad control' },
		{ name: '@game/engine', description: 'Game engine interface' },
		{ name: '@game/ai', description: 'NPC AI plugin' },
		{ name: '@game/automation', description: 'Auto game macro' },
		{ name: '@game/simulation', description: 'Simulation loop agent' },
	];

	for (const plugin of gamePluginsList) {
		plugins[plugin.name] = createGamePluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Generate Experimental Plugins
 */
function generateExperimentalPlugins(): Record<string, PluginManifest> {
	const plugins: Record<string, PluginManifest> = {};

	const experimentalPluginsList = [
		{ name: '@quantum/simulator', description: 'Quantum logic simulation' },
		{ name: '@neural/interface', description: 'Brainwave control (EEG link)' },
		{ name: '@drone/control', description: 'Drone flying interface' },
		{ name: '@vr/interface', description: 'Virtual reality control' },
		{ name: '@ar/overlay', description: 'AR object overlay' },
		{ name: '@bio/sensor', description: 'Health or biometric data' },
		{ name: '@ai/genome', description: 'AI behavior DNA plugin' },
	];

	for (const plugin of experimentalPluginsList) {
		plugins[plugin.name] = createExperimentalPluginManifest(plugin.name, plugin.description);
	}

	return plugins;
}

/**
 * Create System Plugin Manifest
 */
function createSystemPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'system',
			type: 'system',
			status: 'stable',
			tags: [category, pluginName, 'system'],
			platforms: ['all'],
			architectures: ['all'],
		},
		entry: {
			main: `src/categories/system/${pluginName}.ts`,
		},
		permissions: getSystemPermissions(name),
		runtime: {
			sandbox: true,
			isolation: 'strict',
		},
	};
}

/**
 * Create Network Plugin Manifest
 */
function createNetworkPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'network',
			type: 'integration',
			status: 'stable',
			tags: [category, pluginName, 'network'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/network/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'network.http', description: 'HTTP requests', required: true },
			{
				type: 'network.socket',
				description: 'Socket connections',
				required: name.includes('socket'),
			},
		],
		runtime: {
			sandbox: true,
			networkAccess: true,
		},
	};
}

/**
 * Create AI Plugin Manifest
 */
function createAIPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'ai',
			type: 'ai',
			status: 'beta',
			tags: [category, pluginName, 'ai'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/ai/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'ai.execute', description: 'AI execution', required: true },
			{ type: 'ai.memory', description: 'Memory access', required: name.includes('memory') },
		],
		runtime: {
			sandbox: true,
			memoryLimit: 2048,
		},
	};
}

/**
 * Create Core Plugin Manifest
 */
function createCorePluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'core',
			type: 'system',
			status: 'stable',
			tags: [category, pluginName, 'core'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/core/${pluginName}.ts`,
		},
		permissions: [],
		runtime: {
			sandbox: false,
			isolation: 'permissive',
		},
	};
}

/**
 * Create Integration Plugin Manifest
 */
function createIntegrationPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'integration',
			type: 'integration',
			status: 'stable',
			tags: [category, pluginName, 'integration'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/integration/${pluginName}.ts`,
		},
		permissions: [{ type: 'network.http', description: 'HTTP API access', required: true }],
		runtime: {
			sandbox: true,
			networkAccess: true,
		},
	};
}

/**
 * Create Dev Plugin Manifest
 */
function createDevPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'dev',
			type: 'utility',
			status: 'stable',
			tags: [category, pluginName, 'dev'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/dev/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'file.read', description: 'Read files', required: true },
			{ type: 'file.write', description: 'Write files', required: true },
			{
				type: 'system.shell',
				description: 'Shell access',
				required: pluginName === 'git' || pluginName === 'docker',
			},
		],
		runtime: {
			sandbox: true,
			fileSystemAccess: true,
		},
	};
}

/**
 * Create Creative Plugin Manifest
 */
function createCreativePluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'creative',
			type: 'integration',
			status: 'beta',
			tags: [category, pluginName, 'creative', 'ai'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/creative/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'ai.execute', description: 'AI generation', required: true },
			{ type: 'file.write', description: 'Save generated content', required: true },
		],
		runtime: {
			sandbox: true,
			memoryLimit: 4096,
		},
	};
}

/**
 * Create Analytics Plugin Manifest
 */
function createAnalyticsPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'analytics',
			type: 'utility',
			status: 'stable',
			tags: [category, pluginName, 'analytics'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/analytics/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'database.read', description: 'Read analytics data', required: true },
			{ type: 'database.write', description: 'Write analytics data', required: true },
		],
		runtime: {
			sandbox: true,
		},
	};
}

/**
 * Create Security Plugin Manifest
 */
function createSecurityPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'security',
			type: 'system',
			status: 'stable',
			tags: [category, pluginName, 'security'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/security/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'security.auth', description: 'Authentication', required: name.includes('auth') },
			{ type: 'security.vault', description: 'Vault access', required: name.includes('vault') },
			{
				type: 'security.sandbox',
				description: 'Sandbox control',
				required: name.includes('sandbox'),
			},
		],
		runtime: {
			sandbox: false,
			isolation: 'strict',
		},
	};
}

/**
 * Create Automation Plugin Manifest
 */
function createAutomationPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'automation',
			type: 'utility',
			status: 'stable',
			tags: [category, pluginName, 'automation'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/automation/${pluginName}.ts`,
		},
		permissions: [],
		runtime: {
			sandbox: true,
		},
	};
}

/**
 * Create Data Plugin Manifest
 */
function createDataPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'data',
			type: 'integration',
			status: 'stable',
			tags: [category, pluginName, 'data', 'database'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/data/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'database.read', description: 'Read database', required: true },
			{ type: 'database.write', description: 'Write database', required: true },
		],
		runtime: {
			sandbox: true,
			networkAccess: !['sqlite', 'csv'].includes(pluginName),
		},
	};
}

/**
 * Create Cloud Plugin Manifest
 */
function createCloudPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'cloud',
			type: 'integration',
			status: 'stable',
			tags: [category, pluginName, 'cloud', 'devops'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/cloud/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'network.http', description: 'Cloud API access', required: true },
			{
				type: 'cloud.deploy',
				description: 'Deployment access',
				required: pluginName !== 'monitor',
			},
		],
		runtime: {
			sandbox: true,
			networkAccess: true,
		},
	};
}

/**
 * Create IoT Plugin Manifest
 */
function createIoTPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'iot',
			type: 'integration',
			status: 'beta',
			tags: [category, pluginName, 'iot'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/iot/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'iot.device', description: 'Device access', required: true },
			{ type: 'network.http', description: 'Device communication', required: true },
		],
		runtime: {
			sandbox: true,
			networkAccess: true,
		},
	};
}

/**
 * Create Communication Plugin Manifest
 */
function createCommunicationPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'communication',
			type: 'integration',
			status: 'stable',
			tags: [category, pluginName, 'communication', 'chat'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/communication/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'network.http', description: 'API access', required: true },
			{
				type: 'network.socket',
				description: 'WebSocket access',
				required: pluginName === 'socket',
			},
		],
		runtime: {
			sandbox: true,
			networkAccess: true,
		},
	};
}

/**
 * Create UI Plugin Manifest
 */
function createUIPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'ui',
			type: 'utility',
			status: 'beta',
			tags: [category, pluginName, 'ui', 'frontend'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/ui/${pluginName}.ts`,
		},
		permissions: [],
		runtime: {
			sandbox: false,
			isolation: 'permissive',
		},
	};
}

/**
 * Create Map Plugin Manifest
 */
function createMapPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'map',
			type: 'integration',
			status: 'stable',
			tags: [category, pluginName, 'map', 'location'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/map/${pluginName}.ts`,
		},
		permissions: [{ type: 'network.http', description: 'Map API access', required: true }],
		runtime: {
			sandbox: true,
			networkAccess: true,
		},
	};
}

/**
 * Create Finance Plugin Manifest
 */
function createFinancePluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'finance',
			type: 'integration',
			status: 'stable',
			tags: [category, pluginName, 'finance', 'crypto'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/finance/${pluginName}.ts`,
		},
		permissions: [
			{ type: 'network.http', description: 'Financial API access', required: true },
			{ type: 'security.auth', description: 'Secure authentication', required: true },
		],
		runtime: {
			sandbox: true,
			networkAccess: true,
			isolation: 'strict',
		},
	};
}

/**
 * Create Travel Plugin Manifest
 */
function createTravelPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'travel',
			type: 'integration',
			status: 'stable',
			tags: [category, pluginName, 'travel'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/travel/${pluginName}.ts`,
		},
		permissions: [{ type: 'network.http', description: 'Travel API access', required: true }],
		runtime: {
			sandbox: true,
			networkAccess: true,
		},
	};
}

/**
 * Create Util Plugin Manifest
 */
function createUtilPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'util',
			type: 'utility',
			status: 'stable',
			tags: [category, pluginName, 'utility'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/util/${pluginName}.ts`,
		},
		permissions: [],
		runtime: {
			sandbox: true,
		},
	};
}

/**
 * Create Game Plugin Manifest
 */
function createGamePluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'game',
			type: 'utility',
			status: 'beta',
			tags: [category, pluginName, 'game', 'gaming'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/game/${pluginName}.ts`,
		},
		permissions: [],
		runtime: {
			sandbox: true,
		},
	};
}

/**
 * Create Experimental Plugin Manifest
 */
function createExperimentalPluginManifest(name: string, description: string): PluginManifest {
	const [category, pluginName] = name.replace('@', '').split('/');
	return {
		metadata: {
			name,
			displayName: formatPluginName(pluginName),
			version: '1.0.0',
			description,
			category: 'experimental',
			type: 'experimental',
			status: 'experimental',
			tags: [category, pluginName, 'experimental'],
			platforms: ['all'],
		},
		entry: {
			main: `src/categories/experimental/${pluginName}.ts`,
		},
		permissions: [],
		runtime: {
			sandbox: true,
			isolation: 'strict',
		},
	};
}

/**
 * Helper functions
 */
function formatPluginName(name: string): string {
	return name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function formatCategoryName(category: string): string {
	const categoryMap: Record<string, string> = {
		system: 'System & OS',
		network: 'Internet & Network',
		ai: 'AI Core',
		core: 'Core System',
		integration: 'Integration',
		dev: 'Developer Tools',
		creative: 'Creative',
		analytics: 'Analytics & Insights',
		security: 'Security',
		automation: 'Automation',
		data: 'Data & Database',
		cloud: 'Cloud & DevOps',
		iot: 'IoT',
		communication: 'Communication',
		ui: 'UI',
		map: 'Navigation & Map',
		finance: 'Finance & Crypto',
		travel: 'Travel & Environment',
		util: 'Utility',
		game: 'Gaming & Simulation',
		experimental: 'Experimental',
	};
	return categoryMap[category] || category;
}

function getCategoryDescription(category: string): string {
	const descriptions: Record<string, string> = {
		system: 'OS-level system plugins for file operations, hardware access, automation',
		network: 'Network communication, HTTP, sockets, webhooks',
		ai: 'AI runtime engine, agents, memory, RAG, reasoning',
		core: 'Core workflow, event bus, queue, logger, database',
		integration: 'External service integrations (GitHub, Slack, OpenAI, etc.)',
		dev: 'Git, Docker, VSCode, build, test, CI/CD tools',
		creative: 'Image, music, video, 3D, design generation',
		analytics: 'Usage tracking, logs, AI metrics, dashboards',
		security: 'Auth, vault, permissions, audit, sandbox',
		automation: 'Task automation, triggers, scripts, IFTTT',
		data: 'SQLite, Postgres, MySQL, MongoDB, Redis, vector DB',
		cloud: 'Docker, Kubernetes, AWS, Azure, GCP',
		iot: 'Device registration, sensors, smart home, Arduino, Raspberry Pi',
		communication: 'Chat, Discord, Slack, Telegram, SMS, email, voice',
		ui: 'Dock, workflow builder, agent monitor, editor, terminal',
		map: 'Geo location, Google Maps, OpenStreetMap, GPS',
		finance: 'Crypto wallets, stocks, exchange, banking, payments',
		travel: 'Flight search, hotel booking, weather, GPS',
		util: 'Time, string, math, random, parser, converter',
		game: 'Gamepad control, game engine, NPC AI, automation',
		experimental: 'Quantum simulator, neural interface, drone, VR, AR, bio sensors',
	};
	return descriptions[category] || '';
}

function getSystemPermissions(name: string): PermissionDefinition[] {
	const permissions: PermissionDefinition[] = [];

	if (name.includes('file')) {
		permissions.push(
			{ type: 'file.read', description: 'Read files', required: true },
			{ type: 'file.write', description: 'Write files', required: true },
		);
	}

	if (name.includes('mouse')) {
		permissions.push({ type: 'system.mouse', description: 'Mouse control', required: true });
	}

	if (name.includes('keyboard')) {
		permissions.push({ type: 'system.keyboard', description: 'Keyboard control', required: true });
	}

	if (name.includes('window')) {
		permissions.push({ type: 'system.window', description: 'Window management', required: true });
	}

	if (name.includes('clipboard')) {
		permissions.push({ type: 'system.clipboard', description: 'Clipboard access', required: true });
	}

	if (name.includes('audio') || name.includes('voice')) {
		permissions.push({ type: 'system.audio', description: 'Audio access', required: true });
	}

	if (name.includes('screen')) {
		permissions.push({ type: 'system.screen', description: 'Screen access', required: true });
	}

	if (name.includes('process')) {
		permissions.push({ type: 'system.process', description: 'Process management', required: true });
	}

	if (name.includes('shell')) {
		permissions.push({ type: 'system.shell', description: 'Shell access', required: true });
	}

	if (name.includes('hardware')) {
		permissions.push({ type: 'system.hardware', description: 'Hardware access', required: true });
	}

	if (name.includes('network')) {
		permissions.push({ type: 'network.http', description: 'Network access', required: true });
	}

	if (name.includes('power')) {
		permissions.push({ type: 'system.power', description: 'Power management', required: true });
	}

	if (name.includes('notifications')) {
		permissions.push({ type: 'system.notification', description: 'Notifications', required: true });
	}

	if (name.includes('security')) {
		permissions.push({
			type: 'security.sandbox' as PermissionType,
			description: 'Security sandbox',
			required: true,
		});
	}

	return permissions;
}
