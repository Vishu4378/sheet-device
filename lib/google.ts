import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import { connectDB } from "./mongodb";
import { User } from "@/models/User";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );
}

export async function getAuthenticatedClient(userEmail: string) {
  await connectDB();
  const user = await User.findOne({ email: userEmail });
  if (!user?.googleTokens?.refresh_token) {
    throw new Error("No refresh token found. Please re-authenticate.");
  }

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: user.googleTokens.access_token,
    refresh_token: user.googleTokens.refresh_token,
    expiry_date: user.googleTokens.expiry_date,
  });

  // Auto-refresh if expired or expiry unknown
  if (Date.now() > (user.googleTokens.expiry_date ?? 0) - 60000) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    const update: Record<string, unknown> = {
      "googleTokens.access_token": credentials.access_token,
      // Preserve existing expiry if the refresh response omits it
      "googleTokens.expiry_date": credentials.expiry_date ?? user.googleTokens.expiry_date,
    };
    // Google occasionally rotates the refresh token — persist it if returned
    if (credentials.refresh_token) {
      update["googleTokens.refresh_token"] = credentials.refresh_token;
    }

    await User.findOneAndUpdate({ email: userEmail }, { $set: update });
  }

  return oauth2Client;
}

export async function getUserSheets(userEmail: string) {
  const auth = await getAuthenticatedClient(userEmail);
  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    fields: "files(id, name)",
    pageSize: 50,
  });
  return res.data.files || [];
}

export async function getSheetTabs(userEmail: string, spreadsheetId: string) {
  const auth = await getAuthenticatedClient(userEmail);
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  return (res.data.sheets || []).map((s) => s.properties?.title).filter(Boolean);
}

export async function getSheetHeaders(
  userEmail: string,
  spreadsheetId: string,
  sheetName: string
): Promise<string[]> {
  const auth = await getAuthenticatedClient(userEmail);
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });
  const row = res.data.values?.[0];
  if (!row) return [];
  return row.map((v) => String(v)).filter(Boolean);
}

export async function appendToSheet(
  userEmail: string,
  spreadsheetId: string,
  sheetName: string,
  values: string[]
) {
  const auth = await getAuthenticatedClient(userEmail);
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  const clean = hex.replace("#", "");
  return {
    red: parseInt(clean.substring(0, 2), 16) / 255,
    green: parseInt(clean.substring(2, 4), 16) / 255,
    blue: parseInt(clean.substring(4, 6), 16) / 255,
  };
}

export async function updateHeaderRow(
  userEmail: string,
  spreadsheetId: string,
  sheetName: string,
  headers: string[]
): Promise<void> {
  const auth = await getAuthenticatedClient(userEmail);
  const sheets = google.sheets({ version: "v4", auth });

  // Clear the ENTIRE row 1 first so deleted columns don't linger in extra cells.
  // values.update only overwrites cells within the range of the new data —
  // it leaves cells beyond that range untouched, which caused "deleted" headers
  // to survive and re-appear on the next page load.
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  if (headers.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [headers] },
    });
  }
}

export interface SheetFormattingOptions {
  headerBgColor?: string;
  headerTextColor?: string;
  boldHeader?: boolean;
  headerItalic?: boolean;
  headerAlignment?: "LEFT" | "CENTER" | "RIGHT";
  freezeHeader?: boolean;
  enableBanding?: boolean;
  oddRowColor?: string;
  evenRowColor?: string;
  autoResizeColumns?: boolean;
}

export async function applySheetFormatting(
  userEmail: string,
  spreadsheetId: string,
  sheetName: string,
  options: SheetFormattingOptions
): Promise<void> {
  const auth = await getAuthenticatedClient(userEmail);
  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTab = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  if (!sheetTab) {
    throw new Error(`Sheet tab "${sheetName}" not found`);
  }
  const numericSheetId = sheetTab.properties?.sheetId;
  if (numericSheetId === null || numericSheetId === undefined) {
    throw new Error(`Could not determine sheet ID for tab "${sheetName}"`);
  }

  const requests: sheets_v4.Schema$Request[] = [];

  // Remove any existing banded ranges on this sheet before potentially re-adding
  for (const band of sheetTab.bandedRanges ?? []) {
    if (band.bandedRangeId !== null && band.bandedRangeId !== undefined) {
      requests.push({ deleteBanding: { bandedRangeId: band.bandedRangeId } });
    }
  }

  // Header row: background color, text color, bold, italic, alignment
  const hasHeaderFormat =
    options.headerBgColor !== undefined ||
    options.headerTextColor !== undefined ||
    options.boldHeader !== undefined ||
    options.headerItalic !== undefined ||
    options.headerAlignment !== undefined;

  if (hasHeaderFormat) {
    const userEnteredFormat: sheets_v4.Schema$CellFormat = {};
    const fieldParts: string[] = [];

    if (options.headerBgColor !== undefined) {
      userEnteredFormat.backgroundColor = hexToRgb(options.headerBgColor);
      fieldParts.push("userEnteredFormat.backgroundColor");
    }

    const textFormat: sheets_v4.Schema$TextFormat = {};
    if (options.boldHeader !== undefined) {
      textFormat.bold = options.boldHeader;
      fieldParts.push("userEnteredFormat.textFormat.bold");
    }
    if (options.headerItalic !== undefined) {
      textFormat.italic = options.headerItalic;
      fieldParts.push("userEnteredFormat.textFormat.italic");
    }
    if (options.headerTextColor !== undefined) {
      textFormat.foregroundColor = hexToRgb(options.headerTextColor);
      fieldParts.push("userEnteredFormat.textFormat.foregroundColor");
    }
    if (Object.keys(textFormat).length > 0) {
      userEnteredFormat.textFormat = textFormat;
    }

    if (options.headerAlignment !== undefined) {
      userEnteredFormat.horizontalAlignment = options.headerAlignment;
      fieldParts.push("userEnteredFormat.horizontalAlignment");
    }

    requests.push({
      repeatCell: {
        range: { sheetId: numericSheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat },
        fields: fieldParts.join(","),
      },
    });
  }

  // Freeze / unfreeze row 1
  if (options.freezeHeader !== undefined) {
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId: numericSheetId,
          gridProperties: { frozenRowCount: options.freezeHeader ? 1 : 0 },
        },
        fields: "gridProperties.frozenRowCount",
      },
    });
  }

  // Alternating row colors (banding) — existing ones were deleted above
  if (options.enableBanding) {
    requests.push({
      addBanding: {
        bandedRange: {
          range: {
            sheetId: numericSheetId,
            startRowIndex: 1,
            startColumnIndex: 0,
          },
          rowProperties: {
            firstBandColor: hexToRgb(options.oddRowColor ?? "#f3f4f6"),
            secondBandColor: hexToRgb(options.evenRowColor ?? "#ffffff"),
          },
        },
      },
    });
  }

  // Auto-resize all columns to fit their content
  if (options.autoResizeColumns) {
    requests.push({
      autoResizeDimensions: {
        dimensions: {
          sheetId: numericSheetId,
          dimension: "COLUMNS",
        },
      },
    });
  }

  if (requests.length === 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
}
