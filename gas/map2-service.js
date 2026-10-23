/* Appended to the shared aggregation core and the CSV-derived answer anchors. */
function doGet(e){return e&&e.parameter&&e.parameter.api==='ieneko2'?map2Get_(e):legacyDoGet(e);}
function doPost(e){var input;try{input=JSON.parse(e&&e.postData&&e.postData.contents||'{}');}catch(_){input={};}return input.api==='ieneko2'?map2Post_(input):legacyDoPost(e);}
function setupIenekoMap2(){
  var props=PropertiesService.getScriptProperties(),id=props.getProperty('IENEKO_MAP2_SHEET_ID');
  var book=id?SpreadsheetApp.openById(id):SpreadsheetApp.create('家猫MAP2 匿名回答（非公開）');
  if(!id){book.getSheets()[0].setName('responses');props.setProperty('IENEKO_MAP2_SHEET_ID',book.getId());}
  ['responses','verification'].forEach(function(name){var sh=book.getSheetByName(name)||book.insertSheet(name);if(!sh.getLastRow()){sh.appendRow(['record_id','record_json']);sh.setFrozenRows(1);}});
  console.log(JSON.stringify({ok:true,spreadsheetId:book.getId(),url:book.getUrl(),service:'ienekomap2'}));
  return book.getId();
}
function map2Book_(){var id=PropertiesService.getScriptProperties().getProperty('IENEKO_MAP2_SHEET_ID');if(!id)throw Error('collection_not_configured');return SpreadsheetApp.openById(id);}
function map2Has_(book,id,name){var sh=book.getSheetByName(name);if(!sh||sh.getLastRow()<2)return false;return Boolean(sh.getRange(2,1,sh.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).findNext());}
function map2Records_(book,name){var sh=book.getSheetByName(name);return sh&&sh.getLastRow()>1?sh.getRange(2,2,sh.getLastRow()-1,1).getValues().map(function(r){return JSON.parse(r[0]);}):[];}
function map2Get_(e){
  var p=e.parameter||{},out;
  try{
    if(p.mode==='beta'||p.mode==='beta-csv')return betaGet_(p);
    if(p.mode==='health')out={ok:true,service:'ienekomap2',version:'2.15',ready:Boolean(PropertiesService.getScriptProperties().getProperty('IENEKO_MAP2_SHEET_ID')),minimum_group_size:5,public_cat_schema:PublicCatData.SCHEMA,csv:'?api=ieneko2&mode=csv',beta_schema:BetaDataCore.SCHEMA,beta_csv:'?api=ieneko2&mode=beta-csv'};
    else if(p.mode==='receipt'){
      if(!/^[a-zA-Z0-9_-]{12,80}$/.test(p.id||''))throw Error('invalid_id');
      var book=map2Book_(),verified=map2Has_(book,p.id,'verification'),accepted=verified||map2Has_(book,p.id,'responses');
      var record=accepted?map2Records_(book,verified?'verification':'responses').find(function(r){return r.id===p.id;}):null;
      out={ok:true,accepted:accepted,test:verified,published:Boolean(record&&record.consent===PublicCatData.CONSENT&&record.public_id),public_id:record&&record.public_id||null};
    }else if(p.mode==='cats'||p.mode==='csv'){
      var proof=p.proof==='1',cats=PublicCatData.project(map2Records_(map2Book_(),proof?'verification':'responses'),MAP2_REFERENCES,proof);
      if(p.public_id)cats=cats.filter(function(c){return c.public_id===p.public_id;});
      if(p.mode==='csv')return ContentService.createTextOutput(PublicCatData.csv(cats,proof)).setMimeType(ContentService.MimeType.CSV).downloadAsFile(proof?'ieneko-cats-verification.csv':'ieneko-cats.csv');
      out=PublicCatData.envelope(cats,proof);
    }else{
      var sh=map2Book_().getSheetByName('responses'),records=[];
      if(sh.getLastRow()>1)records=sh.getRange(2,2,sh.getLastRow()-1,1).getValues().map(function(r){return JSON.parse(r[0]);});
      out=Object.assign({ok:true,service:'ienekomap2'},OpenDataCore.envelope(OpenDataCore.aggregate(records)));
    }
  }catch(err){out={ok:false,service:'ienekomap2',error:String(err.message||err)};}
  return map2Response_(out,p.callback);
}
function map2Post_(input){
  var lock=LockService.getScriptLock();
  try{
    var record=OpenDataCore.record(input,MAP2_ANCHORS,new Date());
    if(!lock.tryLock(10000))throw Error('busy');
    var book=map2Book_(),name=record.test?'verification':'responses',sh=book.getSheetByName(name);
    if(sh.getLastRow()>20000)throw Error('collection_capacity_reached');
    if(!map2Has_(book,record.id,name)){if(record.consent===PublicCatData.CONSENT)record.public_id=Utilities.getUuid();sh.appendRow([record.id,JSON.stringify(record)]);}
    return map2Response_({ok:true,accepted:true,test:record.test});
  }catch(err){return map2Response_({ok:false,error:String(err.message||err)});}
  finally{if(lock.hasLock())lock.releaseLock();}
}
function map2Response_(data,callback){
  var json=JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  if(callback&&/^[a-zA-Z_$][\w$]{0,80}$/.test(callback))return ContentService.createTextOutput(callback+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
