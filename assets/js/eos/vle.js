(function(g){
'use strict';
const R=8.31446261815324, finite=Number.isFinite;
function validateFeed(feed){
 if(!Array.isArray(feed)||feed.length!==2)throw new TypeError('Exactly two components are required.');
 const s=feed.reduce((a,c)=>a+Number(c.z),0);
 if(Math.abs(s-1)>1e-8||feed.some(c=>!finite(c.z)||c.z<0||!finite(c.Tc)||c.Tc<=0||!finite(c.Pc)||c.Pc<=0||!finite(c.omega)))throw new RangeError('Feed fractions must sum to one and critical properties must be valid.');
}
function validateComposition(x){if(!Array.isArray(x)||x.length!==2||x.some(v=>!finite(v)||v<0)||Math.abs(x.reduce((a,b)=>a+b,0)-1)>1e-8)throw new RangeError('Binary composition must contain two non-negative mole fractions summing to one.');}
function mixParams(model,T,x,feed,kij){
 const pure=feed.map(c=>g.ThermoEOS.params(model,T,c.Tc,c.Pc,c.omega));
 const aij=pure.map((pi,i)=>pure.map((pj,j)=>Math.sqrt(pi.a*pj.a)*(1-(i===j?0:kij))));
 let a=0,b=0;for(let i=0;i<2;i++){b+=x[i]*pure[i].b;for(let j=0;j<2;j++)a+=x[i]*x[j]*aij[i][j];}
 if(!(a>0&&b>0))throw new RangeError('Invalid mixture parameters.');
 return {a,b,aij,pure};
}
function phaseRoots(model,T,P,x,feed,kij){
 const p=mixParams(model,T,x,feed,kij),PP=P*1e6,A=p.a*PP/(R*R*T*T),B=p.b*PP/(R*T);let a,b,c;
 if(model==='pr'){a=B-1;b=A-3*B*B-2*B;c=-(A*B-B*B-B*B*B);}
 else if(model==='srk'){a=-1;b=A-B-B*B;c=-A*B;}
 else throw new RangeError('VLE supports PR and SRK only.');
 const Z=g.ThermoEOS.cubicRoots(a,b,c).filter(z=>finite(z)&&z>B&&z>0).sort((u,v)=>u-v);
 if(!Z.length)throw new RangeError('No admissible mixture compressibility root.');
 const phi=Z.map(z=>{const L=model==='pr'?Math.log((z+(1+Math.SQRT2)*B)/(z+(1-Math.SQRT2)*B)):Math.log(1+B/z);return [0,1].map(i=>{const bi=p.pure[i].b/p.b,si=x.reduce((sum,xj,j)=>sum+xj*p.aij[i][j],0);let lp=bi*(z-1)-Math.log(z-B);lp-=model==='pr'?A/(2*Math.SQRT2*B)*(2*si/p.a-bi)*L:A/B*(2*si/p.a-bi)*L;return Math.exp(lp);});});
 return {Z,phi,params:p,A,B};
}
function rachfordRice(K,z){
 const f=beta=>z.reduce((s,zi,i)=>s+zi*(K[i]-1)/(1+beta*(K[i]-1)),0),f0=f(0),f1=f(1);
 if(f0<=0)return {phase:'liquid-only',beta:0,x:[...z],y:null,residual:f0};
 if(f1>=0)return {phase:'vapor-only',beta:1,x:null,y:[...z],residual:f1};
 let lo=0,hi=1;for(let i=0;i<90;i++){const m=(lo+hi)/2,fm=f(m);if(Math.abs(fm)<1e-13){lo=hi=m;break;}if(fm>0)lo=m;else hi=m;}
 const beta=(lo+hi)/2,x=z.map((zi,i)=>zi/(1+beta*(K[i]-1))),y=x.map((xi,i)=>xi*K[i]),sx=x.reduce((a,v)=>a+v,0),sy=y.reduce((a,v)=>a+v,0);
 return {phase:'two-phase',beta,x:x.map(v=>v/sx),y:y.map(v=>v/sy),residual:f(beta)};
}
function flash({model='pr',T,P,feed,kij=0,maxIterations=150,tolerance=1e-9}){
 validateFeed(feed);
 if(!['pr','srk'].includes(model))throw new RangeError('Choose PR or SRK.');
 if(!finite(T)||T<=0||!finite(P)||P<=0||!finite(kij)||kij<-.5||kij>.5)throw new RangeError('Temperature, pressure or binary interaction parameter is outside the supported input range.');
 const z=feed.map(c=>Number(c.z));let lnK=feed.map(c=>Math.log(c.Pc/P)+5.373*(1+c.omega)*(1-c.Tc/T)),last=null,converged=false,maxResidual=Infinity;
 for(let iter=1;iter<=maxIterations;iter++){
  const K=lnK.map(v=>Math.exp(Math.max(-30,Math.min(30,v)))),split=rachfordRice(K,z);last=split;
  if(split.phase!=='two-phase')return {model,T,P,phase:split.phase,beta:split.beta,x:split.x,y:split.y,K,iterations:iter,converged:true,rrResidual:split.residual,feed:feed.map(c=>({...c})),materialResidual:0,fugacityResidual:null,source:'PR/SRK phi-phi model; van der Waals one-fluid mixing rule; user-supplied binary kij.'};
  const L=phaseRoots(model,T,P,split.x,feed,kij),V=phaseRoots(model,T,P,split.y,feed,kij),phiL=L.phi[0],phiV=V.phi[V.phi.length-1],target=phiL.map((v,i)=>Math.log(v)-Math.log(phiV[i]));
  maxResidual=Math.max(...target.map((v,i)=>Math.abs(v-lnK[i])));
  if(maxResidual<tolerance){last={...split,K,liquidPhi:phiL,vaporPhi:phiV,liquidZ:L.Z[0],vaporZ:V.Z[V.Z.length-1],iterations:iter};converged=true;break;}
  const damping=iter<20?.5:.75;lnK=lnK.map((v,i)=>v+damping*(target[i]-v));
 }
 if(!converged)throw new Error('VLE phi-phi iteration did not converge within '+maxIterations+' iterations (max |d ln K|='+maxResidual+').');
 const {x,y,beta,K}=last,mat=x.map((v,i)=>(1-beta)*v+beta*y[i]),materialResidual=Math.max(...mat.map((v,i)=>Math.abs(v-z[i]))),fugacityResidual=Math.max(...K.map((k,i)=>Math.abs(Math.log(k)-Math.log(last.liquidPhi[i]/last.vaporPhi[i]))));
 return {model,T,P,phase:'two-phase',beta,x,y,K,iterations:last.iterations,converged,rrResidual:last.residual,materialResidual,fugacityResidual,liquidZ:last.liquidZ,vaporZ:last.vaporZ,liquidPhi:last.liquidPhi,vaporPhi:last.vaporPhi,feed:feed.map(c=>({...c})),source:'PR/SRK phi-phi flash; van der Waals one-fluid mixing rule; user-supplied binary kij.'};
}
function phaseBoundaryResidual(model,mode,T,P,fixed,feed,kij){
 const liquidFixed=mode==='bubble'?fixed:null,vaporFixed=mode==='dew'?fixed:null,Kw=feed.map(c=>Math.exp(Math.max(-25,Math.min(25,Math.log(c.Pc/P)+5.373*(1+c.omega)*(1-c.Tc/T)))));
 let moving=mode==='bubble'?Kw.map((k,i)=>k*liquidFixed[i]):vaporFixed.map((v,i)=>v/Kw[i]);const sm=moving.reduce((a,b)=>a+b,0);moving=moving.map(v=>v/sm);
 let residual=NaN,K=[],L,V;
 for(let iter=0;iter<100;iter++){
  const x=mode==='bubble'?liquidFixed:moving,y=mode==='bubble'?moving:vaporFixed;L=phaseRoots(model,T,P,x,feed,kij);V=phaseRoots(model,T,P,y,feed,kij);
  if(!L.Z.length||!V.Z.length)throw new RangeError('No admissible liquid/vapor compressibility root at this boundary trial state.');
  const phiL=L.phi[0],phiV=V.phi[V.phi.length-1];K=phiL.map((v,i)=>v/phiV[i]);
  const raw=mode==='bubble'?K.map((k,i)=>k*liquidFixed[i]):K.map((k,i)=>vaporFixed[i]/k),sum=raw.reduce((a,b)=>a+b,0);residual=sum-1;
  const next=raw.map(v=>v/sum),err=Math.max(...next.map((v,i)=>Math.abs(v-moving[i])));moving=next;
  if(err<1e-9)return {residual,composition:moving,K,iterations:iter+1,liquidZ:L.Z[0],vaporZ:V.Z[V.Z.length-1],liquidPhi:phiL,vaporPhi:phiV};
 }
 throw new Error('Bubble/dew composition iteration did not converge.');
}
function boundaryPressure(mode,{model='pr',T,composition,feed,kij=0}){
 validateFeed(feed);validateComposition(composition);if(!finite(T)||T<=0||!finite(kij)||kij<-.5||kij>.5)throw new RangeError('Invalid temperature or binary kij.');
 if(!['pr','srk'].includes(model))throw new RangeError('Choose PR or SRK.');
 const pMin=.001,pMax=Math.min(100,Math.max(...feed.map(c=>c.Pc))*1.25),n=90,samples=[];
 for(let i=0;i<n;i++){const P=Math.exp(Math.log(pMin)+(Math.log(pMax)-Math.log(pMin))*i/(n-1));try{const q=phaseBoundaryResidual(model,mode,T,P,composition,feed,kij);if(finite(q.residual))samples.push({P,...q});}catch(e){}}
 let bracket=null;for(let i=1;i<samples.length;i++)if(samples[i-1].residual*samples[i].residual<=0){bracket=[samples[i-1],samples[i]];break;}
 if(!bracket)throw new RangeError('No bubble/dew pressure root found in the scanned two-phase pressure interval.');
 let lo=bracket[0].P,hi=bracket[1].P,fl=bracket[0].residual,q=null;for(let i=0;i<65;i++){const P=Math.sqrt(lo*hi);q=phaseBoundaryResidual(model,mode,T,P,composition,feed,kij);if(Math.abs(q.residual)<1e-9)break;if(fl*q.residual<=0)hi=P;else{lo=P;fl=q.residual;}}
 const P=Math.sqrt(lo*hi);q=phaseBoundaryResidual(model,mode,T,P,composition,feed,kij);
 return {mode,model,T,P,x:mode==='bubble'?composition:q.composition,y:mode==='bubble'?q.composition:composition,K:q.K,iterations:q.iterations,residual:q.residual,liquidZ:q.liquidZ,vaporZ:q.vaporZ,liquidPhi:q.liquidPhi,vaporPhi:q.vaporPhi,source:model.toUpperCase()+' phi-phi bubble/dew pressure calculation; van der Waals one-fluid mixing rule; user-supplied binary kij.'};
}
function boundaryTemperature(mode,{model='pr',P,composition,feed,kij=0}){
 validateFeed(feed);validateComposition(composition);if(!finite(P)||P<=0||!['pr','srk'].includes(model))throw new RangeError('Invalid pressure or EOS model.');
 const tMin=Math.max(55,Math.min(...feed.map(c=>c.Tc))*.45),tMax=Math.max(...feed.map(c=>c.Tc))*1.2,n=100,samples=[];
 for(let i=0;i<n;i++){const T=tMin+(tMax-tMin)*i/(n-1);try{const q=phaseBoundaryResidual(model,mode,T,P,composition,feed,kij);if(finite(q.residual))samples.push({T,...q});}catch(e){}}
 let bracket=null;for(let i=1;i<samples.length;i++)if(samples[i-1].residual*samples[i].residual<=0){bracket=[samples[i-1],samples[i]];break;}
 if(!bracket)throw new RangeError('No bubble/dew temperature root found in the scanned two-phase temperature interval.');
 let lo=bracket[0].T,hi=bracket[1].T,fl=bracket[0].residual,q=null;for(let i=0;i<65;i++){const T=(lo+hi)/2;q=phaseBoundaryResidual(model,mode,T,P,composition,feed,kij);if(Math.abs(q.residual)<1e-9)break;if(fl*q.residual<=0)hi=T;else{lo=T;fl=q.residual;}}
 const T=(lo+hi)/2;q=phaseBoundaryResidual(model,mode,T,P,composition,feed,kij);
 return {mode,model,T,P,x:mode==='bubble'?composition:q.composition,y:mode==='bubble'?q.composition:composition,K:q.K,iterations:q.iterations,residual:q.residual,liquidZ:q.liquidZ,vaporZ:q.vaporZ,liquidPhi:q.liquidPhi,vaporPhi:q.vaporPhi,source:model.toUpperCase()+' phi-phi bubble/dew temperature calculation; van der Waals one-fluid mixing rule; user-supplied binary kij.'};
}
g.ThermoVLE=Object.freeze({flash,phaseRoots,rachfordRice,bubblePressure:args=>boundaryPressure('bubble',args),dewPressure:args=>boundaryPressure('dew',args),bubbleTemperature:args=>boundaryTemperature('bubble',args),dewTemperature:args=>boundaryTemperature('dew',args)});
})(window);
