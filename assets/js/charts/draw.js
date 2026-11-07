(function(g){'use strict';
const COLORS=['#173f67','#c49a4b','#27816f','#9b6b91','#bd714a','#527ea6','#7c8b48','#8567a2','#4b8999'];
function setup(canvas){
 const dpr=Math.max(1,window.devicePixelRatio||1),rect=canvas.getBoundingClientRect();
 const w=Math.max(340,rect.width||canvas.clientWidth||900),h=Math.max(250,rect.height||Number(canvas.getAttribute('height'))||360);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
 return {c,w,h,dpr};
}
function nice(v){
 if(!Number.isFinite(v))return '';
 if(Math.abs(v)>=1000)return v.toLocaleString(undefined,{maximumFractionDigits:0});
 if(Math.abs(v)>=10)return Number(v.toFixed(1)).toString();
 if(Math.abs(v)>=1)return Number(v.toFixed(2)).toString();
 if(Math.abs(v)>=.01)return Number(v.toFixed(3)).toString();
 return v.toExponential(1);
}
function bounds(series,xmin,xmax,ymin,ymax){
 const pts=series.flatMap(s=>(s.data||[]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])));
 return {
  xmin:Number.isFinite(xmin)?xmin:(pts.length?Math.min(...pts.map(p=>p[0])):0),
  xmax:Number.isFinite(xmax)?xmax:(pts.length?Math.max(...pts.map(p=>p[0])):1),
  ymin:Number.isFinite(ymin)?ymin:(pts.length?Math.min(...pts.map(p=>p[1])):0),
  ymax:Number.isFinite(ymax)?ymax:(pts.length?Math.max(...pts.map(p=>p[1])):1)
 };
}
function lineChart(canvas,series,xmin,xmax,ymin,ymax,xlabel,ylabel,title,options={}){
 const {c,w,h}=setup(canvas),b=bounds(series,xmin,xmax,ymin,ymax);
 const dx=b.xmax-b.xmin||1,dy=b.ymax-b.ymin||1;
 const L=78,R=options.legend===false?28:36,legendRows=options.legend===false?0:Math.ceil(series.filter(v=>v.name).length/3),T=Math.max(48,34+legendRows*15),B=62,plotW=w-L-R,plotH=h-T-B;
 const X=x=>L+(x-b.xmin)/dx*plotW,Y=y=>T+(b.ymax-y)/dy*plotH;
 c.clearRect(0,0,w,h);c.fillStyle='#fff';c.fillRect(0,0,w,h);
 c.font='600 13px Inter,Segoe UI,sans-serif';c.fillStyle='#153b60';c.textAlign='center';c.fillText(title||'',L+plotW/2,23);
 c.font='11px Inter,Segoe UI,sans-serif';c.strokeStyle='#e7edf3';c.lineWidth=1;
 for(let i=0;i<=6;i++){
  const y=T+plotH*i/6;c.beginPath();c.moveTo(L,y);c.lineTo(L+plotW,y);c.stroke();
  c.fillStyle='#64778a';c.textAlign='right';c.fillText(nice(b.ymax-dy*i/6),L-10,y+4);
 }
 for(let i=0;i<=6;i++){
  const x=L+plotW*i/6;c.beginPath();c.moveTo(x,T);c.lineTo(x,T+plotH);c.stroke();
  c.fillStyle='#64778a';c.textAlign='center';c.fillText(nice(b.xmin+dx*i/6),x,T+plotH+19);
 }
 c.strokeStyle='#60758a';c.lineWidth=1.5;c.beginPath();c.moveTo(L,T);c.lineTo(L,T+plotH);c.lineTo(L+plotW,T+plotH);c.stroke();
 c.font='12px Inter,Segoe UI,sans-serif';c.fillStyle='#294965';c.textAlign='center';c.fillText(xlabel||'',L+plotW/2,h-15);
 c.save();c.translate(17,T+plotH/2);c.rotate(-Math.PI/2);c.fillText(ylabel||'',0,0);c.restore();
 c.save();c.beginPath();c.rect(L,T,plotW,plotH);c.clip();
 series.forEach((s,i)=>{
  const color=s.color||COLORS[i%COLORS.length];c.strokeStyle=color;c.lineWidth=s.width||2.1;c.globalAlpha=s.alpha??1;
  if(s.dash)c.setLineDash(s.dash);else c.setLineDash([]);
  c.beginPath();let started=false;
  for(const p of (s.data||[])){
   if(!p||!Number.isFinite(p[0])||!Number.isFinite(p[1])){started=false;continue;}
   if(!started){c.moveTo(X(p[0]),Y(p[1]));started=true;}else c.lineTo(X(p[0]),Y(p[1]));
  }
  c.stroke();c.setLineDash([]);c.globalAlpha=1;
  if(s.points){for(const p of s.points){if(!Number.isFinite(p[0])||!Number.isFinite(p[1]))continue;c.fillStyle=color;c.beginPath();c.arc(X(p[0]),Y(p[1]),4,0,Math.PI*2);c.fill();}}
 });
 c.restore();
 const legend=series.filter(s=>s.name);
 if(legend.length&&options.legend!==false){
  let x=L,y=T-25;c.font='10px Inter,Segoe UI,sans-serif';c.textAlign='left';
  for(let i=0;i<legend.length;i++){
   const s=legend[i],name=s.name;
   c.strokeStyle=s.color||COLORS[i%COLORS.length];c.lineWidth=3;c.beginPath();c.moveTo(x,y-4);c.lineTo(x+20,y-4);c.stroke();
   x+=26;c.fillStyle='#42566b';c.fillText(name,x,y);x+=c.measureText(name).width+16;
   if(x>w-90){x=L;y+=15;}
  }
 }
 const state={series,b,X,Y,L,T,plotW,plotH,w,h};
 canvas._chartState=state;
 if(!canvas._chartBound){
  const tip=document.createElement('div');tip.className='chart-tooltip';tip.style.cssText='position:absolute;display:none;z-index:30;pointer-events:none;background:#102e50;color:#fff;border:1px solid #c5a059;border-radius:6px;padding:7px 9px;font:11px/1.5 Inter,Segoe UI,sans-serif;box-shadow:0 4px 16px #102e5030;white-space:nowrap';
  const parent=canvas.parentElement;if(parent){if(getComputedStyle(parent).position==='static')parent.style.position='relative';parent.appendChild(tip);}
  canvas.addEventListener('pointermove',e=>{
   const st=canvas._chartState;if(!st||!tip.parentElement)return;
   const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*(st.w/rect.width),y=(e.clientY-rect.top)*(st.h/rect.height);
   if(x<st.L||x>st.L+st.plotW||y<st.T||y>st.T+st.plotH){tip.style.display='none';return;}
   const xv=st.b.xmin+(x-st.L)/st.plotW*(st.b.xmax-st.b.xmin),yv=st.b.ymax-(y-st.T)/st.plotH*(st.b.ymax-st.b.ymin);
   let best=null,bestD=Infinity;
   st.series.forEach((s,si)=>(s.data||[]).forEach((p,pi)=>{if(!Number.isFinite(p[0])||!Number.isFinite(p[1]))return;const d=(p[0]-xv)**2/(st.b.xmax-st.b.xmin)**2+(p[1]-yv)**2/(st.b.ymax-st.b.ymin)**2;if(d<bestD){bestD=d;best={s,p,si,pi};}}));
   if(best&&bestD<.02){tip.innerHTML='<b>'+(best.s.name||('Series '+(best.si+1)))+'</b><br>'+xlabel+': '+nice(best.p[0])+'<br>'+ylabel+': '+nice(best.p[1]);tip.style.display='block';tip.style.left=Math.min(rect.width-170,Math.max(4,e.clientX-rect.left+12))+'px';tip.style.top=Math.max(4,e.clientY-rect.top-45)+'px';}
   else tip.style.display='none';
  });
  canvas.addEventListener('pointerleave',()=>{tip.style.display='none';});
  canvas._chartBound=true;
 }
 return {X,Y,bounds:b};
}
function drawPvt(canvas,model,Tc,Pc,w,projection,pressureFn){
 const {c,w:W,h:H}=setup(canvas);
 if(projection!=='3d'){
  if(projection==='pv'){
   const ts=[.72,.85,1,1.15,1.35].map(v=>v*Tc),series=ts.map((T,i)=>{
    const data=[];for(let j=0;j<220;j++){const vc=.72+j/219*10,V=vc*8.31446261815324*Tc/(Pc*1e6);let p;try{p=pressureFn(model,T,V,Tc,Pc,w)/1e6;}catch(e){p=NaN;}data.push([vc,p>0&&p<Pc*12?p:NaN]);}
    return {name:'T/Tc = '+(T/Tc).toFixed(2),data,color:COLORS[i]};
   });
   return lineChart(canvas,series,.72,10.72,0,Pc*6,'V / Vc','P / MPa','P–V isotherms · cubic EOS');
  }
  if(projection==='pt'){
   const vcs=[1.4,1.8,2.5,3.5,5,7.5,10],series=vcs.map((vc,i)=>{
    const data=[];for(let j=0;j<150;j++){const tr=.55+j/149*1.45,T=tr*Tc,V=vc*8.31446261815324*Tc/(Pc*1e6);let p;try{p=pressureFn(model,T,V,Tc,Pc,w)/1e6;}catch(e){p=NaN;}data.push([tr,p>0&&p<Pc*8?p:NaN]);}
    return {name:'V/Vc = '+vc,data,color:COLORS[i]};
   });
   return lineChart(canvas,series,.55,2,0,Pc*6,'T / Tc','P / MPa','P–T isochores · cubic EOS');
  }
  if(projection==='vt'){
   const targets=[.5,1,2,5,10,20].map(x=>x*Pc*.01),series=targets.map((p,i)=>{
    const data=[];
    for(let j=0;j<100;j++){
     const tr=.58+j/99*1.42,T=tr*Tc,lo=.65,hi=15,N=220;let lastV=lo,lastF;
     try{lastF=pressureFn(model,T,lastV*8.31446261815324*Tc/(Pc*1e6),Tc,Pc,w)/1e6-p;}catch(e){lastF=NaN;}
     let found=null;
     for(let k=1;k<=N;k++){
      const vc=Math.exp(Math.log(lo)+(Math.log(hi)-Math.log(lo))*k/N),V=vc*8.31446261815324*Tc/(Pc*1e6);let f;
      try{f=pressureFn(model,T,V,Tc,Pc,w)/1e6-p;}catch(e){f=NaN;}
      if(Number.isFinite(lastF)&&Number.isFinite(f)&&lastF*f<=0){let a=lastV,b=vc,fa=lastF;for(let q=0;q<45;q++){const m=(a+b)/2,pm=pressureFn(model,T,m*8.31446261815324*Tc/(Pc*1e6),Tc,Pc,w)/1e6-p;if(fa*pm<=0)b=m;else{a=m;fa=pm;}}found=(a+b)/2;}
      lastV=vc;lastF=f;
     }
     data.push([tr,found||NaN]);
    }
    return {name:'P/Pc = '+(p/Pc).toFixed(2),data,color:COLORS[i]};
   });
   return lineChart(canvas,series,.58,2,.6,15,'T / Tc','V / Vc','V–T isobars · vapor root');
  }
 }
 let rotX=-.48,rotY=.72,zoom=1,drag=null;
 if(canvas._pvtRotation){rotX=canvas._pvtRotation.x;rotY=canvas._pvtRotation.y;zoom=canvas._pvtRotation.zoom;}
 const tCount=25,vCount=38,Ts=Array.from({length:tCount},(_,i)=>.62+i/(tCount-1)*1.55),Vs=Array.from({length:vCount},(_,i)=>.78+i/(vCount-1)*9.0);
 const mesh=Ts.map(tr=>Vs.map(vc=>{
  const T=tr*Tc,V=vc*8.31446261815324*Tc/(Pc*1e6);let p;
  try{p=pressureFn(model,T,V,Tc,Pc,w)/(Pc*1e6);}catch(e){p=NaN;}
  return {x:(vc-5.25)/4.8,y:(tr-1.38)/.9,z:Number.isFinite(p)?Math.max(-.22,Math.min(6,p))*.62:NaN};
 }));
 const project=q=>{
  const cy=Math.cos(rotY),sy=Math.sin(rotY),cx=Math.cos(rotX),sx=Math.sin(rotX);
  const x=q.x*cy-q.z*sy,z1=q.x*sy+q.z*cy,y=q.y*cx-z1*sx,z=q.y*sx+z1*cx;
  const perspective=1/(2.75+z*.20),scale=Math.min(W,H)*.38*zoom*perspective;
  return {x:W*.52+x*scale,y:H*.53-y*scale,depth:z};
 };
 const faces=[];
 for(let j=0;j<tCount-1;j++)for(let i=0;i<vCount-1;i++){
  const a=mesh[j][i],b=mesh[j][i+1],d=mesh[j+1][i],e=mesh[j+1][i+1];
  if(![a,b,d,e].every(q=>Number.isFinite(q.z)))continue;
  const poly=[project(a),project(b),project(e),project(d)],depth=poly.reduce((s,p)=>s+p.depth,0)/4,z=(a.z+b.z+d.z+e.z)/4;
  faces.push({poly,depth,z});
 }
 faces.sort((a,b)=>a.depth-b.depth);
 c.fillStyle='#fbfdff';c.fillRect(0,0,W,H);
 // Back-plane grid, then shaded surface facets.
 c.strokeStyle='#e3eaf1';c.lineWidth=1;
 const axisA=project({x:-1.1,y:-.78,z:-.15}),axisB=project({x:1.1,y:-.78,z:-.15}),axisC=project({x:-1.1,y:1.02,z:-.15}),axisD=project({x:-1.1,y:-.78,z:1.8});
 for(let k=0;k<=5;k++){const f=k/5;c.beginPath();let p=project({x:-1.1+2.2*f,y:-.78,z:-.15});let q=project({x:-1.1+2.2*f,y:-.78,z:1.8});c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();p=project({x:-1.1,y:-.78,z:1.8*f/1.8});q=project({x:1.1,y:-.78,z:1.8*f/1.8});c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();}
 faces.forEach(f=>{
  const z=Math.max(0,Math.min(1,(f.z+.2)/3.8)),r=Math.round(25+40*z),gg=Math.round(73+68*z),bb=Math.round(112+75*z),alpha=.30+z*.32;
  c.beginPath();f.poly.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();
  c.fillStyle='rgba('+r+','+gg+','+bb+','+alpha+')';c.fill();c.strokeStyle='rgba(20,56,91,.22)';c.lineWidth=.55;c.stroke();
 });
 // Surface mesh lines.
 c.strokeStyle='rgba(16,57,96,.5)';c.lineWidth=.7;
 for(let j=0;j<tCount;j++){c.beginPath();mesh[j].forEach((q,i)=>{const p=project(q);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);});c.stroke();}
 for(let i=0;i<vCount;i+=2){c.beginPath();mesh.forEach((row,j)=>{const p=project(row[i]);j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);});c.stroke();}
 const drawAxis=(p,q,label)=>{c.strokeStyle='#173d61';c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();c.fillStyle='#173d61';c.font='600 12px Inter,Segoe UI,sans-serif';c.fillText(label,q.x+5,q.y-5);};
 drawAxis(axisA,axisB,'V / Vc');drawAxis(axisA,axisC,'T / Tc');drawAxis(axisA,axisD,'P / Pc');
 const tickLabel=(q,label,dx=5,dy=14)=>{const p=project(q);c.fillStyle='#526c84';c.font='10px Inter,Segoe UI,sans-serif';c.textAlign='center';c.fillText(label,p.x+dx,p.y+dy);};
 [1,3,5,7,9].forEach((v,i)=>{const f=i/4;tickLabel({x:-1.1+2.2*f,y:-.78,z:-.15},String(v),0,16);});
 ['0.65','1.0','1.5','2.1'].forEach((v,i)=>{const f=i/3;tickLabel({x:-1.1,y:-.78+1.8*f,z:-.15},v,-22,3);});
 ['0','2','4','6'].forEach((v,i)=>{const f=i/3;tickLabel({x:-1.1,y:-.78,z:1.8*f},v,-14,4);});
 c.fillStyle='#173d61';c.font='600 13px Inter,Segoe UI,sans-serif';c.textAlign='center';c.fillText(model.toUpperCase()+' equation of state · P–V–T surface',W/2,25);
 c.font='11px Inter,Segoe UI,sans-serif';c.fillStyle='#657a8e';c.fillText('Drag to rotate · Wheel to zoom · Raw EOS surface (not a phase envelope)',W/2,H-13);
 canvas._pvtRotation={x:rotX,y:rotY,zoom};
 if(!canvas._pvtBound){
  canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;rotY+=(e.clientX-drag[0])*.008;rotX+=(e.clientY-drag[1])*.008;drag=[e.clientX,e.clientY];canvas._pvtRotation={x:rotX,y:rotY,zoom};drawPvt(canvas,model,Tc,Pc,w,projection,pressureFn);});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.8,zoom*(e.deltaY<0?1.08:.92)));canvas._pvtRotation={x:rotX,y:rotY,zoom};drawPvt(canvas,model,Tc,Pc,w,projection,pressureFn);},{passive:false});
  canvas._pvtBound=true;
 }
}
g.ThermoCharts={lineChart,drawEos:(canvas,model,T,Tc,Pc,w,pressureFn)=>{const data=[];for(let i=0;i<180;i++){const vc=.72+i/179*9,V=vc*8.31446261815324*Tc/(Pc*1e6);let p;try{p=pressureFn(model,T,V,Tc,Pc,w)/1e6;}catch(e){p=NaN;}data.push([vc,p>0?p:NaN]);}lineChart(canvas,[{name:model.toUpperCase()+' EOS',data}],.72,9.72,0,Pc*6,'V / Vc','P / MPa','EOS isotherm');return data;},drawPvt};
})(window);
