/**
 * Google Apps Script backend for the wedding survey.
 *
 * Setup:
 * 1. Create a Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Replace SPREADSHEET_ID below.
 * 5. Deploy -> New deployment -> Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 6. Copy the /exec URL into VITE_GOOGLE_SCRIPT_URL.
 */

const SPREADSHEET_ID = 'PUT_YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Responses';

const HEADERS = [
  'Timestamp',
  'Họ và tên',
  'Số điện thoại',
  'Lựa chọn',
  'Mã lựa chọn',
  'Số người',
  'Lời nhắn',
  'Submitted At (client)',
];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'wedding-survey' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.parameter) {
      throw new Error('Missing form payload');
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      safeCell(e.parameter.fullName),
      safeCell(e.parameter.phone),
      safeCell(e.parameter.attendanceLabel),
      safeCell(e.parameter.attendance),
      safeCell(e.parameter.guestCount),
      safeCell(e.parameter.note),
      safeCell(e.parameter.submittedAt),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Prevent values beginning with =, +, -, @ from being treated as formulas in Sheets.
function safeCell(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}
