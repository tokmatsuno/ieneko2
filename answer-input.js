/* UI-only ratio input adapter. Geometry, saved answers and server schemas stay shared. */
(function(){
  function parse(raw){
    if(!Array.isArray(raw)||raw.length!==3)return {ok:false,message:'A・B・Cの3つの数値を入力してください。',invalid:[0,1,2]};
    const values=raw.map(value=>{
      const text=String(value??'').normalize('NFKC').trim();
      return text===''?0:/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)?Number(text):NaN;
    });
    const invalid=values.flatMap((value,i)=>!Number.isFinite(value)||value<0||value>100?[i]:[]);
    if(invalid.length)return {ok:false,message:'入力値は0〜100の数字にしてください。小数も使えます。',invalid};
    const total=values.reduce((sum,value)=>sum+value,0);
    if(!total)return {ok:false,message:'A・B・Cのどれかに、0より大きい数を入れてください。',invalid:[]};
    const weights=window.JourneyModel.weights(values);
    return {ok:true,values,total,weights,percentages:window.JourneyModel.percentages(weights)};
  }
  function fromWeights(value){
    return window.JourneyModel.percentages(value);
  }
  window.AnswerInput={parse,fromWeights};
})();
