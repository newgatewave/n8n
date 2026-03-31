"use server"

import { getAdInsights } from "@/lib/api/facebook"
import { appendToSheet } from "@/lib/api/google-sheets"
import { prisma } from "@/lib/prisma"

export interface WorkflowResult {
  success: boolean;
  error?: string;
  rowsAdded?: number;
  availableFields?: string[];
}

/**
 * Core execution engine for the visual flow.
 */
export async function runWorkflow(userId: string, flowData: { nodes: any[], edges: any[] }): Promise<WorkflowResult> {
  const { nodes } = flowData;

  const fbNode = nodes.find(n => n.type === 'facebook') || nodes.find(n => n.type === 'facebook_ads');
  const mapperNode = nodes.find(n => n.type === 'mapper');
  const sheetNode = nodes.find(n => n.type === 'googleSheet');

  if (!fbNode || !sheetNode) {
    return { success: false, error: "Required nodes (Facebook/GoogleSheet) are missing." };
  }

  const fbConfig = fbNode.data;
  const sheetConfig = sheetNode.data;
  const mapperNodeData = mapperNode?.data || { fields: [] };

  try {
    const fbToken = await getFacebookToken(userId);
    const googleToken = await getGoogleToken(userId);
    if (!fbToken || !googleToken) return { success: false, error: "Connection error (FB/Google)." };

    const accounts = Array.isArray(fbConfig.selectedAccounts) ? fbConfig.selectedAccounts : [fbConfig.selectedAccounts];
    let allInsights: any[] = [];
    for (const accountId of accounts) {
      const insights = await getAdInsights(fbToken, accountId, fbConfig.datePreset || 'last_7d', fbConfig.level || 'campaign');
      allInsights = [...allInsights, ...insights];
    }

    if (allInsights.length === 0) return { success: true, rowsAdded: 0 };

    const mappings = mapperNodeData.fields || [];
    const activeMappings = mappings.filter((m: any) => m.source && m.target);
    let rowsToAppend: any[][] = [];
    let availableFields: string[] = [];

    const columnToIndex = (col: string) => {
      let index = 0;
      const cleanCol = col.trim().toUpperCase();
      for (let i = 0; i < cleanCol.length; i++) {
        index = index * 26 + (cleanCol.charCodeAt(i) - 64);
      }
      return index - 1;
    };

    if (activeMappings.length > 0) {
      const maxColIndex = Math.max(...activeMappings.map((m: any) => columnToIndex(String(m.target || 'A'))));

      rowsToAppend = allInsights.map((row: any, rowIndex: number) => {
        const lowerRow: any = {};
        Object.keys(row).forEach(k => { lowerRow[k.toLowerCase()] = row[k]; });

        // Flatten actions
        if (Array.isArray(row.actions)) {
          row.actions.forEach((action: any) => {
            if (action.action_type) {
              const type = action.action_type.toLowerCase();
              lowerRow[type] = action.value;
              if (type.includes('messaging_conversation_started')) {
                 lowerRow['messaging_conversations'] = action.value;
                 lowerRow['messages'] = action.value;
              }
            }
          });
        }

        if (rowIndex === 0) availableFields = Object.keys(lowerRow);

        const formattedRow = new Array(maxColIndex + 1).fill("");
        activeMappings.forEach((m: any) => {
          let sourceKey = m.source.trim().toLowerCase();
          if (sourceKey === 'date') sourceKey = 'date_start';
          if (['avg_video', 'video_avg_time', 'video_play_time', 'video_avg_time_watched_action', 'video_avg_time_watched_actions'].some(a => sourceKey === a)) {
             sourceKey = 'video_avg_time_watched_actions';
          }

          const targetIndex = columnToIndex(String(m.target || 'A'));
          if (targetIndex >= 0) {
            let val: any = lowerRow[sourceKey];
            
            // UNPACK
            if (val !== undefined && val !== null) {
              if (Array.isArray(val) && val.length > 0) {
                val = typeof val[0] === 'object' ? val[0].value : val[0];
              } else if (typeof val === 'object') {
                val = (val as any).value !== undefined ? (val as any).value : JSON.stringify(val);
              }
            }

            // AUTOMATIC FORMATTING (NORMAL MODE PREPARATION)
            if (val !== undefined && val !== null && String(val) !== "") {
               const num = parseFloat(String(val));
               
               // NO SINGLE QUOTES ANYWHERE
               if (sourceKey.includes('date') || sourceKey.includes('_id')) {
                  // Pass as string, Google Sheets will auto-detect as Date/ID safely
                  val = String(val);
               } else if (!isNaN(num)) {
                  if (sourceKey.includes('video_avg_time')) {
                    val = parseFloat((num / 100).toFixed(2));
                  } else {
                    val = parseFloat(num.toFixed(2));
                  }
               }
            }
            const isNumeric = ['spend', 'cost', 'video', 'action', 'click', 'message'].some(k => sourceKey.includes(k));
            formattedRow[targetIndex] = (val !== undefined && val !== null && String(val) !== "") ? val : (isNumeric ? 0.00 : "");
          }
        });
        return formattedRow;
      });
    } else {
      const keys = Object.keys(allInsights[0]);
      availableFields = keys;
      rowsToAppend = allInsights.map((row: any) => keys.map(k => row[k]));
    }

    const targetSheet = sheetConfig.selectedSheet || 'Sheet1';
    await appendToSheet(userId, sheetConfig.selectedFile, `'${targetSheet}'!A1`, rowsToAppend);

    return { success: true, rowsAdded: rowsToAppend.length, availableFields };
  } catch (error: any) {
    console.error("Workflow Execution Failed:", error);
    return { success: false, error: error.message || "Execution error." };
  }
}

export async function executeWorkflowById(workflowId: string): Promise<WorkflowResult> {
  const execution = await prisma.workflowExecution.create({ data: { workflowId, status: "RUNNING" } });
  try {
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new Error("Workflow not found.");
    const nodes = (workflow.nodesData as any[]) || [];
    const edges = (workflow.edgesData as any[]) || [];
    const result = await runWorkflow(workflow.userId, { nodes, edges });

    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? "success" : "failed",
        rowsAdded: result.rowsAdded || 0,
        logs: result.success ? "Success" : result.error,
        // @ts-ignore
        output: JSON.stringify({ availableFields: result.availableFields || [], error: result.error }),
        completedAt: new Date()
      }
    });
    return result;
  } catch (error: any) {
    await prisma.workflowExecution.update({ where: { id: execution.id }, data: { status: "failed", logs: error.message, completedAt: new Date() } });
    return { success: false, error: error.message };
  }
}

async function getFacebookToken(userId: string) {
  const account = await prisma.account.findFirst({ where: { userId, provider: "facebook" } });
  return account?.access_token || null;
}

async function getGoogleToken(userId: string) {
  const account = await prisma.account.findFirst({ where: { userId, provider: "google" } });
  return account?.access_token || null;
}
