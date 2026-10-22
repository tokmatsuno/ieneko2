const {readFileSync,writeFileSync}=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const csv=readFileSync(path.join(root,'dist/ieneko-100.csv'),'utf8');
const json=JSON.stringify(csv).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const source=`/* Generated from dist/ieneko-100.csv. Run node scripts/build-cat-data.cjs after updating the CSV. */\nwindow.IENEKO_CAT_CSV = ${json};\n`;
const target=path.join(root,'cat-data.js');
if(process.argv.includes('--check')){
  if(readFileSync(target,'utf8')!==source)throw new Error('cat-data.js differs from the source CSV. Run node scripts/build-cat-data.cjs.');
  console.log('PASS: bundled cat data matches the source CSV exactly.');
}else{
  writeFileSync(target,source);
  console.log('Updated cat-data.js from the unchanged source CSV.');
}
