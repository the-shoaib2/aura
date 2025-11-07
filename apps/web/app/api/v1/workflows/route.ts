import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowRepository, getDefaultUser, workflowToApiFormat } from '@/lib/db';

export async function GET(request: NextRequest) {
	try {
		const repository = await getWorkflowRepository();
		const workflows = await repository.find({
			relations: ['logs'],
			order: { updatedAt: 'DESC' },
		});

		const workflowsData = workflows.map(workflowToApiFormat);

		return NextResponse.json({
			workflows: workflowsData,
			total: workflowsData.length,
		});
	} catch (error) {
		console.error('Error in GET /api/v1/workflows:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch workflows',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const repository = await getWorkflowRepository();
		const defaultUser = await getDefaultUser();

		const newWorkflow = repository.create({
			name: body.name || `Workflow ${Date.now()}`,
			status: body.status || 'inactive',
			description: body.description,
			nodes: body.nodes,
			connections: body.connections,
			settings: body.settings,
			owner: defaultUser,
		});

		const savedWorkflow = await repository.save(newWorkflow);

		return NextResponse.json(workflowToApiFormat(savedWorkflow), { status: 201 });
	} catch (error) {
		console.error('Error in POST /api/v1/workflows:', error);
		return NextResponse.json(
			{
				error: 'Failed to create workflow',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}
