/* The beta book contains only generated public examples, separate from real responses. */
function betaRecords_(){
  var book=SpreadsheetApp.openById(MAP2_BETA_SHEET.spreadsheet_id),records=[];
  MAP2_BETA_TOWNS.forEach(function(town){
    var sheet=book.getSheetByName(town.sheet);if(!sheet)throw Error('beta_town_sheet_missing');
    if(sheet.getLastRow()>1001)throw Error('beta_capacity');
    var rows=sheet.getRange(1,1,Math.max(1,sheet.getLastRow()),32).getValues(),headers=rows.shift();
    if(BetaDataCore.FIELDS.some(function(k){return headers.indexOf(k)<0;}))throw Error('beta_headers_invalid');
    rows.filter(function(row){return row.some(function(v){return v!=='';});}).forEach(function(row){
      var record={};headers.forEach(function(k,i){record[k]=row[i];});
      if(record.town_id!==town.id)throw Error('beta_wrong_town');
      records.push(record);
    });
  });
  records=BetaDataCore.validate(records,MAP2_BETA_TOWNS);
  records.forEach(function(r){
    var w=BetaDataCore.weights(r),x=0,y=0;w.forEach(function(a,q){a.forEach(function(v,k){x+=v*MAP2_ANCHORS[q][k][0]/5;y+=v*MAP2_ANCHORS[q][k][1]/5;});});
    if(Math.abs(x-Number(r.x))>0.000001||Math.abs(y-Number(r.y))>0.000001)throw Error('beta_coordinate_mismatch');
    var closest=MAP2_REFERENCES.reduce(function(best,c){var d=Math.pow(c.x-x,2)+Math.pow(c.y-y,2);return!best||d<best.d-1e-9||Math.abs(d-best.d)<1e-9&&c.no<best.cat.no?{cat:c,d:d}:best;},null).cat;
    if(Number(r.reference_cat_no)!==closest.no||r.reference_cat_name!==closest.name)throw Error('beta_reference_mismatch');
  });
  return records;
}
function betaGet_(params){
  var records=betaRecords_();
  if(params.town){if(!MAP2_BETA_TOWNS.some(function(t){return t.id===params.town;}))throw Error('beta_unknown_town');records=records.filter(function(r){return r.town_id===params.town;});}
  if(params.sample_id)records=records.filter(function(r){return r.sample_id===params.sample_id;});
  if(params.mode==='beta-csv')return ContentService.createTextOutput(BetaDataCore.csv(records)).setMimeType(ContentService.MimeType.CSV).downloadAsFile('ieneko-'+(params.town||'five-towns')+'-synthetic.csv');
  return map2Response_({ok:true,service:'ienekomap2',schema:BetaDataCore.SCHEMA,data_kind:BetaDataCore.KIND,source:'google_sheets',spreadsheet_url:MAP2_BETA_SHEET.url,towns:MAP2_BETA_TOWNS,records:records,counts:MAP2_BETA_TOWNS.map(function(t){return{town_id:t.id,n:records.filter(function(r){return r.town_id===t.id;}).length};}),license:'CC BY 4.0',attribution:BetaDataCore.TEAM},params.callback);
}
