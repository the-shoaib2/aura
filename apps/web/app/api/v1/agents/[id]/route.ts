import { NextRequest, NextResponse } from 'next/server';

// Mock data store (shared with main route)
// In production, this would be a database or shared state management
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const agent = mockAgents.find((a) => a.id === id);
		if (!agent) {
			return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
		}
		return NextResponse.json(agent);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();
		const index = mockAgents.findIndex((a) => a.id === id);
		if (index === -1) {
			return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
		}
		mockAgents[index] = {
			...mockAgents[index],
			...body,
			id: id,
			updatedAt: new Date().toISOString(),
		};
		return NextResponse.json(mockAgents[index]);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const index = mockAgents.findIndex((a) => a.id === id);
		if (index === -1) {
			return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
		}
		mockAgents = mockAgents.filter((a) => a.id !== id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
	}
}
