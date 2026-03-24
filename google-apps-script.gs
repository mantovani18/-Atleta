const SHEET_NAME = 'InscricoesEventos';
const SPREADSHEET_ID = '1NwESghoZFGp3MMUh74tEERFq1K8zfAPQii-j_JoVdKY';
const SCRIPT_VERSION = 'event-tabs-v2';

function doPost(e) {
  try {
    const data = parseIncomingData_(e);
    const sheet = getOrCreateSheetForEvent_(data.evento);
    ensureHeader_(sheet);

    sheet.appendRow([
      new Date(),
      valueOrEmpty_(data.nomeCompleto),
      valueOrEmpty_(data.idade),
      valueOrEmpty_(data.numero),
      valueOrEmpty_(data.posicao),
      valueOrEmpty_(data.evento),
      valueOrEmpty_(data.data),
      valueOrEmpty_(data.horario),
      valueOrEmpty_(data.origem)
    ]);

    const insertedRow = sheet.getLastRow();
    applyPosicaoStyle_(sheet, insertedRow, valueOrEmpty_(data.posicao));

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function applyPosicaoStyle_(sheet, row, posicaoRaw) {
  const posicao = normalizePosicao_(posicaoRaw);
  const posicaoCell = sheet.getRange(row, 5);

  const styleMap = {
    goleiro: { bg: '#1E88E5', fg: '#FFFFFF' },
    pivo: { bg: '#8E24AA', fg: '#FFFFFF' },
    fixo: { bg: '#43A047', fg: '#FFFFFF' },
    ala: { bg: '#FB8C00', fg: '#FFFFFF' }
  };

  const style = styleMap[posicao];

  if (!style) {
    posicaoCell.setBackground(null).setFontColor(null);
    return;
  }

  posicaoCell.setBackground(style.bg).setFontColor(style.fg);
}

function normalizePosicao_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function doGet() {
  return ContentService
    .createTextOutput('API ativa para inscrições de eventos. ' + SCRIPT_VERSION)
    .setMimeType(ContentService.MimeType.TEXT);
}

function reorganizarInscricoesPorEvento() {
  const spreadsheet = getSpreadsheet_();
  const sourceSheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) return;

  const rows = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, 9).getValues();

  rows.forEach(function (row) {
    const evento = valueOrEmpty_(row[5]);
    const posicao = valueOrEmpty_(row[4]);
    const targetSheet = getOrCreateSheetForEvent_(evento);
    ensureHeader_(targetSheet);

    targetSheet.appendRow(row);
    applyPosicaoStyle_(targetSheet, targetSheet.getLastRow(), posicao);
  });

  sourceSheet.deleteRows(2, sourceSheet.getLastRow() - 1);
}

function recolorirPosicoes() {
  const spreadsheet = getSpreadsheet_();
  const sheets = spreadsheet.getSheets();

  sheets.forEach(function (sheet) {
    if (sheet.getLastRow() < 2) return;

    const posicoes = sheet.getRange(2, 5, sheet.getLastRow() - 1, 1).getValues();

    posicoes.forEach(function (row, index) {
      const rowNumber = index + 2;
      applyPosicaoStyle_(sheet, rowNumber, row[0]);
    });
  });
}

function getOrCreateSheetForEvent_(eventoRaw) {
  const spreadsheet = getSpreadsheet_();
  const sheetName = buildEventSheetName_(eventoRaw);
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.appendRow([
    'Timestamp',
    'Nome Completo',
    'Idade',
    'Numero',
    'Posicao',
    'Evento',
    'Data',
    'Horario',
    'Origem'
  ]);
}

function buildEventSheetName_(eventoRaw) {
  const evento = valueOrEmpty_(eventoRaw) || SHEET_NAME;
  const invalidCharsRegex = /[\\\/?*\[\]:]/g;
  const cleanName = evento.replace(invalidCharsRegex, ' ').replace(/\s+/g, ' ').trim();

  if (!cleanName) return SHEET_NAME;
  return cleanName.slice(0, 99);
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID && !SPREADSHEET_ID.includes('COLE_AQUI')) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error('Planilha não encontrada. Defina SPREADSHEET_ID no Apps Script.');
  }

  return active;
}

function parseIncomingData_(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return {
      nomeCompleto: e.parameter.nomeCompleto,
      idade: e.parameter.idade,
      numero: e.parameter.numero,
      posicao: e.parameter.posicao,
      evento: e.parameter.evento,
      data: e.parameter.data,
      horario: e.parameter.horario,
      origem: e.parameter.origem
    };
  }

  const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';

  try {
    return JSON.parse(body);
  } catch (error) {
    return parseFormUrlEncoded_(body);
  }
}

function parseFormUrlEncoded_(body) {
  const result = {};
  if (!body) return result;

  body.split('&').forEach(function (pair) {
    const parts = pair.split('=');
    const key = decodeURIComponent(parts[0] || '').trim();
    const value = decodeURIComponent((parts[1] || '').replace(/\+/g, ' ')).trim();

    if (key) {
      result[key] = value;
    }
  });

  return result;
}

function valueOrEmpty_(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}
