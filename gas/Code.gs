const LOG_SHEET = '冒険ログ';
const ONLINE_WINDOW_MS = 4 * 60 * 1000;

function legacyDoGet(e) {
  const p = (e && e.parameter) || {};
  if (p.mode !== 'map') return json_({ ok: true, service: 'ieneko2', map: '?mode=map&callback=name' });
  const players = getPlayers_();
  const body = JSON.stringify(players);
  const callback = String(p.callback || '');
  if (callback && /^[A-Za-z_$][\w$]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + body + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(players);
}

function legacyDoPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    const data = JSON.parse(raw || '{}');
    const event = String(data.event || 'answer');
    if (!['presence', 'answer', 'complete', 'leave'].includes(event)) return json_({ ok: false, error: 'unsupported_event' });
    const playerId = String(data.playerId || '').slice(0, 80);
    if (event !== 'complete' && !playerId) return json_({ ok: false, error: 'player_id_required' });
    const step = Math.max(1, Math.min(5, Number(data.step) || 1));
    const place = String(data.place || '').slice(0, 40);
    const catNo = Math.max(1, Math.min(100, Number(data.catNo) || 1));
    const name = cleanName_(data.name);
    const trait = ['kind', 'brave', 'wise'].includes(data.trait) ? data.trait : '';
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet_();
      sheet.appendRow([new Date(), playerId, name, step, place, catNo, event, trait]);
      trimOldRows_(sheet);
    } finally {
      lock.releaseLock();
    }
    if (event === 'complete') notifyDiscord_(step, place, catNo);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'request_failed' });
  }
}

function getPlayers_() {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const rows = sheet.getRange(2, 1, last - 1, 8).getValues();
  const latest = new Map();
  rows.forEach(row => {
    const [time, id, name, step, place, catNo, event] = row;
    if (!id || !(time instanceof Date)) return;
    const previous = latest.get(String(id));
    if (!previous || time > previous.time) latest.set(String(id), { time, name, step, place, catNo, event });
  });
  const cutoff = Date.now() - ONLINE_WINDOW_MS;
  return Array.from(latest.values())
    .filter(p => p.event !== 'leave' && p.time.getTime() >= cutoff)
    .slice(-120)
    .map(p => ({ name: cleanName_(p.name), step: Number(p.step) || 1, place: String(p.place || ''), catNo: Number(p.catNo) || 1 }));
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID');
  let book;
  if (id) book = SpreadsheetApp.openById(id);
  else book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('Set SPREADSHEET_ID in script properties or bind this project to a spreadsheet.');
  let sheet = book.getSheetByName(LOG_SHEET);
  if (!sheet) {
    sheet = book.insertSheet(LOG_SHEET);
    sheet.appendRow(['記録時刻', '参加ID', '表示名', '地点', '物語の場所', '家猫No', 'イベント', '回答の力']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function trimOldRows_(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return;
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const timestamps = sheet.getRange(2, 1, last - 1, 1).getValues();
  let deleteCount = 0;
  while (deleteCount < timestamps.length && timestamps[deleteCount][0] instanceof Date && timestamps[deleteCount][0].getTime() < cutoff) deleteCount++;
  if (deleteCount) sheet.deleteRows(2, deleteCount);
}

function notifyDiscord_(step, place, catNo) {
  const webhook = PropertiesService.getScriptProperties().getProperty('DISCORD_WEBHOOK_URL');
  if (!webhook) return;
  const content = '🐾 家猫クエストに冒険の記録が届きました。5つの地点を歩き、家猫 No.' + String(catNo).padStart(3, '0') + ' が誕生しました。';
  UrlFetchApp.fetch(webhook, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ content }),
    muteHttpExceptions: true
  });
}

function cleanName_(value) {
  return String(value || 'たびねこ').replace(/[<>@`\\]/g, '').trim().slice(0, 16) || 'たびねこ';
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
