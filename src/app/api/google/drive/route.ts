import { auth } from "@/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" }
  });

  if (!account || !account.access_token) {
    return NextResponse.json({ error: "No Google connection found" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  );
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  try {
    // Attempt to list native Google Spreadsheets
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: "files(id, name, owners)",
      pageSize: 100,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    const files = res.data.files || [];
    
    if (files.length === 0) {
      // Check if we can at least connect to Drive (to distinguish between "no files" and "no access")
      try {
        await drive.about.get({ fields: 'user' });
      } catch (authErr: any) {
        return NextResponse.json({ error: "Authentication Error: Please Disconnect and Reconnect Google." }, { status: 401 });
      }
    }

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("Google Drive API Error:", error);
    if (error.message.includes("Insufficient Permission") || error.code === 403) {
      return NextResponse.json({ error: "Insufficient Permissions. Please Disconnect and Reconnect Google, making sure to check 'See, edit, create, and delete all your Google Drive files'." }, { status: 403 });
    }
    return NextResponse.json({ error: `Google API Error: ${error.message}` }, { status: 500 });
  }
}
