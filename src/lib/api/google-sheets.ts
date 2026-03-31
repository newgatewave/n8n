import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

/**
 * Gets an authenticated Google Sheets client for a specific user.
 */
async function getSheetsClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account || !account.access_token) {
    throw new Error("No Google account linked or missing access token");
  }

  const auth = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  );

  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Append rows to a specific Google Sheet.
 */
export async function appendToSheet(
  userId: string,
  spreadsheetId: string,
  range: string, 
  values: any[][]
) {
  const sheets = await getSheetsClient(userId);

  console.log(`Appending to Sheet: ID=${spreadsheetId}, Range=${range}, Rows=${values.length}`);
  
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED", // AUTOMATIC RECOGNITION (NORMAL MODE)
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values,
    },
  });

  console.log(`Append Result: Range=${response.data.updates?.updatedRange}, Rows=${response.data.updates?.updatedRows}`);
  return response.data;
}

/**
 * Get sheet list (tabs) from a spreadsheet.
 */
export async function getSpreadsheetDetails(userId: string, spreadsheetId: string) {
  const sheets = await getSheetsClient(userId);
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  return response.data;
}
