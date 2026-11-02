"""Extract published aggregate tables, offline, using the Python standard library.

Original files are immutable. No individual survey records are imported.
"""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import posixpath
import xml.etree.ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'lifestyle-data'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def xlsx(filename, sheet):
    with ZipFile(BASE / 'raw' / filename) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(n.itertext()) for n in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        rels = {r.attrib['Id']: r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        workbook = ET.fromstring(z.read('xl/workbook.xml'))
        node = next(n for n in workbook.find('s:sheets', NS) if n.attrib['name'] == sheet)
        rid = node.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        target = rels[rid]
        path = target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/' + target)
        cells = {}
        for cell in ET.fromstring(z.read(path)).findall('.//s:c', NS):
            value = cell.find('s:v', NS)
            if cell.attrib.get('t') == 'inlineStr':
                val = ''.join(cell.find('s:is', NS).itertext())
            elif value is None or value.text is None:
                continue
            elif cell.attrib.get('t') == 's':
                val = strings[int(value.text)]
            elif cell.attrib.get('t') == 'str':
                val = value.text
            else:
                val = float(value.text)
                if val.is_integer():
                    val = int(val)
            cells[cell.attrib['r']] = val
        return cells


def clean(text):
    return str(text).replace('\n', '').replace(' ', '').replace('\u3000', '').strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    check = parser.parse_args().check
    sources = json.loads((BASE / 'sources.json').read_text())
    rows = []

    def add(source, table, key, label, value, unit, population, denominator, response, filename, locator, count=None):
        rows.append(dict(dataset_id=source, table=table, key=key, label=label, value=value,
                         unit=unit, population=population, denominator=denominator,
                         response_type=response, year=next(s['year'] for s in sources['datasets'] if s['id'] == source),
                         source_file=filename, source_locator=locator, count=count,
                         source_url=next(f['url'] for s in sources['datasets'] for f in s['files'] if f['name'] == filename)))

    hobbies = xlsx('sociallife-2021-hobbies.xlsx', 'A00400')
    hobby_columns = [('music', 'V'), ('instrument', 'W'), ('cooking', 'AO'), ('gardening', 'AP'),
                     ('diy', 'AQ'), ('photography', 'AT'), ('reading', 'AV'), ('manga', 'AW'),
                     ('shogi', 'AY'), ('gaming', 'BA'), ('crafts', 'AN'), ('camping', 'BC')]
    for key, col in hobby_columns:
        add('sociallife2021', '趣味・娯楽 表4', key, clean(hobbies[col+'8']), hobbies[col+'11'],
            'percent', '全国・10歳以上・男女計', '10歳以上人口（推計）', 'multiple_activity',
            'sociallife-2021-hobbies.xlsx', f'A00400!{col}8;{col}11')
    volunteer = xlsx('sociallife-2021-volunteer.xlsx', 'A00200')
    for key, col in [('volunteer_total', 'N'), ('volunteer_culture', 'S'), ('volunteer_town', 'T')]:
        add('sociallife2021', 'ボランティア活動 表2', key,
            'ボランティア活動総数' if col == 'N' else clean(volunteer[col+'8']), volunteer[col+'11'],
            'percent', '全国・10歳以上・男女計', '10歳以上人口（推計）', 'multiple_activity',
            'sociallife-2021-volunteer.xlsx', f'A00200!{col}8;{col}11')

    for fname, table, columns in [
        ('PR0706007.csv', '問7 現在の地域での付き合いの程度', [(3,'current_close'),(4,'current_some'),(6,'current_little'),(7,'current_none'),(8,'current_missing')]),
        ('PR0706008.csv', '問8 望ましい地域での付き合いの程度', [(2,'mutual'),(3,'events'),(4,'chat'),(5,'greeting'),(6,'none'),(7,'missing')])]:
        data = list(csv.reader((BASE / 'raw' / fname).read_text(encoding='utf-8-sig').splitlines()))
        assert data[3][0] == '総数' and int(data[3][1]) == 1732
        for column, key in columns:
            add('society2025', table, key, data[2][column], float(data[3][column]), 'percent',
                '全国・18歳以上の日本国籍を有する者', 1732, 'single', fname,
                f'CSV row 3 label; row 4 value; column {column+1}')

    simple = xlsx('satisfaction-2026-simple.xlsx', 'n%表')
    assert simple['C146'] == simple['C232'] == 10632
    for key, r, table in [('reliable_friends',147,'Q4-7 社会とのつながり'),
                          ('companions',149,'Q4-7 社会とのつながり'),
                          ('opportunity',151,'Q4-7 社会とのつながり'),
                          ('hobby_fulfilment',233,'Q4-13 生活の楽しさ・面白さ'),
                          ('community',236,'Q4-13 生活の楽しさ・面白さ'),
                          ('friendship',241,'Q4-13 生活の楽しさ・面白さ')]:
        add('satisfaction2026', table, key, simple[f'B{r}'], simple[f'D{r}'], 'percent',
            '全国・15〜89歳のインターネット調査回答者', 10632, 'multiple',
            'satisfaction-2026-simple.xlsx', f'n%表!B{r}:D{r}', simple[f'C{r}'])
    charts = xlsx('satisfaction-2026-charts.xlsx', 'd1-10')
    for key, r, label in [('balance_mean',27,'仕事と生活（ワークライフバランス）'),
                          ('connection_mean',48,'社会とのつながり'), ('fun_mean',92,'生活の楽しさ・面白さ')]:
        assert charts[f'I{r-1}'] == 2026
        add('satisfaction2026', '分野別満足度平均', key, label, charts[f'I{r}'], 'mean_0_10',
            '全国・15〜89歳のインターネット調査回答者', 10632, 'mean',
            'satisfaction-2026-charts.xlsx', f'd1-10!I{r}')

    files = []
    for source in sources['datasets']:
        for item in source['files']:
            blob = (BASE / 'raw' / item['name']).read_bytes()
            files.append(dict(name=item['name'], bytes=len(blob), sha256=hashlib.sha256(blob).hexdigest()))
    payload = dict(schema_version=1, retrieved_at='2026-11-02', datasets=sources['datasets'], records=rows, files=files)
    as_json = json.dumps(payload, ensure_ascii=False, indent=2) + '\n'
    output = io.StringIO(newline='')
    fields = list(rows[0])
    writer = csv.DictWriter(output, fieldnames=fields, lineterminator='\r\n')
    writer.writeheader()
    writer.writerows(rows)
    artifacts = {
        BASE / 'data.json': as_json,
        ROOT / 'lifestyle-data.js': '/* Generated from published aggregate tables. See lifestyle-data/sources.json. */\nwindow.IENEKO_LIFESTYLE_DATA = ' + as_json.rstrip() + ';\n',
        BASE / 'ieneko-lifestyle-reference.csv': '\ufeff' + output.getvalue(),
    }
    for path, content in artifacts.items():
        encoded = content.encode('utf-8')
        if check:
            assert path.read_bytes() == encoded, f'Outdated generated file: {path.relative_to(ROOT)}'
        else:
            path.write_bytes(encoded)
    print(f'Lifestyle data: {len(rows)} published aggregate values, {len(files)} source files, {"checked" if check else "built"}.')


if __name__ == '__main__':
    main()
