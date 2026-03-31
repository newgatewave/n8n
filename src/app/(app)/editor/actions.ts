"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { runWorkflow, WorkflowResult } from "@/lib/workflow/runner"
import { revalidatePath } from "next/cache";

export async function deleteWorkflowAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.workflow.delete({
    where: { 
      id,
      userId: session.user.id 
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveFlowAction(flowData: any, workflowId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = {
    userId: session.user.id,
    name: flowData.name || `Visual Flow - ${new Date().toLocaleDateString()}`,
    active: true,
    nodesData: flowData.nodes,
    edgesData: flowData.edges,
  };

  if (workflowId) {
    await prisma.workflow.update({
      where: { id: workflowId },
      data
    });
    return { success: true, workflowId };
  } else {
    const workflow = await prisma.workflow.create({ data });
    return { success: true, workflowId: workflow.id };
  }
}

/**
 * Executes a workflow on-demand.
 * This can be used for "Test Runs" or "Manual Execution".
 */
export async function executeWorkflowAction(flowData: { nodes: any[], edges: any[] }): Promise<WorkflowResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized. Please log in.");
  
  return await runWorkflow(session.user.id, flowData);
}

export async function getFacebookToken() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "facebook"
    }
  });

  return account?.access_token || null;
}

export async function getGoogleToken() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google"
    }
  });

  return account?.access_token || null;
}

export async function getWorkflowAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workflow = await prisma.workflow.findUnique({
    where: { id, userId: session.user.id }
  });

  if (!workflow) return { success: false, error: "Workflow not found" };

  return {
    success: true,
    workflow: {
      id: workflow.id,
      name: workflow.name,
      nodes: workflow.nodesData,
      edges: workflow.edgesData,
    }
  };
}
