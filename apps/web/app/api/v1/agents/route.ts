import { NextRequest, NextResponse } from 'next/server';

// Mock data store (in production, this would be a database)
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

export async function GET(request: NextRequest) {
	try {
		return NextResponse.json({
			agents: mockAgents,
			total: mockAgents.length,
		});
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const newAgent = {
			id: String(mockAgents.length + 1),
			name: body.name || `Agent ${mockAgents.length + 1}`,
			status: body.status || 'inactive',
			tasksCompleted: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		mockAgents.push(newAgent);
		return NextResponse.json(newAgent, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
	}
}
