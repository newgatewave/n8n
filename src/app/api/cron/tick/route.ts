import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeWorkflowById } from "@/lib/workflow/runner";

/**
 * External Cron Trigger Endpoint
 * Use this with services like cron-job.org to ping your app every minute.
 * URL: /api/cron/tick
 */
export async function GET(request: Request) {
  try {
    // 1. Fetch all active workflows
    const workflows = await prisma.workflow.findMany({
      where: { active: true },
      select: { 
        id: true, 
        nodesData: true,
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          select: { startedAt: true }
        }
      }
    });

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    
    let triggeredCount = 0;

    // 2. Process each workflow and check if it's time to run
    for (const workflow of workflows) {
      const nodes = (workflow.nodesData as any[]) || [];
      const scheduleNode = nodes.find(n => n.type === 'schedule');

      if (!scheduleNode) continue;

      const scheduleType = scheduleNode.data?.scheduleType || 'hourly';
      const scheduledTime = scheduleNode.data?.time || '00:00'; 
      const [schHour, schMin] = scheduledTime.split(':').map(n => parseInt(n));

      const lastRun = workflow.executions[0]?.startedAt;
      const lastRunTime = lastRun ? new Date(lastRun).getTime() : 0;
      const diffSeconds = (now.getTime() - lastRunTime) / 1000;

      // Prevent double-triggering within the same minute
      if (diffSeconds < 45) continue;

      let shouldExecute = false;

      switch (scheduleType) {
        case 'every_minute':
          shouldExecute = true;
          break;
          
        case 'every_15_minutes':
          if (currentMinute % 15 === 0) shouldExecute = true;
          break;

        case 'hourly':
          if (currentMinute === schMin) shouldExecute = true;
          break;

        case 'daily':
          if (currentHour === schHour && currentMinute === schMin) shouldExecute = true;
          break;

        case 'cron':
          if (scheduleNode.data?.cronExp === '* * * * *') shouldExecute = true;
          break;
      }

      if (shouldExecute) {
        console.log(`[CRON] Triggering Workflow ${workflow.id} via API tick`);
        // We trigger it asynchronously to keep the API response fast
        executeWorkflowById(workflow.id).catch(err => console.error("Cron Execution Failed:", err));
        triggeredCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Checked ${workflows.length} workflows. Triggered ${triggeredCount}.`,
      time: now.toISOString() 
    });

  } catch (error: any) {
    console.error("Cron API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
