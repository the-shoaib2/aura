import { initializeDataSource, AppDataSource, Workflow, User } from '@aura/db';

let isInitialized = false;

/**
 * Initialize database connection for Next.js API routes
 */
export async function getDatabase() {
	if (!isInitialized) {
		try {
			await initializeDataSource();
			isInitialized = true;
		} catch (error) {
			console.error('Failed to initialize database:', error);
			throw error;
		}
	}
	return AppDataSource;
}

/**
 * Get or create a default user for workflows
 * TODO: Replace with actual authentication when auth is implemented
 */
export async function getDefaultUser(): Promise<User> {
	const db = await getDatabase();
	const userRepository = db.getRepository(User);

	// Try to find an existing user
	let user = await userRepository.findOne({
		where: { email: 'default@aura.local' } as any,
	});

	// If no user exists, create a default one
	if (!user) {
		// Simple hash for default user (not secure, but OK for development)
		// In production, this should use proper password hashing (bcrypt, argon2, etc.)
		const crypto = await import('crypto');
		const defaultPassword = 'default';
		const hashedPassword = crypto.createHash('sha256').update(defaultPassword).digest('hex');

		user = userRepository.create({
			email: 'default@aura.local',
			name: 'Default User',
			hashedPassword,
			role: 'user',
			isActive: true,
		} as any);
		user = await userRepository.save(user);
	}

	return user;
}

/**
 * Get workflow repository
 */
export async function getWorkflowRepository() {
	const db = await getDatabase();
	return db.getRepository(Workflow);
}

/**
 * Convert database Workflow entity to API format
 */
export function workflowToApiFormat(workflow: Workflow) {
	// Get the most recent execution log for lastRun
	// Note: logs might not be loaded if relations weren't included in the query
	let lastRun: string | null = null;
	if (workflow.logs && Array.isArray(workflow.logs) && workflow.logs.length > 0) {
		const sortedLogs = workflow.logs
			.filter((log) => log && log.createdAt)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		if (sortedLogs.length > 0) {
			lastRun = sortedLogs[0].createdAt.toISOString();
		}
	}

	return {
		id: String(workflow.id),
		name: workflow.name,
		status: workflow.status || 'inactive',
		lastRun,
		createdAt: workflow.createdAt.toISOString(),
		updatedAt: workflow.updatedAt.toISOString(),
		description: workflow.description,
		nodes: workflow.nodes,
		connections: workflow.connections,
		settings: workflow.settings,
	};
}
