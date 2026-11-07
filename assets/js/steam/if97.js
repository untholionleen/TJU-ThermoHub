(function(g){
'use strict';
const NS=g.NeutriumJS&&g.NeutriumJS.thermo&&g.NeutriumJS.thermo.IAPWS97;
if(!NS||!NS.PT)throw new Error('IF97 vendor modules are not loaded in the required order.');
const PT=NS.PT,PH=NS.PH,PS=NS.PS,HS=NS.HS;
const Tc=647.096,Pc=22.064,RHOc=322;
const bounds={Tmin:273.15,Tmax:2273.15,Pmin:0.000611213,Pmax:100,Region5Tmin:1073.15,Region5Pmax:50};
const satCache=new Map();
function finite(x){return Number.isFinite(Number(x));}
function assertRange(P,T){
 if(!finite(P)||!finite(T))throw new TypeError('Pressure and temperature must be finite numbers.');
 if(P<bounds.Pmin||P>bounds.Pmax)throw new RangeError('IF97 pressure range is 0.000611213–100 MPa.');
 if(T<bounds.Tmin||T>bounds.Tmax)throw new RangeError('IF97 temperature range is 273.15–2273.15 K.');
 if(T>bounds.Region5Tmin&&P>bounds.Region5Pmax)throw new RangeError('Region 5 is limited to pressures not exceeding 50 MPa.');
}
function classify(P,T){
 assertRange(P,T);
 if(T<=Tc){
  const ps=PT.r4_T_Psat(T);
  if(Math.abs(P-ps)<Math.max(1e-9,ps*1e-8))return 4;
 }
 if(T>bounds.Region5Tmin)return 5;
 if(T>623.15)return P>PT.b23_T_P(T)?3:2;
 const ps=PT.r4_T_Psat(T);
 return P>ps?1:2;
}
function stateCopy(s,region){
 return {p:s.p,t:s.t,region:region??classify(s.p,s.t),v:s.v,rho:s.rho,u:s.u,h:s.h,s:s.s,cp:s.cp,cv:s.cv,w:s.w,
  units:{p:'MPa',t:'K',v:'m³/kg',rho:'kg/m³',u:'kJ/kg',h:'kJ/kg',s:'kJ/(kg·K)',cp:'kJ/(kg·K)',cv:'kJ/(kg·K)',w:'m/s'},
  source:'IAPWS-IF97 via NeutriumJS.thermo.IAPWS97 (CC BY 4.0)'};
}
function statePT(P,T){
 const r=classify(P,T);
 if(r===4)throw new RangeError('The PT state is on the saturation boundary. Specify vapor quality x using P-x or T-x mode.');
 const s=PT.solve(P,T);
 return stateCopy(s,r);
}
function bisect(fn,a,b,fa,fb){
 for(let i=0;i<85;i++){
  const m=(a+b)/2,fm=fn(m);
  if(!finite(fm))throw new Error('Non-finite value in Region 3 density root solver.');
  if(Math.abs(fm)<1e-9||Math.abs(b-a)<1e-10*Math.max(1,m))return m;
  if(fa*fm<=0){b=m;fb=fm;}else{a=m;fa=fm;}
 }
 return (a+b)/2;
}
function region3SaturationPair(P,T){
 const f=rho=>PT.r3(P,T,rho).p-P;
 const lo=0.001,hi=1250,N=720;
 const roots=[];let prevR=lo,prevF=f(prevR);
 for(let i=1;i<=N;i++){
  const r=Math.exp(Math.log(lo)+(Math.log(hi)-Math.log(lo))*i/N);
  let fr;
  try{fr=f(r);}catch(e){prevR=r;prevF=NaN;continue;}
  if(finite(prevF)&&finite(fr)&&prevF*fr<0){
   const root=bisect(f,prevR,r,prevF,fr);
   if(!roots.some(x=>Math.abs(x-root)<1e-5))roots.push(root);
  }
  prevR=r;prevF=fr;
 }
 roots.sort((a,b)=>a-b);
 if(roots.length<2){
  const one=PT.solve(P,T);
  return {liquid:stateCopy(one,3),vapor:stateCopy(one,3),critical:true,densityRoots:roots};
 }
 const vapor=stateCopy(PT.r3(P,T,roots[0]),3);
 const liquid=stateCopy(PT.r3(P,T,roots[roots.length-1]),3);
 return {liquid,vapor,critical:false,densityRoots:roots};
}
function saturationAtT(T){
 if(!finite(T)||T<bounds.Tmin||T>Tc)throw new RangeError('Saturation temperature range is 273.15–647.096 K.');
 const key=Number(T).toFixed(6);
 if(satCache.has(key))return satCache.get(key);
 const P=PT.r4_T_Psat(T);
 let liquid,vapor,critical=false,densityRoots=[];
 if(T<=623.15){
  liquid=stateCopy(PT.r1(P,T),1);
  vapor=stateCopy(PT.r2(P,T),2);
 }else if(T>=Tc-1e-7){
  const s=stateCopy(PT.solve(Pc,Tc),3);liquid=s;vapor=s;critical=true;
 }else{
  const pair=region3SaturationPair(P,T);liquid=pair.liquid;vapor=pair.vapor;critical=pair.critical;densityRoots=pair.densityRoots;
 }
 const result={T,P,liquid,vapor,critical,densityRoots,
  hf:liquid.h,hg:vapor.h,hfg:vapor.h-liquid.h,
  uf:liquid.u,ug:vapor.u,ufg:vapor.u-liquid.u,
  sf:liquid.s,sg:vapor.s,sfg:vapor.s-liquid.s,
  vf:liquid.v,vg:vapor.v,
  source:'IAPWS-IF97 Region 4 saturation equation + Regions 1/2/3'};
 satCache.set(key,result);
 return result;
}
function saturationAtP(P){
 if(!finite(P)||P<bounds.Pmin||P>Pc)throw new RangeError('Saturation pressure must be between 0.000611213 and 22.064 MPa.');
 return saturationAtT(PT.r4_P_Tsat(P));
}
function qualityState(sat,x){
 if(!finite(x)||x<0||x>1)throw new RangeError('Vapor quality x must be within 0–1.');
 const v=sat.vf+x*(sat.vg-sat.vf);
 return {p:sat.P,t:sat.T,region:4,phase:x===0?'saturated liquid':x===1?'saturated vapor':'two-phase mixture',x,
  v,rho:1/v,h:sat.hf+x*sat.hfg,u:sat.uf+x*sat.ufg,s:sat.sf+x*sat.sfg,cp:null,cv:null,w:null,
  units:{p:'MPa',t:'K',v:'m³/kg',rho:'kg/m³',u:'kJ/kg',h:'kJ/kg',s:'kJ/(kg·K)',cp:'kJ/(kg·K)',cv:'kJ/(kg·K)',w:'m/s'},
  note:'Two-phase mixture properties use mass-quality mixing; cp, cv and speed of sound are not defined by this lever-rule calculation.'};
}
function solvePH(P,h){
 if(!finite(P)||!finite(h))throw new TypeError('P and h must be finite numbers.');
 if(P>=bounds.Pmin&&P<Pc){
  const sat=saturationAtP(P);
  if(h>=sat.hf&&h<=sat.hg)return qualityState(sat,(h-sat.hf)/sat.hfg);
 }
 if(P>=bounds.Region5Pmax&&h>4000)throw new RangeError('This licensed backward PH module supports Regions 1–3 only; use PT for Region 5.');
 return stateCopy(PH.solve(P,h));
}
function solvePS(P,s){
 if(!finite(P)||!finite(s))throw new TypeError('P and s must be finite numbers.');
 if(P>=bounds.Pmin&&P<Pc){
  const sat=saturationAtP(P);
  if(s>=sat.sf&&s<=sat.sg)return qualityState(sat,(s-sat.sf)/sat.sfg);
 }
 if(P>=bounds.Region5Pmax&&s>8)throw new RangeError('This backward PS module supports Regions 1–3 only; use PT for Region 5.');
 return stateCopy(PS.solve(P,s));
}
function solveHS(h,s){
 if(!finite(h)||!finite(s))throw new TypeError('h and s must be finite numbers.');
 // The upstream HS backward routine returns a boundary PT state in Region 4.
 // Recover the mixture quality explicitly from both h and s instead.
 try{
  const T=HS.r4_HS_Tsat(h,s);
  if(finite(T)&&T>=bounds.Tmin&&T<=Tc){
   const sat=saturationAtT(T),xh=(h-sat.hf)/sat.hfg,xs=(s-sat.sf)/sat.sfg;
   if(xh>=-1e-6&&xh<=1.000001&&xs>=-1e-6&&xs<=1.000001&&Math.abs(xh-xs)<0.002){
    return qualityState(sat,Math.max(0,Math.min(1,(xh+xs)/2)));
   }
  }
 }catch(e){}
 return stateCopy(HS.solve(h,s));
}
function solve(mode,a,b){
 switch(mode){
 case 'PT': return statePT(a,b);
 case 'PH': return solvePH(a,b);
 case 'PS': return solvePS(a,b);
 case 'HS': return solveHS(a,b);
 case 'PX': return qualityState(saturationAtP(a),b);
 case 'TX': return qualityState(saturationAtT(a),b);
 default: throw new Error('Unsupported IF97 input pair. Use PT, PH, PS, HS, PX or TX.');
 }
}
function saturationCurves(count=32){
 const liquid=[],vapor=[];
 for(let i=0;i<count;i++){
  const q=i/(count-1),T=273.16+(Tc-273.16-0.02)*(1-Math.pow(1-q,2.2));
  const s=saturationAtT(T);
  liquid.push(s);vapor.push(s);
 }
 return {liquid,vapor};
}
function phChart(){
 const sat=saturationCurves(72),liquid=sat.liquid.map(s=>[s.hf,Math.log10(s.P)]),vapor=sat.vapor.map(s=>[s.hg,Math.log10(s.P)]);
 const quality={};
 for(const x of [.1,.25,.5,.75,.9])quality[x]=sat.liquid.map((s,i)=>[s.hf+x*(s.hg-s.hf),Math.log10(s.P)]);
 const isobars=[];
 const Ps=[.01,.05,.1,.5,1,2,5,10,15,20,25,30,50,80,100];
 for(const P of Ps){
  const points=[];
  const minT=273.15,maxT=(P<=50?2273.15:1073.15);
  for(let i=0;i<140;i++){
   const T=minT+(maxT-minT)*i/139;
   const region=classify(P,T);
   if(region===4)continue;
   try{const st=statePT(P,T);points.push([st.h,Math.log10(P)]);}catch(e){points.push([NaN,Math.log10(P)]);}
  }
  isobars.push({P,data:points});
 }
 return {liquid,vapor,quality,isobars};
}
function tsChart(){
 const sat=saturationCurves(64);
 const liquid=sat.liquid.map(s=>[s.sf,s.T]),vapor=sat.vapor.map(s=>[s.sg,s.T]);
 const quality={};
 for(const x of [.1,.25,.5,.75,.9])quality[x]=sat.liquid.map((s,i)=>[s.sf+x*(s.sg-s.sf),s.T]);
 const isobars=[];
 for(const P of [.01,.05,.1,.5,1,2,5,10,15,20,25,30,50,80,100]){
  const points=[];
  const maxT=P<=50?2273.15:1073.15;
  for(let i=0;i<120;i++){
   const T=273.15+(maxT-273.15)*i/119;
   if(classify(P,T)===4)continue;
   try{const st=statePT(P,T);points.push([st.s,st.t]);}catch(e){points.push([NaN,NaN]);}
  }
  isobars.push({P,data:points});
 }
 return {liquid,vapor,quality,isobars};
}
g.ThermoIF97=Object.freeze({bounds,region:classify,PT:statePT,PH:solvePH,PS:solvePS,HS:solveHS,solve,
 saturationAtT,saturationAtP,qualityState,phChart,tsChart,source:{
 name:'NeutriumJS.thermo.IAPWS97',author:'Native Dynamics',license:'CC BY 4.0',
 url:'https://github.com/NativeDynamics/NeutriumJS.thermo.IAPWS97',
 modernSuccessor:'https://github.com/neutrium/thermo.eos.iapws97'
}});
})(window);
