(function(g){
'use strict';
const R=8.3144598, OMEGA_REF=.3978;
const C=Object.freeze({
 simple:{b1:.1181193,b2:.265728,b3:.154790,b4:.030323,c1:.0236744,c2:.0186984,c3:0,c4:.042724,d1:.155428e-4,d2:.623689e-4,beta:.65392,gamma:.060167},
 reference:{b1:.2026579,b2:.331511,b3:.027655,b4:.203488,c1:.0313385,c2:.0503618,c3:.016901,c4:.041577,d1:.48736e-4,d2:.0740336e-4,beta:1.226,gamma:.03754}
});
const finite=Number.isFinite;
function positive(v,n){if(!finite(Number(v))||Number(v)<=0)throw new TypeError(n+' must be finite and positive.');return Number(v);}
function contribution(tau,x,c){
 const B=c.b1-c.b2*tau-c.b3*tau*tau-c.b4*tau*tau*tau;
 const Cc=c.c1-c.c2*tau+c.c3*tau*tau*tau;
 const D=c.d1+c.d2*tau;
 const q=c.gamma*x*x, e=Math.exp(-q), F=(q+c.beta+1)*e;
 const ar=B*x+.5*Cc*x*x+.2*D*Math.pow(x,5)-c.c4*Math.pow(tau,3)/(2*c.gamma)*F+c.c4*Math.pow(tau,3)/(2*c.gamma)*(c.beta+1);
 const ax=B+Cc*x+D*Math.pow(x,4)+c.c4*Math.pow(tau,3)*x*(q+c.beta)*e;
 const at=(-c.b2-2*c.b3*tau-3*c.b4*tau*tau)*x+.5*(-c.c2+3*c.c3*tau*tau)*x*x+.2*c.d2*Math.pow(x,5)-3*c.c4*tau*tau/(2*c.gamma)*(F-(c.beta+1));
 return {ar,ax,at};
}
function reducingParameters(components,kTij){
 if(!Array.isArray(components)||components.length<1)throw new TypeError('At least one component is required.');
 const sx=components.reduce((s,c)=>s+Number(c.x),0);
 if(!finite(sx)||Math.abs(sx-1)>1e-9||components.some(c=>!finite(c.x)||c.x<0))throw new RangeError('Mole fractions must be non-negative and sum to one.');
 const vcs=components.map((c,i)=>{positive(c.Tc,'Tc['+i+']');positive(c.Pc,'Pc['+i+']');if(!finite(c.omega))throw new TypeError('Acentric factor must be finite.');return (.2905-.085*Number(c.omega))*R*Number(c.Tc)/(Number(c.Pc)*1e6);});
 let vc=0,tNum=0;
 for(let i=0;i<components.length;i++)for(let j=0;j<components.length;j++){
  const vij=Math.pow(Math.cbrt(vcs[i])+Math.cbrt(vcs[j]),3)/8;
  const k=kTij&&kTij[i]&&finite(kTij[i][j])?Number(kTij[i][j]):1;
  if(!(k>0&&k<2))throw new RangeError('LKP temperature interaction kT,ij must be between 0 and 2.');
  const tcij=k*Math.sqrt(Number(components[i].Tc)*Number(components[j].Tc));
  const w=Number(components[i].x)*Number(components[j].x);
  vc+=w*vij;tNum+=w*Math.pow(vij,.25)*tcij;
 }
 if(!(vc>0&&tNum>0))throw new RangeError('Invalid LKP reducing parameters.');
 const omega=components.reduce((s,c)=>s+Number(c.x)*Number(c.omega),0),Zc=.2905-.085*omega;
 return {vc,Tc:tNum/Math.pow(vc,.25),omega,Zc};
}
function residualHelmholtz(T,rho,components,kTij){
 positive(T,'Temperature');positive(rho,'Molar density');
 const red=reducingParameters(components,kTij),tau=red.Tc/T,delta=rho*red.vc,x=delta/red.Zc;
 const s=contribution(tau,x,C.simple),r=contribution(tau,x,C.reference),w=red.omega/OMEGA_REF;
 return {red,tau,delta,ar:s.ar+w*(r.ar-s.ar),ad:(s.ax+w*(r.ax-s.ax))/red.Zc,at:s.at+w*(r.at-s.at)};
}
function pressureFromDensity(T,rho,components,kTij){
 const a=residualHelmholtz(T,rho,components,kTij),Z=1+a.delta*a.ad,P=rho*R*T*Z/1e6;
 return {P,Z,residual:a};
}
function unique(values,tol=1e-7){return values.filter((v,i)=>i===0||Math.abs(v-values[i-1])>tol*Math.max(1,v));}
function bisect(fn,a,b,fa,fb,scale){
 for(let i=0;i<90;i++){const m=(a+b)/2,fm=fn(m);if(!finite(fm))throw new Error('Non-finite value in LKP root solver.');if(Math.abs(fm)<1e-11*Math.max(1,scale)||Math.abs(b-a)<1e-11*Math.max(1,m))return m;if(fa*fm<=0){b=m;fb=fm;}else{a=m;fa=fm;}}
 return (a+b)/2;
}
function densityRoots(T,P,components,kTij,options={}){
 positive(T,'Temperature');positive(P,'Pressure');
 const lo=options.rhoMin||1e-7,hi=options.rhoMax||25000,n=options.scanPoints||1200;
 const f=r=>pressureFromDensity(T,r,components,kTij).P-P,roots=[];
 let lastR=lo,lastF=f(lo);
 for(let i=1;i<=n;i++){const r=Math.exp(Math.log(lo)+(Math.log(hi)-Math.log(lo))*i/n);let v;try{v=f(r);}catch(e){lastR=r;lastF=NaN;continue;}if(finite(lastF)&&finite(v)&&lastF*v<0)roots.push(bisect(f,lastR,r,lastF,v,P));lastR=r;lastF=v;}
 return unique(roots.sort((a,b)=>a-b));
}
function stateAtDensity(T,rho,P,components,kTij){
 const a=residualHelmholtz(T,rho,components,kTij),Z=1+a.delta*a.ad;
 if(!(Z>0))throw new RangeError('Selected LKP density root has non-positive compressibility.');
 const lnPhi=a.ar+a.delta*a.ad-Math.log(Z);
 return {T,P,rho,Z,phi:Math.exp(lnPhi),lnPhi,Hres:R*T*(a.tau*a.at+a.delta*a.ad),Sres:R*(a.tau*a.at-a.ar),Ures:R*T*a.tau*a.at,Hres_RT:a.tau*a.at+a.delta*a.ad,Sres_R:a.tau*a.at-a.ar,model:'Lee–Kesler–Plöcker two-reference-fluid Helmholtz EOS',source:'Lee & Kesler (1975); NIST-hosted teqp LKP model documentation'};
}
function calculate(T,P,components,kTij,options={}){
 const roots=densityRoots(T,P,components,kTij,options);
 if(!roots.length)throw new RangeError('LKP EOS found no positive density root in the search interval.');
 const states=roots.map(r=>stateAtDensity(T,r,P,components,kTij));
 return {roots:states,vapor:states[0],liquid:states[states.length-1],rootCount:states.length,reducing:reducingParameters(components,kTij)};
}
function pureState(Tr,Pr,omega){
 if(!finite(Tr)||Tr<.3||Tr>5)throw new RangeError('Reduced temperature Tr must be within 0.3–5.');
 if(!finite(Pr)||Pr<=0||Pr>30)throw new RangeError('Reduced pressure Pr must be within (0,30].');
 if(!finite(omega)||omega<-.25||omega>1)throw new RangeError('Acentric factor must be within the numerical envelope −0.25 to 1.');
 const component=[{Tc:1,Pc:1,omega,x:1}],Zc=.2905-.085*omega,vc=Zc*R/1e6,rhoScale=1/vc;
 const f=delta=>{const s=contribution(1/Tr,delta/Zc,C.simple),r=contribution(1/Tr,delta/Zc,C.reference),w=omega/OMEGA_REF,ad=(s.ax+w*(r.ax-s.ax))/Zc,Z=1+delta*ad;return delta*Tr*Z/Zc-Pr;};
 const roots=[],lo=1e-7,hi=8,n=1800;let last=lo,lastF=f(lo);
 for(let i=1;i<=n;i++){const d=Math.exp(Math.log(lo)+(Math.log(hi)-Math.log(lo))*i/n),v=f(d);if(finite(lastF)&&finite(v)&&lastF*v<0)roots.push(bisect(f,last,d,lastF,v,Pr));last=d;lastF=v;}
 const deltas=unique(roots.sort((a,b)=>a-b));
 if(!deltas.length)throw new RangeError('No positive LKP density root found for this Tr/Pr state.');
 const states=deltas.map(delta=>({...stateAtDensity(Tr,delta*rhoScale,Pr,component,null),Tr,Pr,delta,rhoReduced:delta}));
 return {roots:states,vapor:states[0],liquid:states[states.length-1],rootCount:states.length,Tr,Pr,omega,Zc};
}
function curve(Tr,omega,pressures){
 if(!Array.isArray(pressures))throw new TypeError('Pressures must be an array.');
 return pressures.map(Pr=>{try{const q=pureState(Tr,Pr,omega).vapor;return {Tr,Pr,Z:q.Z,phi:q.phi,Hres_RT:q.Hres_RT,Sres_R:q.Sres_R};}catch(e){return {Tr,Pr,Z:null,error:e.message};}});
}
g.ThermoLKP=Object.freeze({R,OMEGA_REF,COEFFICIENTS:C,reducingParameters,residualHelmholtz,pressureFromDensity,densityRoots,calculate,pureState,curve});
})(window);
