const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['assets/js/eos/eos.js','assets/js/steam/region4.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const E=ctx.window.ThermoEOS,S=ctx.window.ThermoSteam;
let passed=0;
function test(name,fn){try{fn();console.log('PASS',name);passed++;}catch(e){console.error('FAIL',name,e.message);process.exitCode=1;}}
const finite=x=>assert.ok(Number.isFinite(x));
test('16 chemical records exist',()=>{const d=JSON.parse(fs.readFileSync('data/chemicals/chemicals.json'));assert.equal(d.chemicals.length,16);});
for(const model of ['vdw','rk','srk','pr'])test(model+' returns finite roots at methane test state',()=>{const r=E.calculate({model,T:250,P:2,Tc:190.56,Pc:4.599,omega:.011});assert.ok(r.rootCount>=1);r.roots.forEach(x=>{finite(x.Z);finite(x.V_m);finite(x.phi);finite(x.H_R);finite(x.S_R);assert.ok(x.Z>r.B);});});
test('low-pressure compressibility tends to unity (PR)',()=>{const r=E.calculate({model:'pr',T:250,P:.00001,Tc:190.56,Pc:4.599,omega:.011});assert.ok(Math.abs(r.vapor.Z-1)<1e-5);});
test('PR critical parameter pressure curve returns finite positive values',()=>{const p=E.pressure('pr',250,0.001,190.56,4.599,.011);finite(p);assert.ok(p>0);});
test('IF97 Region 4 saturation pressure at 373.15 K',()=>{assert.ok(Math.abs(S.pSat(373.15)-0.1014179779)<2e-9);});
test('IF97 Region 4 saturation pressure at critical temperature',()=>{assert.ok(Math.abs(S.pSat(647.096)-22.064)<1e-7);});
test('IF97 inverse saturation temperature round trip',()=>{const t=S.tSat(S.pSat(500));assert.ok(Math.abs(t-500)<1e-8);});
test('bilinear interpolation exact at an interior point',()=>{const r=S.bilinear(0,1,0,1,0,1,1,2,.25,.5);assert.ok(Math.abs(r.value-.75)<1e-12);});
test('linear interpolation exact midpoint',()=>{assert.equal(S.linear(0,10,5,25,5),15);});
test('reject out-of-range saturation query',()=>{assert.throws(()=>S.pSat(700),e=>e && e.name==='RangeError');});
test('reject interpolation extrapolation',()=>{assert.throws(()=>S.bilinear(0,1,0,1,0,1,1,2,2,.5),e=>e && e.name==='RangeError');});

test('cubic root solver recovers three known real roots',()=>{const r=E.cubicRoots(-6,11,-6);assert.equal(r.length,3);assert.ok(Math.abs(r[0]-1)<1e-10&&Math.abs(r[1]-2)<1e-10&&Math.abs(r[2]-3)<1e-10);});
test('EOS roots reconstruct the specified pressure for all four models',()=>{for(const model of ['vdw','rk','srk','pr']){const r=E.calculate({model,T:250,P:2,Tc:190.56,Pc:4.599,omega:.011});const p=E.pressure(model,250,r.vapor.V_m,190.56,4.599,.011)/1e6;assert.ok(Math.abs(p-2)<1e-7,model+' pressure reconstruction');}});
test('IF97 saturation pressure is monotonic over sampled range',()=>{let last=0;for(let T=280;T<=640;T+=10){const p=S.pSat(T);assert.ok(p>last);last=p;}});

console.log(`\n${passed} tests passed.`);process.exitCode=passed===17?0:1;
