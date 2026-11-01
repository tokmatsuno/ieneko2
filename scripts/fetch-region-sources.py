"""Refresh public app data from official sources; preserve field years and provenance."""
import csv
import datetime
import hashlib
import io
import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEST = ROOT / 'ienekomap2/beta/regional-data'
DEST.mkdir(parents=True, exist_ok=True)
TODAY = datetime.date.today().isoformat()

def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 IenekoOpenData/2.17'})
    return urllib.request.urlopen(request, timeout=40).read()

def decode(raw):
    try:
        return raw.decode('utf-8-sig')
    except UnicodeDecodeError:
        return raw.decode('cp932')

def write_csv(name, rows):
    with (DEST / name).open('w', encoding='utf-8-sig', newline='') as target:
        csv.writer(target, lineterminator='\n').writerows(rows)

url = 'https://www.nstac.go.jp/files/SSDSE-A-2026.csv'
raw = fetch(url)
rows = list(csv.reader(io.StringIO(decode(raw))))
codes, years, labels = rows[:3]
fields = [('population', 'A1101'), ('under15', 'A1301'), ('working_age', 'A1302'), ('over65', 'A1303'),
          ('households', 'A7101'), ('general_households', 'A710101'), ('single_households', 'A810105'),
          ('libraries', 'G1401'), ('community_centres', 'G1201')]
columns = ['code', 'prefecture', 'name'] + [key for key, _ in fields]
selected = [[row[0][1:], row[1], row[2]] + [row[codes.index(code)] for _, code in fields] for row in rows[3:]]
assert len(selected) == 1741 and len({row[0] for row in selected}) == 1741
write_csv('municipalities.csv', [columns] + selected)
manifest = {'schema': 'ieneko-region-sources-1.0', 'fetched_on': TODAY, 'statistic': {
    'id': 'ssdse-a-2026', 'title': '統計センター SSDSE-A-2026（市区町村）',
    'url': 'https://www.nstac.go.jp/use/literacy/ssdse/', 'data_url': url,
    'definition_url': 'https://www.nstac.go.jp/files/kaisetsu-A-2026.pdf',
    'license': 'CC-BY-4.0', 'license_url': 'https://www.nstac.go.jp/info/site-policy/',
    'attribution': '独立行政法人 統計センター SSDSE-A-2026を加工して作成',
    'published_on': '2026-06-30', 'raw_sha256': hashlib.sha256(raw).hexdigest(), 'municipality_count': len(selected),
    'scope': '2025年3月31日時点の1,741市区町村。政令指定都市は市全体。東京都特別区は区単位。町内会や町丁目の統計ではありません。',
    'fields': [{'key': key, 'code': code, 'label': labels[codes.index(code)], 'year': int(years[codes.index(code)]),
                'unit': '人' if key in ['population', 'under15', 'working_age', 'over65'] else '世帯' if 'household' in key else '施設',
                'origin': '総務省統計局 国勢調査' if code.startswith('A') else '文部科学省 社会教育調査'} for key, code in fields]
}, 'place_sources': []}

place_rows = []
headers = ['id', 'municipality_code', 'name', 'address', 'lat', 'lon', 'url', 'hours', 'food', 'source_id', 'category']
package = json.loads(fetch('https://data.bodik.jp/api/3/action/package_show?id=401307_ftoshiken_public_facility'))['result']
for resource in [r for r in package['resources'] if r['format'].upper() == 'CSV']:
    category = 'library' if '図書館' in resource['name'] else 'sports' if 'スポーツ' in resource['name'] else 'culture'
    source_id = 'fukuoka-' + category + ('-museum' if '美術館' in resource['name'] else '')
    content = fetch(resource['url'])
    manifest['place_sources'].append({'id': source_id, 'title': '福岡市 ' + resource['name'],
        'url': 'https://data.bodik.jp/dataset/401307_ftoshiken_public_facility', 'data_url': resource['url'],
        'updated': resource['last_modified'][:10], 'updated_label': 'リソース更新日', 'license': 'CC BY',
        'license_url': package['license_url'], 'attribution': '福岡市 公共施設一覧（福岡都市圏共通フォーマット）を加工して作成',
        'raw_sha256': hashlib.sha256(content).hexdigest(), 'fetched_on': TODAY})
    for i, r in enumerate(csv.DictReader(io.StringIO(decode(content)))):
        place_rows.append([source_id + ':' + (r.get('NO') or str(i+1)), '40130', r['名称'], r['住所'], r['緯度'], r['経度'],
                           r.get('URL', ''), r.get('利用可能時間特記事項', ''), '', source_id, category])

url = 'https://www.city.hachioji.tokyo.jp/contents/open/002/p035934_d/fil/132012_public_facility.csv'
content = fetch(url)
manifest['place_sources'].append({'id': 'hachioji-public', 'title': '八王子市 公共施設一覧',
    'url': 'https://www.city.hachioji.tokyo.jp/contents/open/002/p035934.html', 'data_url': url,
    'updated': '2025-08-20', 'updated_label': '公開ページ更新日（CSVの更新日とは限りません）',
    'license': 'CC-BY-4.0', 'license_url': 'https://www.city.hachioji.tokyo.jp/contents/open/002/p035934.html',
    'attribution': '八王子市 公共施設一覧 CC BY 4.0を加工して作成',
    'raw_sha256': hashlib.sha256(content).hexdigest(), 'fetched_on': TODAY})
for r in csv.DictReader(io.StringIO(decode(content))):
    if not r.get('名称', '').strip():
        continue
    place_rows.append(['hachioji:' + r['ID'], '13201', r['名称'], r['所在地_連結表記'], r['緯度'], r['経度'],
                       r.get('URL', ''), r.get('利用可能時間特記事項', ''), r.get('飲食可否', ''), 'hachioji-public', ''])
write_csv('places.csv', [headers] + place_rows)
(DEST / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Fetched {len(selected)} municipalities and {len(place_rows)} facility rows from {len(manifest["place_sources"])} public CSV sources.')
