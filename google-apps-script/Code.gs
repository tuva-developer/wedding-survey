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

const SPREADSHEET_ID = '131K8UbSR_ef9WEpdO6Flm-b2iVF7XQH_RFvUt1z2fYY';
const SHEET_NAME = 'Wedding survey';

const HEADERS = [
  'Timestamp',
  'Họ và tên',
  'Lựa chọn',
  'Mã lựa chọn',
  'Số người',
  'Lời nhắn',
  'Submitted At (client)',
];

const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';
const COLUMN_WIDTHS = [155, 180, 230, 120, 90, 320, 170];

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

    const spreadsheet = getResponsesSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    removePhoneColumnIfPresent(sheet);
    ensureResponseHeader(sheet);
    formatResponseSheet(sheet);

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1).setNumberFormat(DATE_TIME_FORMAT);
    sheet.getRange(nextRow, 7).setNumberFormat(DATE_TIME_FORMAT);
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([[
      new Date(),
      safeCell(e.parameter.fullName),
      safeCell(e.parameter.attendanceLabel),
      safeCell(e.parameter.attendance),
      safeCell(e.parameter.guestCount),
      safeCell(e.parameter.note),
      parseClientTimestamp(e.parameter.submittedAt),
    ]]);
    formatResponseSheet(sheet);

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

function getResponsesSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
}

function formatExistingResponses() {
  const spreadsheet = getResponsesSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  removePhoneColumnIfPresent(sheet);
  ensureResponseHeader(sheet);

  formatResponseSheet(sheet);
}

function parseClientTimestamp(value) {
  const text = String(value || '').trim();
  const localDateParts = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  const localTimeParts = text.match(/^(\d{1,2}):(\d{2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (localDateParts) {
    const [, day, month, year, hour, minute, second] = localDateParts;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  }

  if (localTimeParts) {
    const [, hour, minute, second, day, month, year] = localTimeParts;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? safeCell(text) : date;
}

function ensureResponseHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function removePhoneColumnIfPresent(sheet) {
  if (sheet.getLastColumn() >= 3 && sheet.getRange(1, 3).getDisplayValue() === 'Số điện thoại') {
    sheet.deleteColumn(3);
  }
}

function formatResponseSheet(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const lastColumn = HEADERS.length;

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, lastColumn)
    .setValues([HEADERS])
    .setBackground('#0f5f99')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 34);

  COLUMN_WIDTHS.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });

  sheet.getRange(1, 1, lastRow, lastColumn)
    .setWrap(true)
    .setVerticalAlignment('middle');

  if (lastRow <= 1) {
    return;
  }

  const dataRowCount = lastRow - 1;
  normalizeClientTimestamps(sheet, dataRowCount);

  sheet.getRange(2, 1, dataRowCount, lastColumn)
    .setFontColor('#2f2523')
    .setBackground('#fffdfb');
  sheet.getRange(2, 1, dataRowCount, 1)
    .setNumberFormat(DATE_TIME_FORMAT)
    .setHorizontalAlignment('center');
  sheet.getRange(2, 4, dataRowCount, 2)
    .setHorizontalAlignment('center');
  sheet.getRange(2, 7, dataRowCount, 1)
    .setNumberFormat(DATE_TIME_FORMAT)
    .setHorizontalAlignment('center');
}

function normalizeClientTimestamps(sheet, dataRowCount) {
  const submittedAtRange = sheet.getRange(2, 7, dataRowCount, 1);
  const submittedAtValues = submittedAtRange.getValues().map(([value]) => {
    if (value instanceof Date) {
      return [value];
    }

    const timestamp = parseClientTimestamp(value);
    return timestamp instanceof Date ? [timestamp] : [value];
  });

  submittedAtRange.setValues(submittedAtValues);
}

// Prevent values beginning with =, +, -, @ from being treated as formulas in Sheets.
function safeCell(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}
