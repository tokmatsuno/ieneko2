const fs=require('node:fs'),path=require('node:path'),core=require('../region-data-core.js'),root=path.resolve(__dirname,'..'),dir=path.join(root,'ienekomap2/beta/regional-data');
const sources=JSON.parse(fs.readFileSync(path.join(dir,'sources.json'),'utf8')),stat=sources.statistic;
const items=core.parseCSV(fs.readFileSync(path.join(dir,'municipalities.csv'),'utf8'));
const columns=['code','prefecture','name',...core.METRICS],dataset={schema:'ieneko-regions-1.0',source:stat,fetched_on:sources.fetched_on,columns,rows:items.map(row=>columns.map(k=>core.METRICS.includes(k)?Number(row[k]):row[k])),place_sources:sources.place_sources,places:[]};
core.profiles(dataset);if(items.length!==stat.municipality_count)throw Error('Municipality count mismatch');
const seen=new Set();
for(const row of core.parseCSV(fs.readFileSync(path.join(dir,'places.csv'),'utf8'))){
 const source=sources.place_sources.find(s=>s.id===row.source_id);if(!source)throw Error('Unknown source');
 if(seen.has(row.id))throw Error('Duplicate facility');seen.add(row.id);
 const lat=row.lat.trim()?Number(row.lat):null,lon=row.lon.trim()?Number(row.lon):null;
 if((lat!==null||lon!==null)&&(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<20||lat>46||lon<122||lon>154))throw Error('Invalid facility location: '+row.id);
 dataset.places.push({...row,lat,lon,kind:'facility',category:row.category||core.category(row.name),category_basis:row.category?'提供元のデータ分類':'名称による分類',url:core.safeURL(row.url),data_kind:'official_open_data'});
}
const output='window.IENEKO_REGIONS = '+JSON.stringify(dataset)+';\n',file=path.join(root,'ienekomap2/beta/region-data.js');
if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==output)throw Error('Regenerate region-data.js');}else fs.writeFileSync(file,output);
console.log(`PASS: ${dataset.rows.length} source-derived municipalities, ${dataset.places.length} facilities, field years and source attribution preserved.`);
