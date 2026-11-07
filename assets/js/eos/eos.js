(function(global){
  'use strict';
  const R=8.31446261815324;
  function cbrt(x){return Math.sign(x)*Math.pow(Math.abs(x),1/3);}
  function cubicRoots(a,b,c){ // x^3 + a x^2 + b x + c = 0; real roots only
    const p=b-a*a/3, q=2*a*a*a/27-a*b/3+c, d=q*q/4+p*p*p/27;
    const eps=1e-14;
    if(d>eps){const s=Math.sqrt(d);return [cbrt(-q/2+s)+cbrt(-q/2-s)-a/3];}
    if(Math.abs(d)<=eps){const u=cbrt(-q/2);return [...new Set([2*u-a/3,-u-a/3])].sort((x,y)=>x-y);}
    const r=2*Math.sqrt(-p/3), phi=Math.acos(Math.max(-1,Math.min(1,(3*q/(2*p))*Math.sqrt(-3/p))));
    return [r*Math.cos(phi/3)-a/3,r*Math.cos((phi+2*Math.PI)/3)-a/3,r*Math.cos((phi+4*Math.PI)/3)-a/3].sort((x,y)=>x-y);
  }
  function params(model,T,Tc,PcMPa,w){
    const Pc=PcMPa*1e6, Tr=T/Tc;
    let ac,b,m=0,alpha=1,da_dT=0,u=0,v=0;
    if(model==='vdw'){ac=27/64*R*R*Tc*Tc/Pc;b=R*Tc/(8*Pc);u=0;v=0;}
    else if(model==='rk'){ac=.42748*R*R*Math.pow(Tc,2.5)/Pc/Math.sqrt(T);b=.08664*R*Tc/Pc;da_dT=-.5*ac/T;u=1;v=0;}
    else if(model==='srk'){m=.480+1.574*w-.176*w*w;alpha=Math.pow(1+m*(1-Math.sqrt(Tr)),2);ac=.42747*R*R*Tc*Tc/Pc*alpha;b=.08664*R*Tc/Pc;da_dT=-.42747*R*R*Tc*Tc/Pc*m*Math.sqrt(alpha/(T*Tc));u=1;v=0;}
    else if(model==='pr'){m=w>.491? .379642+1.48503*w-.164423*w*w+.016666*w*w*w : .37464+1.54226*w-.26992*w*w;alpha=Math.pow(1+m*(1-Math.sqrt(Tr)),2);ac=.45724*R*R*Tc*Tc/Pc*alpha;b=.07780*R*Tc/Pc;da_dT=-.45724*R*R*Tc*Tc/Pc*m*Math.sqrt(alpha/(T*Tc));u=2;v=-1;}
    else throw new Error('该模型尚未完成可验证实现。');
    if(!Number.isFinite(ac)||!Number.isFinite(b)||b<=0) throw new Error('模型参数无效，请检查 T、Tc、Pc 和 ω。');
    return {a:ac,b,m,alpha,da_dT,u,v};
  }
  function lnPhi(model,Z,A,B){
    if(Z<=B) return NaN;
    if(model==='vdw') return Z-1-Math.log(Z-B)-A/Z;
    if(model==='pr') return Z-1-Math.log(Z-B)-A/(2*Math.sqrt(2)*B)*Math.log((Z+(1+Math.sqrt(2))*B)/(Z+(1-Math.sqrt(2))*B));
    return Z-1-Math.log(Z-B)-(A/B)*Math.log(1+B/Z);
  }
  function residuals(model,Z,A,B,T,a,da_dT,b,Rlocal,PPa){
    const L=model==='pr' ? Math.log((Z+(1+Math.sqrt(2))*B)/(Z+(1-Math.sqrt(2))*B)) : Math.log(1+B/Z);
    let h=Rlocal*T*(Z-1), s=Rlocal*Math.log(Z-B);
    if(model==='vdw') h-=a*PPa/(Z*Rlocal*T);
    else if(model==='pr') { h+=(T*da_dT-a)*PPa*L/(2*Math.sqrt(2)*B*Rlocal*T); s+=da_dT*PPa*L/(2*Math.sqrt(2)*B*Rlocal*T); }
    else { h+=(T*da_dT-a)*PPa*L/(B*Rlocal*T); s+=da_dT*PPa*L/(B*Rlocal*T); }
    return {hResidual:h,sResidual:s};
  }
  function calculate({model,T,P,Tc,Pc,omega}){
    for(const [k,v] of Object.entries({T,P,Tc,Pc,omega})) if(!Number.isFinite(Number(v))) throw new Error(`${k} 不是有效数字。`);
    T=Number(T);P=Number(P);Tc=Number(Tc);Pc=Number(Pc);omega=Number(omega);
    if(T<=0||P<=0||Tc<=0||Pc<=0) throw new Error('温度、压力及临界参数必须大于 0。');
    const p=params(model,T,Tc,Pc,omega), PPa=P*1e6, A=p.a*PPa/(R*R*T*T), B=p.b*PPa/(R*T);
    let c2,c1,c0;
    c2=(p.u-1)*B-1;
    c1=A-p.u*B-(p.u-p.v)*B*B;
    c0=-(A*B+p.v*B*B+p.v*B*B*B);
    const roots=cubicRoots(c2,c1,c0).filter(z=>Number.isFinite(z)&&z>B&&z>0).sort((x,y)=>x-y);
    if(!roots.length) throw new Error('在当前条件下未找到满足 Z > B 的正实根。');
    const vap=roots[roots.length-1], liq=roots[0], list=roots.map((z)=>{
      const vol=z*R*T/PPa;
      const lphi=lnPhi(model,z,A,B); const dep=residuals(model,z,A,B,T,p.a,p.da_dT,p.b,R,PPa);
      return {Z:z,V_m:vol,ln_phi:lphi,phi:Math.exp(lphi),H_R:dep.hResidual,S_R:dep.sResidual};
    });
    return {model,T_K:T,P_MPa:P,Tc_K:Tc,Pc_MPa:Pc,omega,A,B,roots:list,vapor:list[list.length-1],liquid:list[0],rootCount:list.length,parameters:{a:p.a,b:p.b,alpha:p.alpha,da_dT:p.da_dT},validity:'cubic-eos-model-result'};
  }
  function pressure(model,T,V,Tc,PcMPa,w){
    const p=params(model,T,Tc,PcMPa,w),den=V*V+p.u*p.b*V+p.v*p.b*p.b;
    return R*T/(V-p.b)-p.a/den;
  }
  global.ThermoEOS={R,cubicRoots,calculate,pressure,params};
})(window);
