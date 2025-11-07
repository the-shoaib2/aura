import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowRepository, workflowToApiFormat, getDatabase } from '@/lib/db';
import { Log } from '@aura/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const repository = await getWorkflowRepository();
		const db = await getDatabase();
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

		// Update workflow status to active
		workflow.status = 'active';
		await repository.save(workflow);

		// Create an execution log entry
		const logRepository = db.getRepository(Log);
		const executionLog = logRepository.create({
			level: 'info',
			message: 'Workflow execution started',
			workflow: workflow,
			metadata: {
				workflowId: workflow.id,
				status: 'running',
				startedAt: new Date(),
			},
		} as any);
		await logRepository.save(executionLog);

		// Reload workflow with updated logs
		const updatedWorkflow = await repository.findOne({
			where: { id: workflowId } as any,
			relations: ['logs'],
		});

		if (!updatedWorkflow) {
			return NextResponse.json({ error: 'Failed to reload workflow' }, { status: 500 });
		}

		return NextResponse.json(workflowToApiFormat(updatedWorkflow));
	} catch (error) {
		console.error('Error in POST /api/v1/workflows/[id]/run:', error);
		return NextResponse.json(
			{
				error: 'Failed to run workflow',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}
