import { NextRequest, NextResponse } from 'next/server';

// Mock data store (shared with main route)
let mockAgents = [
	{
		id: '1',
		name: 'Customer Support Agent',
		status: 'active',
		tasksCompleted: 42,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		name: 'Data Analysis Agent',
		status: 'active',
		tasksCompleted: 18,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '3',
		name: 'Content Generator Agent',
		status: 'inactive',
		tasksCompleted: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const agent = mockAgents.find((a) => a.id === id);
		if (!agent) {
			return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
		}
		agent.status = 'active';
		agent.updatedAt = new Date().toISOString();
		return NextResponse.json(agent);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to start agent' }, { status: 500 });
	}
}
