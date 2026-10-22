/* Preserve the original raster artwork. Color changes are display effects only. */
(function () {
  const themes = [
    {key:'grove',name:'木もれびのアトリエ',ink:'#244b42',light:'#e2e7da',gold:'#dfbd7c',coats:[[61,60,57],[92,82,67],[105,109,107]],names:['白黒','こげ茶と白','墨灰と白']},
    {key:'sun',name:'ひだまりのアトリエ',ink:'#78503b',light:'#f5e0bd',gold:'#e4c085',coats:[[163,112,68],[143,91,53],[175,142,99]],names:['茶白','赤茶と白','砂色と白']},
    {key:'moon',name:'月あかりのアトリエ',ink:'#424b58',light:'#e4e6e8',gold:'#d9c48f',coats:[[83,89,96],[107,111,116],[124,117,106]],names:['青灰と白','銀灰と白','灰茶と白']},
    {key:'rose',name:'花だよりのアトリエ',ink:'#684c43',light:'#eee1d5',gold:'#dfbc87',coats:[[112,83,65],[133,101,76],[151,129,101]],names:['こげ茶と白','栗色と白','淡い茶と白']},
  ];
  const eyes=[{name:'琥珀の瞳',color:[212,170,53]},{name:'翡翠の瞳',color:[102,153,110]},{name:'青い瞳',color:[112,158,179]}];
  const sources={hello:'dist/mike-main-visual.png',scared:'dist/cat-scared.png',hungry:'dist/cat-hungry.png',curious:'dist/cat-curious.png',resting:'dist/cat-resting.png'};
  const poseNames={hello:'手をあげて、ごあいさつ',scared:'ちょっと、どきどき',hungry:'ごはんを待つ',curious:'そっと、のぞきこむ',resting:'丸くなって、ひと休み'};
  const eyeBounds={hello:[.28,.07,.74,.24],scared:[.22,.15,.66,.34],hungry:[.30,.10,.76,.30],curious:[.12,.37,.55,.64],resting:null};
  Object.assign(sources,{
    bristling:'dist/cat-bristling.png',drunken:'dist/cat-drunken.png',oppappi:'dist/cat-oppappi.png',scooter:'dist/cat-scooter.png',napping:'dist/cat-napping.png','sports-car':'dist/cat-sports-car.png',guitar:'dist/cat-guitar.png',reading:'dist/cat-reading.png',gardening:'dist/cat-gardening.png',
  });
  Object.assign(poseNames,{bristling:'びっくり、毛が逆立つ',drunken:'ふらり、酔拳風',oppappi:'はいオッパッピー風',scooter:'キックボードでおでかけ',napping:'ごろんと、昼寝','sports-car':'スポーツカーで気ままに',guitar:'ぽろんと、ギター',reading:'本をひらいて、読み聞かせ',gardening:'小さな庭を育てる'});
  const poseShortNames={hello:'ごあいさつ',curious:'のぞきこむ',scared:'どきどき',hungry:'ごはん待ち',resting:'ひと休み',bristling:'総毛立ち',drunken:'酔拳風',oppappi:'オッパッピー風',scooter:'キックボード',napping:'昼寝','sports-car':'スポーツカー',guitar:'ギター',reading:'読み聞かせ',gardening:'庭づくり'};
  Object.assign(eyeBounds,{bristling:[.16,.42,.42,.51],drunken:[.49,.13,.75,.25],oppappi:[.43,.15,.67,.25],scooter:[.35,.09,.58,.17],napping:null,'sports-car':[.54,.16,.70,.24],guitar:[.35,.16,.60,.25],reading:[.41,.14,.67,.25],gardening:[.44,.17,.67,.28]});
  const quadrants=[
    {key:'grove',title:'まちで、みんなと',note:'小さな庭づくり、にぎやかなごあいさつ。まちで楽しみを分け合う一日。',poses:['gardening','oppappi','scooter','hello','curious']},
    {key:'sun',title:'まちで、自分らしく',note:'気になる方へ、ちょっと遠回り。乗り物や体の動きで楽しむ一日。',poses:['sports-car','scooter','drunken','bristling']},
    {key:'moon',title:'おうちで、だれかと',note:'ギター、本、おしゃべり。好きなものを分け合う、あたたかな一日。',poses:['guitar','reading','oppappi','hungry','hello']},
    {key:'rose',title:'おうちで、気ままに',note:'昼寝も、ひとり演奏会も、ふらりと酔拳も。気分で過ごす一日。',poses:['napping','bristling','guitar','reading','drunken','resting','scared']},
  ];
  const quadrantFor=p=>(p.y>=5?2:0)+(p.x>=5?1:0);
  function poseFor(point,route=0){const pool=quadrants[quadrantFor(point)].poses;const hash=Array.isArray(route)?route.reduce((v,c)=>(v*5+c+2)>>>0,7):Math.abs(Number(route)||0);return pool[hash%pool.length];}
  const cache=new Map(),loaded=new Map();
  const coatNames=[['白猫','白黒ぶち猫','三毛猫'],['黒猫','白黒猫','さび猫'],['茶猫','茶白猫','茶トラ猫']];
  const landmarks={hello:[[.49,.17],[.50,.50],[.87,.50],[.48,.86]],scared:[[.44,.27],[.49,.53],[.81,.59],[.48,.82]],hungry:[[.53,.22],[.52,.52],[.20,.79],[.50,.78]],curious:[[.33,.52],[.67,.54],[.83,.23],[.51,.80]],resting:[[.48,.31],[.55,.61],[.76,.72],[.31,.76]]};
  Object.assign(landmarks,{
    bristling:[[.29,.48],[.65,.58],[.90,.24],[.54,.91]],drunken:[[.60,.20],[.52,.52],[.78,.65],[.49,.94]],oppappi:[[.55,.23],[.55,.56],[.23,.52],[.52,.93]],scooter:[[.46,.15],[.57,.53],[.86,.46],[.56,.80]],napping:[[.26,.24],[.64,.58],[.65,.83],[.60,.80]],'sports-car':[[.62,.23],[.62,.39],[.87,.33],[.53,.42]],guitar:[[.48,.22],[.52,.56],[.84,.73],[.55,.87]],reading:[[.52,.19],[.51,.56],[.25,.85],[.60,.87]],gardening:[[.54,.23],[.63,.57],[.85,.53],[.68,.92]],
  });
  function derive(answers,quests,point) {
    const choices=Array.from({length:5},(_,i)=>answers[i]?.choice??-1);
    const selected=choices.map((c,i)=>c>=0?quests[i]?.answers[c]:null).filter(Boolean);
    const p=point||(selected.length?{x:selected.reduce((v,a)=>v+a.x,0)/selected.length,y:selected.reduce((v,a)=>v+a.y,0)/selected.length}:{x:5,y:5});
    const quadrant=quadrantFor(p),theme=themes[quadrant];
    const family=choices[0],pattern=Math.max(0,choices[1]),layout=Math.max(0,choices[2]),density=Math.max(0,choices[3]),eye=choices[4];
    const finalPose=choices.some(c=>c>=0)?poseFor(p,choices):'hello';
    const name=family<0?'原画の白黒猫':coatNames[family][pattern];
    const values=[name,choices[1]<0?'まだ模様を選んでいません':[['単色','黒のぶち','黒と茶のぶち'],['単色','白い胸と足','茶色のまだら'],['単色','白い胸と足','しま模様']][Math.max(0,family)][pattern],choices[2]<0?'基本の模様の位置':['顔と背中に模様','体と尻尾に模様','左右に違う模様'][layout],poseShortNames[finalPose]+'・'+['小ぶち','中ぶち','大ぶち'][density],eye<0?'原画の金色の瞳':eyes[eye].name];
    return {theme,quadrant,choices,family,pattern,layout,density,eye,finalPose,name,values,labels:['毛色','模様','模様の位置','姿・広さ','瞳'],signature:choices.map(c=>c<0?'0':c+1).join(''),point:p,iris:eye<0?null:eyes[eye].color,seed:choices.reduce((v,c,i)=>v+(c+1)*[1,3,11,37,101][i],0)};
  }
  function withPose(a,pose){if(!sources[pose])return a;const values=a.values.slice();values[3]=poseShortNames[pose]+'・'+['小ぶち','中ぶち','大ぶち'][a.density];return{...a,finalPose:pose,values};}
  function valuesText(a){return a.values.join('、');}
  function sourceFor(pose){return pose==='clock'?'dist/cat-clock.png':sources[pose]||sources.hello;}
  function load(src){if(!loaded.has(src))loaded.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{loaded.delete(src);reject(new Error('artwork_load'));};img.src=src;}));return loaded.get(src);}
  function smooth(lo,hi,x){const t=Math.max(0,Math.min(1,(x-lo)/(hi-lo)));return t*t*(3-2*t);}
  function patch(nx,ny,cx,cy,rx,ry,seed){
    const dx=(nx-cx)/rx,dy=(ny-cy)/ry;
    const edge=dx*dx+dy*dy+.15*Math.sin(nx*53+seed)*Math.sin(ny*47+seed*.7)+.08*Math.sin(nx*97+ny*71+seed);
    return 1-smooth(.82,1.04,edge);
  }
  function coatWeights(x,y,a,pose,lum){
    // White, black and ginger pigment, clipped by the original painted fur.
    const originalLight=smooth(145,215,lum);
    if(a.pattern===0)return a.family===0?[1,0,0]:a.family===1?[0,1,0]:[0,0,1];
    const marks=landmarks[pose]||landmarks.hello,spread=[.72,1,1.28][a.density];
    const shift=(a.eye===0?-.035:a.eye===1?.035:0),jitter=Math.sin(a.seed)*.025;
    const head=marks[0],body=marks[1],tail=marks[2];
    const one=patch(x,y,head[0]+shift+jitter-.07,head[1]-.045,.115*spread,.14*spread,a.seed);
    const two=patch(x,y,body[0]+(a.layout===0?-.13:.11),body[1]+jitter,.17*spread,.16*spread,a.seed+13);
    const three=patch(x,y,tail[0]+shift,tail[1],.095*spread,.18*spread,a.seed+23);
    const extra=a.layout===2?patch(x,y,body[0]-.16,body[1]+.24,.12*spread,.10*spread,a.seed+41):0;
    if(a.family===0){
      if(a.pattern===1){const black=Math.max(one,two,three,extra);return[1-black,black,0];}
      const black=Math.max(a.layout===1?two:one,extra),ginger=Math.max(a.layout===1?one:two,three)*(1-black);
      return[Math.max(0,1-black-ginger),black,ginger];
    }
    if(a.family===1){
      if(a.pattern===1){const white=Math.max(originalLight,extra*.8);return[white,1-white,0];}
      const ginger=Math.max(one,two,three,extra);return[0,1-ginger,ginger];
    }
    if(a.pattern===1){const white=Math.max(originalLight,extra*.9);return[white,0,1-white];}
    // Curving tabby stripes follow the coat and retain the source brush texture.
    const stripe=(.5+.5*Math.sin(y*(72+a.density*9)+Math.sin(x*18+a.seed)*2.1+x*14));
    const dark=smooth(.73,.91,stripe)*.60*(1-originalLight*.65);
    return[0,dark,1-dark];
  }
  function inPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}return inside;}
  function protectedProp(x,y,pose){
    if(pose==='sports-car')return y>.52||(x<.40&&y>.30)||((x-.51)**2+(y-.426)**2<.0105&&!(x<.48&&y<.40))||(x>.73&&x<.83&&y>.35&&y<.52);
    if(pose==='scooter')return y>.84||(Math.abs(x-(.40-.32*y))<.038&&y>.37&&y<.83)||((y>.31&&y<.39&&x>.07&&x<.52)&&!((x>.1&&x<.23&&y<.35)||(x>.35&&x<.47&&y<.38)));
    if(pose==='guitar'){const body=((x-.29)/.29)**2+((y-.59)/.20)**2<1.04&&!(((x-.23)/.13)**2+((y-.49)/.07)**2<1);const neck=x>.38&&x<.99&&Math.abs(y-(.75-.45*x))<.055&&!(x>.64&&x<.78&&y>.39&&y<.52);return body||neck;}
    if(pose==='reading')return inPolygon(x,y,[[.20,.45],[.56,.52],[.88,.42],[.82,.62],[.58,.75],[.28,.64]]);
    if(pose==='gardening')return inPolygon(x,y,[[.02,.40],[.18,.36],[.34,.50],[.29,.60],[.03,.61]])||(x>.21&&x<.48&&y>.74)||(x>.29&&x<.36&&y>.55&&y<.75);
    return false;
  }
  // No shapes are drawn over the cat: only the original fur pixels change pigment.
  function recolor(data,width,height,a,pose){
    const bounds=eyeBounds[pose]||eyeBounds.hello;
    const luminance=new Float32Array(width*height);
    for(let i=0;i<data.length;i+=4)luminance[i/4]=.299*data[i]+.587*data[i+1]+.114*data[i+2];
    for(let i=0;i<data.length;i+=4){
      const alpha=data[i+3];if(alpha<160)continue;
      const r=data[i],g=data[i+1],b=data[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b),lum=.299*r+.587*g+.114*b;
      const x=(i/4%width)/width,y=Math.floor(i/4/width)/height;
      const isEye=!['resting','napping'].includes(pose)&&bounds&&x>bounds[0]&&x<bounds[2]&&y>bounds[1]&&y<bounds[3]&&r>100&&g>70&&r-b>48&&g-b>24&&g/r>.58&&(max-min)/max>.5&&b<r*.5;
      if(isEye){if(a.iris){const light=lum/160;const weight=smooth(30,80,max-min);for(let j=0;j<3;j++)data[i+j]=Math.max(0,Math.min(255,data[i+j]*(1-weight)+a.iris[j]*light*weight));}continue;}
      if(a.family<0)continue;
      // Pink nose, ears and mouth, the sapling, the bowl, ink and whisker highlights stay original.
      const chroma=max?(max-min)/max:0;
      if(protectedProp(x,y,pose)||(chroma>.40&&!['hello','scared','hungry','curious','resting','clock'].includes(pose)))continue;
      const skin=(r-g>25&&r-b>15&&b>=g*.90&&g<210&&chroma>.22);
      const plant=(g>r*1.06&&g>b*1.18&&chroma>.27);
      if((pose==='clock'&&x>.39&&x<.56&&y>.34&&y<.46)||skin||plant||(pose==='hungry'&&y>.82&&x>.28&&x<.80))continue;
      const weight=smooth(24,57,lum)*(1-smooth(249,255,lum));
      if(weight<.005)continue;
      const n=i/4,left=luminance[Math.max(0,n-2)],right=luminance[Math.min(luminance.length-1,n+2)],up=luminance[Math.max(0,n-width*2)],down=luminance[Math.min(luminance.length-1,n+width*2)];
      const fineHighlight=lum>230&&chroma<.16&&((left<lum-60&&right<lum-60)||(up<lum-60&&down<lum-60));
      if(fineHighlight)continue;
      const grain=Math.max(-25,Math.min(40,(lum-(left+right+up+down)/4)*.6));
      const pigments=coatWeights(x,y,a,pose,lum);
      const light=.65+.35*Math.sqrt(lum/255),dark=.48+.65*(lum/255);
      const colors=[[248*light,241*light,226*light],[52*dark,48*dark,44*dark],[191*light,125*light,65*light]];
      for(let j=0;j<3;j++){
        const pigment=colors.reduce((v,c,k)=>v+c[j]*pigments[k],0)+grain*(1-pigments[0]*.6);
        data[i+j]=Math.max(0,Math.min(255,data[i+j]*(1-weight)+pigment*weight));
      }
    }
    return data;
  }
  function render(a,pose=a.finalPose){
    const src=sourceFor(pose);if(a.family<0&&!a.iris)return Promise.resolve(src);
    const key=[src,a.signature,a.quadrant].join('|');
    if(!cache.has(key)){
      const task=load(src).then(img=>{const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);recolor(pixels.data,canvas.width,canvas.height,a,pose);ctx.putImageData(pixels,0,0);return canvas.toDataURL('image/png');});
      cache.set(key,task);task.catch(()=>cache.delete(key));
      if(cache.size>36)cache.delete(cache.keys().next().value);
    }
    return cache.get(key);
  }
  window.CatStudio={derive,render,recolor,sourceFor,valuesText,themes,sources,poseNames,poseShortNames,coatWeights,quadrants,poseFor,withPose,protectedProp};
})();
