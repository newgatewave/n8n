"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function createWorkflowAction(data: any) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const workflow = await prisma.workflow.create({
    data: {
      userId: session.user.id,
      name: `FB to Sheets Automation (${new Date().toLocaleDateString()})`,
      active: true,
      fbAccounts: data.fbAccounts || [],
      datePreset: data.datePreset || "last_7d",
      sheetId: data.sheetId || "mock_sheet_123",
      worksheet: data.worksheet || "Raw Data",
      schedule: data.schedule || "auto",
    }
  })

  return { success: true, workflowId: workflow.id }
}
