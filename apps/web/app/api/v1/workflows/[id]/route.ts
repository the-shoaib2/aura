import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowRepository, workflowToApiFormat } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const repository = await getWorkflowRepository();
		const workflowId = parseInt(id, 10);

		if (isNaN(workflowId)) {
			return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
		}

		const workflow = await repository.findOne({
			where: { id: workflowId } as any,
			relations: ['logs'],
		});

		if (!workflow) {
			return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
		}

		return NextResponse.json(workflowToApiFormat(workflow));
	} catch (error) {
		console.error('Error in GET /api/v1/workflows/[id]:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch workflow',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();
		const repository = await getWorkflowRepository();
		const workflowId = parseInt(id, 10);

		if (isNaN(workflowId)) {
			return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
		}

		const workflow = await repository.findOne({
			where: { id: workflowId } as any,
		});

		if (!workflow) {
			return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
		}

		// Update workflow fields
		if (body.name !== undefined) workflow.name = body.name;
		if (body.status !== undefined) workflow.status = body.status;
		if (body.description !== undefined) workflow.description = body.description;
		if (body.nodes !== undefined) workflow.nodes = body.nodes;
		if (body.connections !== undefined) workflow.connections = body.connections;
		if (body.settings !== undefined) workflow.settings = body.settings;

		const updatedWorkflow = await repository.save(workflow);

		return NextResponse.json(workflowToApiFormat(updatedWorkflow));
	} catch (error) {
		console.error('Error in PUT /api/v1/workflows/[id]:', error);
		return NextResponse.json(
			{
				error: 'Failed to update workflow',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const repository = await getWorkflowRepository();
		const workflowId = parseInt(id, 10);

		if (isNaN(workflowId)) {
			return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
		}

		const workflow = await repository.findOne({
			where: { id: workflowId } as any,
		});

		if (!workflow) {
			return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
		}

		await repository.remove(workflow);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error in DELETE /api/v1/workflows/[id]:', error);
		return NextResponse.json(
			{
				error: 'Failed to delete workflow',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}
