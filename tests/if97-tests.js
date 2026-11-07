const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={console,Math,Number,Map,Object,Array,Error,TypeError,RangeError};
ctx.window=ctx;ctx.global=ctx;vm.createContext(ctx);
const files=[
 'assets/vendor/if97/NeutriumJS.thermo.IAPWS97.js',
 'assets/vendor/if97/NeutriumJS.thermo.IAPWS97.PT.js',
 'assets/vendor/if97/NeutriumJS.thermo.IAPWS97.PH.js',
 'assets/vendor/if97/NeutriumJS.thermo.IAPWS97.PS.js',
 'assets/vendor/if97/NeutriumJS.thermo.IAPWS97.HS.js',
 'assets/js/steam/if97.js'
];
for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const api=ctx.ThermoIF97;let passed=0;
function test(name,fn){try{fn();console.log('PASS',name);passed++;}catch(e){console.error('FAIL',name,e.stack||e);process.exitCode=1;}}
function near(a,b,t,label){assert.ok(Number.isFinite(a),label+' nonfinite');assert.ok(Math.abs(a-b)<=t,label+' mismatch '+a+' vs '+b);}
test('Region 1 reference state P=3 MPa,T=300 K',()=>{const s=api.PT(3,300);assert.equal(s.region,1);near(s.v,.00100215168,1e-10,'v');near(s.h,115.331273,2e-6,'h');near(s.s,.392294792,2e-9,'s');near(s.cp,4.17301218,2e-7,'cp');});
test('Region 2 reference state P=0.0035 MPa,T=300 K',()=>{const s=api.PT(.0035,300);assert.equal(s.region,2);near(s.v,39.4913866,2e-7,'v');near(s.h,2549.91145,2e-5,'h');near(s.s,8.52238967,2e-8,'s');});
test('Region 3 reference state P=25.5837018 MPa,T=650 K',()=>{const s=api.PT(25.5837018,650);assert.equal(s.region,3);near(s.v,.002,1e-8,'v');near(s.h,1863.43019,0.003,'h');near(s.s,4.05427273,2e-8,'s');});
test('Region 5 reference state P=0.5 MPa,T=1500 K',()=>{const s=api.PT(.5,1500);assert.equal(s.region,5);near(s.v,1.3845509,2e-7,'v');near(s.h,5219.76855,2e-5,'h');near(s.s,9.65408875,2e-8,'s');});
test('Region 5 upper temperature is supported at 30 MPa only below 50 MPa',()=>{const s=api.PT(30,2000);assert.equal(s.region,5);near(s.h,6571.22604,2e-5,'h');});
test('Region 5 rejects pressure above 50 MPa',()=>{assert.throws(()=>api.PT(60,1500),RangeError);});
test('Region 4 saturation pressure at 373.15 K',()=>{near(api.saturationAtT(373.15).P,.1014179779,2e-8,'Psat');});
test('Region 4 inverse saturation temperature',()=>{near(api.saturationAtP(.1014179779).T,373.15,2e-6,'Tsat');});
test('Region 4 saturated liquid/vapor enthalpy reference at 100 C',()=>{const sat=api.saturationAtT(373.15);near(sat.hf,419.099155,0.001,'hf');near(sat.hg,2675.57,0.1,'hg');});
test('saturated liquid/vapour values are ordered',()=>{const s=api.saturationAtT(373.15);assert.ok(s.liquid.v<s.vapor.v);assert.ok(s.liquid.h<s.vapor.h);assert.ok(s.liquid.s<s.vapor.s);});
test('quality lever rule',()=>{const s=api.saturationAtT(373.15),m=api.solve('TX',373.15,.5);near(m.h,(s.hf+s.hg)/2,1e-9,'h quality');near(m.v,(s.vf+s.vg)/2,1e-9,'v quality');});
test('Region 3 saturation density roots at 630 K',()=>{const sat=api.saturationAtT(630);assert.equal(sat.critical,false);assert.ok(sat.liquid.rho>sat.vapor.rho);near(sat.liquid.p,sat.P,2e-6,'liquid saturation pressure');near(sat.vapor.p,sat.P,2e-6,'vapor saturation pressure');});
test('HS backward recovers saturated mixture quality',()=>{const sat=api.saturationAtT(373.15),x=.4,h=sat.hf+x*sat.hfg,ss=sat.sf+x*sat.sfg,st=api.HS(h,ss);assert.equal(st.region,4);near(st.x,x,.002,'quality from HS');});
test('PH/PS do not fabricate Region 5 backward results',()=>{assert.throws(()=>api.PH(.5,5219.76855));});
test('PT rejects on saturation line without quality',()=>{assert.throws(()=>api.PT(.1014179779,373.15),RangeError);});
test('PH inverse recovers the R1 reference temperature',()=>{const s=api.PH(3,115.331273);near(s.t,300,0.02,'T from PH');});
test('PS inverse recovers the R2 reference temperature',()=>{const s=api.PS(.0035,8.52238967);near(s.t,300,0.02,'T from PS');});
console.log('\n'+passed+' IF97 tests passed.');
process.exitCode=passed===17?0:1;
