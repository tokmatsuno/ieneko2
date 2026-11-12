/* One canvas is used for both the on-screen preview and the downloaded image. */
(function(){
  'use strict';
  const serif='"Hiragino Mincho ProN", "Yu Mincho", serif',sans='"Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif';
  function rounded(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  function lines(ctx,text,width){const out=[];let line='';for(const c of Array.from(text)){if(c==='\n'||ctx.measureText(line+c).width>width&&line){out.push(line);line=c==='\n'?'':c;}else line+=c;}if(line)out.push(line);return out;}
  function fitText(ctx,text,{x,y,width,size=38,min=22,lineHeight=1.5,maxLines=2,color,font=sans,weight=800}){
    let rows=[];for(;size>=min;size--){ctx.font=`${weight} ${size}px ${font}`;rows=lines(ctx,text,width);if(rows.length<=maxLines)break;}
    if(rows.length>1){const last=Array.from(rows.at(-1)),prior=Array.from(rows.at(-2));if(last.length<3&&prior.length>3){const count=Math.ceil((prior.length+last.length)/2);rows[rows.length-2]=prior.slice(0,count).join('');rows[rows.length-1]=prior.slice(count).join('')+last.join('');}const end=rows.length-1;while(/^[、。，．！？）」』】]/.test(rows[end])){rows[end-1]+=rows[end][0];rows[end]=rows[end].slice(1);}}
    ctx.fillStyle=color;rows.slice(0,maxLines).forEach((row,i)=>ctx.fillText(row,x,y+i*size*lineHeight));return rows.length*size*lineHeight;
  }
  function tagRows(ctx,tags,x,y,width,ink,light){let dx=x,dy=y;ctx.font=`800 24px ${sans}`;for(const text of tags){const w=Math.min(width,ctx.measureText(text).width+32);if(dx+w>x+width){dx=x;dy+=59;}rounded(ctx,dx,dy,w,45,12,light);ctx.fillStyle=ink;ctx.fillText(text,dx+16,dy+31);dx+=w+10;}return dy+45;}
  function qr(ctx,url,x,y,size){const code=qrcode(0,'M');code.addData(url);code.make();const n=code.getModuleCount(),cell=Math.floor(size/(n+8)),actual=cell*(n+8);ctx.fillStyle='#fffdf5';ctx.fillRect(x,y,actual,actual);ctx.fillStyle='#153e34';for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(code.isDark(row,col))ctx.fillRect(x+(col+4)*cell,y+(row+4)*cell,cell,cell);return actual;}
  function image(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('card_artwork_load'));im.src=src;});}
  async function render(card,art){
    const dim=CardIdentity.SIZE,canvas=document.createElement('canvas');canvas.width=dim.width;canvas.height=dim.height;const ctx=canvas.getContext('2d'),t=card.theme;
    const cat=await image(art);await document.fonts?.ready;
    ctx.fillStyle=t.ink;ctx.fillRect(0,0,dim.width,dim.height);
    const glow=ctx.createRadialGradient(910,100,30,620,500,950);glow.addColorStop(0,'#ffffff14');glow.addColorStop(1,'#ffffff00');ctx.fillStyle=glow;ctx.fillRect(0,0,dim.width,dim.height);
    rounded(ctx,28,26,1024,1298,29,null,t.gold);rounded(ctx,40,38,1000,1274,22,null,t.gold+'77');
    ctx.fillStyle=t.gold;ctx.font=`800 28px ${serif}`;ctx.fillText('家猫の冒険',76,104);ctx.font=`700 17px ${sans}`;ctx.textAlign='right';ctx.fillText('MY LITTLE INTRODUCTION',1002,103);ctx.textAlign='left';
    fitText(ctx,card.nickname,{x:76,y:167,width:915,size:card.hasNickname?56:43,min:32,maxLines:1,color:'#fff5df',font:serif});
    ctx.fillStyle=t.gold;ctx.font=`800 19px ${sans}`;ctx.fillText('タイプ',78,233);
    fitText(ctx,card.type,{x:76,y:296,width:440,size:60,min:30,maxLines:3,lineHeight:1.28,color:'#fff8e5',font:serif});
    ctx.save();ctx.beginPath();ctx.ellipse(770,409,242,240,-.08,0,Math.PI*2);ctx.fillStyle=t.light;ctx.fill();ctx.strokeStyle=t.gold;ctx.lineWidth=3;ctx.stroke();ctx.restore();
    const available={x:505,y:164,width:522,height:480},scale=Math.min(available.width/cat.naturalWidth,available.height/cat.naturalHeight);ctx.drawImage(cat,available.x+(available.width-cat.naturalWidth*scale)/2,available.y+(available.height-cat.naturalHeight*scale)/2,cat.naturalWidth*scale,cat.naturalHeight*scale);
    ctx.fillStyle=t.gold;ctx.font=`800 19px ${sans}`;ctx.fillText('いまのステータス',78,470);fitText(ctx,card.status,{x:76,y:518,width:420,size:33,min:25,maxLines:2,lineHeight:1.5,color:'#fff7e4'});
    ctx.fillStyle=t.gold;ctx.font=`800 19px ${sans}`;ctx.fillText(card.likesLabel,78,650);tagRows(ctx,card.likes,76,669,930,t.ink,'#fff4da');
    const details=[['心が動くきっかけ',card.invitation],['力になれること',card.contribution],['立ち寄りたくなる場所',card.place]];
    details.forEach(([label,text],i)=>{const y=735+i*90;rounded(ctx,65,y,950,84,16,t.light);ctx.fillStyle=t.ink;ctx.font=`800 18px ${sans}`;ctx.fillText(label,91,y+27);fitText(ctx,text,{x:91,y:y+65,width:900,size:32,min:26,maxLines:1,color:t.ink});});
    const boxY=1021,boxH=167;rounded(ctx,65,boxY,950,boxH,23,'#fff6e2');ctx.fillStyle=t.ink;ctx.font=`800 18px ${sans}`;ctx.fillText('こんな話、しませんか。',94,boxY+37);fitText(ctx,card.question,{x:94,y:boxY+77,width:875,size:32,min:24,maxLines:2,lineHeight:1.25,color:t.ink,font:serif});
    if(card.track)fitText(ctx,card.track.title+' / '+card.track.artist,{x:94,y:boxY+boxH-25,width:875,size:23,min:18,maxLines:1,color:t.ink});
    fitText(ctx,'好きなことから、つながろう。',{x:76,y:1267,width:730,size:29,min:24,maxLines:1,color:t.gold,font:serif});ctx.fillStyle='#fff4d9';ctx.font=`600 19px ${sans}`;ctx.fillText('いまの気分を、ことばと猫に。',77,1305);
    qr(ctx,card.qrURL,891,1227,108);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('card_canvas_blob');return {blob,width:dim.width,height:dim.height};
  }

  window.CardRenderer={render};
})();
