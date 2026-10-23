const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const records = new Map(), storage = new Map();
let acknowledge = true, posts = 0, serial = 0;
const context = vm.createContext({
  window: {IENEKO_CONFIG: {openDataUrl: 'https://example.test/exec'}},
  localStorage: {getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value)},
  crypto: {randomUUID: () => `storage-record-${++serial}`},
  URL, AbortController, clearTimeout, setTimeout: (fn, ms) => setTimeout(fn, ms === 700 ? 0 : ms),
  fetch: async (url, options) => {
    if (options.method === 'POST') {
      posts++;
      const record = JSON.parse(options.body);
      assert.equal(record.api, 'ieneko2');
      assert.equal(record.consent, 'aggregate-ccby-v1');
      assert.equal('name' in record, false);
      assert.equal('playerId' in record, false);
      records.set(record.id, record);
      return {};
    }
    const params = new URL(url).searchParams;
    return {ok: true, json: async () => params.get('mode') === 'health'
      ? {ok: true, service: 'ienekomap2', ready: true}
      : {ok: true, accepted: acknowledge && records.has(params.get('id')), test: records.get(params.get('id'))?.test || false}};
  },
});
for (const file of ['opendata-core.js', 'map-data-client.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
const api = context.MapDataClient;
const anchors = Array.from({length: 5}, () => [[1, 1], [5, 5], [9, 9]]);
const fields = {weights: Array.from({length: 5}, () => [.2, .3, .5]), region: '千代田区', event: 'test-storage', grid: null, supports: [0, 2], consent: 'aggregate-ccby-v1', test: true};
(async () => {
  const first = await api.contribute(fields, anchors);
  assert.equal(first.synced, true);
  assert.equal(first.test, true);
  assert.equal(records.size, 1);
  assert.equal(records.get(first.id).weights.length, 5);
  assert.ok(Math.abs(records.get(first.id).x - 6.2) < 1e-10);
  assert.ok(api.local()[0].confirmedAt > 0);
  const again = await api.contribute({...fields, supports: [2, 0]}, anchors);
  assert.equal(again.id, first.id, 'Repeating the same response must reuse its record ID');
  assert.equal(records.size, 1);
  const real = await api.contribute({...fields, test: false}, anchors);
  assert.notEqual(real.id, first.id, 'Verification and real responses must stay separate');
  assert.equal(real.test, false);
  acknowledge = false;
  const pending = {...fields, event: 'receipt-failure'};
  await assert.rejects(api.contribute(pending, anchors), /保存を確認できません/);
  const unsynced = api.previous(pending);
  assert.equal(unsynced.synced, false, 'An opaque POST result is not proof of storage');
  acknowledge = true;
  const retried = await api.contribute(pending, anchors);
  assert.equal(retried.id, unsynced.id, 'A failed receipt must not create a new response on retry');
  assert.equal(retried.synced, true);
  const before = posts;
  await assert.rejects(api.contribute({...fields, consent: ''}, anchors), /同意/);
  assert.equal(posts, before, 'Without consent no request may be sent');
  console.log('PASS: five weighted answers reach shared storage, receipt required, stable retry ID, cross-page duplicate prevention, verification isolation and consent.');
})().catch(error => {console.error(error); process.exitCode = 1;});
