import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { executeWorkflowById } from "@/lib/workflow/runner";

/**
 * High-Precision Ticker - Runs every 1 minute.
 */
export const workflowTicker = inngest.createFunction(
  { id: "workflow-ticker-1m", triggers: [{ cron: "* * * * *" }] },
  async ({ event, step, logger }) => {
    // 1. Fetch all active workflows
    const workflows = await step.run("fetch-active-workflows", async () => {
      return prisma.workflow.findMany({
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
    });

    logger.info(`TICK: Checking ${workflows.length} active workflows.`);

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    // 2. Process each workflow and check if it's time to run
    for (const workflow of workflows) {
      await step.run(`check-schedule-${workflow.id}`, async () => {
        const nodes = (workflow.nodesData as any[]) || [];
        const scheduleNode = nodes.find(n => n.type === 'schedule');

        if (!scheduleNode) return;

        const scheduleType = scheduleNode.data?.scheduleType || 'hourly';
        const scheduledTime = scheduleNode.data?.time || '00:00'; 
        const [schHour, schMin] = scheduledTime.split(':').map(n => parseInt(n));

        const lastRun = workflow.executions[0]?.startedAt;
        const lastRunTime = lastRun ? new Date(lastRun).getTime() : 0;
        const diffSeconds = (now.getTime() - lastRunTime) / 1000;

        // Prevent double-triggering within the same minute (60 seconds)
        if (diffSeconds < 45) {
          logger.info(`Workflow ${workflow.id} ran recently (${Math.round(diffSeconds)}s ago). Skipping.`);
          return;
        }

        let shouldExecute = false;

        switch (scheduleType) {
          case 'every_minute':
            shouldExecute = true;
            break;
            
          case 'every_15_minutes':
            if (currentMinute % 15 === 0) shouldExecute = true;
            break;

          case 'hourly':
            // Run at the specific minute of every hour
            if (currentMinute === schMin) shouldExecute = true;
            break;

          case 'daily':
            // Run at the specific hour and minute
            if (currentHour === schHour && currentMinute === schMin) shouldExecute = true;
            break;

          case 'cron':
            // Simplified cron support: if set to '* * * * *', it runs every minute
            if (scheduleNode.data?.cronExp === '* * * * *') {
               shouldExecute = true;
            }
            break;
        }

        if (shouldExecute) {
          logger.info(`Triggering Workflow ${workflow.id} (Schedule: ${scheduleType})`);
          await executeWorkflowById(workflow.id);
        }
      });
    }

    return { processed: workflows.length };
  }
);
