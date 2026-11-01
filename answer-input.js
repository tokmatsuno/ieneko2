/* UI-only input adapter. Geometry, saved weights and server schemas stay shared. */
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
  function score(values){
    if(!Array.isArray(values)||values.length!==3||values.some(v=>!Number.isInteger(v)||v<0||v>10))
      return {ok:false,message:'それぞれ0〜10点で選んでください。'};
    if(!values.some(v=>v>0))return {ok:false,message:'気になる答えの肉球を、ひとつ押してね。'};
    const answer=window.JourneyModel.normalize(window.JourneyModel.percentages(values));
    return {ok:true,points:values.slice(),answer};
  }
  function savedPoints(values,answer){
    const result=score(values),weights=window.JourneyModel.weights(answer);
    return result.ok&&weights&&result.answer.weights.every((v,i)=>Math.abs(v-weights[i])<1e-9)?values.slice():null;
  }
  function suggestPoints(answer){
    const weights=window.JourneyModel.weights(answer);
    if(!weights)return [0,0,0];
    const max=Math.max(...weights);
    return weights.map(v=>Math.round(v/max*10));
  }
  window.AnswerInput={parse,fromWeights,score,savedPoints,suggestPoints};
})();
