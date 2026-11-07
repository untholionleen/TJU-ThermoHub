(function(g){'use strict';
 const D=[
 {id:'D1',zh:'范德华方程临界参数',en:'van der Waals critical parameters',verified:true,target:'module1',steps:[
  {eq:'<math display="block"><mi>P</mi><mo>=</mo><mfrac><mrow><mi>R</mi><mi>T</mi></mrow><mrow><mi>V</mi><mo>−</mo><mi>b</mi></mrow></mfrac><mo>−</mo><mfrac><mi>a</mi><msup><mi>V</mi><mn>2</mn></msup></mfrac></math>',zh:'从范德华状态方程出发，其中 a、b 为物质参数。',en:'Start from the van der Waals equation, where a and b are substance parameters.'},
  {eq:'<math display="block"><msub><mrow><mo>(</mo><mfrac><mrow><mo>∂</mo><mi>P</mi></mrow><mrow><mo>∂</mo><mi>V</mi></mrow></mfrac><mo>)</mo></mrow><mi>T</mi></msub><mo>=</mo><mo>−</mo><mfrac><mrow><mi>R</mi><mi>T</mi></mrow><msup><mrow><mo>(</mo><mi>V</mi><mo>−</mo><mi>b</mi><mo>)</mo></mrow><mn>2</mn></msup></mfrac><mo>+</mo><mfrac><mrow><mn>2</mn><mi>a</mi></mrow><msup><mi>V</mi><mn>3</mn></msup></mfrac><mo>=</mo><mn>0</mn></math>',zh:'临界等温线上，一阶偏导数为零。',en:'At the critical isotherm, the first volume derivative is zero.'},
  {eq:'<math display="block"><msub><mrow><mo>(</mo><mfrac><mrow><msup><mo>∂</mo><mn>2</mn></msup><mi>P</mi></mrow><mrow><mo>∂</mo><msup><mi>V</mi><mn>2</mn></msup></mrow></mfrac><mo>)</mo></mrow><mi>T</mi></msub><mo>=</mo><mfrac><mrow><mn>2</mn><mi>R</mi><mi>T</mi></mrow><msup><mrow><mo>(</mo><mi>V</mi><mo>−</mo><mi>b</mi><mo>)</mo></mrow><mn>3</mn></msup></mfrac><mo>−</mo><mfrac><mrow><mn>6</mn><mi>a</mi></mrow><msup><mi>V</mi><mn>4</mn></msup></mfrac><mo>=</mo><mn>0</mn></math>',zh:'临界等温线上，二阶偏导数也为零。',en:'The second volume derivative is also zero at the critical point.'},
  {eq:'<math display="block"><msub><mi>V</mi><mi>c</mi></msub><mo>=</mo><mn>3</mn><mi>b</mi><mo>,</mo><mspace width="1em"/><msub><mi>T</mi><mi>c</mi></msub><mo>=</mo><mfrac><mrow><mn>8</mn><mi>a</mi></mrow><mrow><mn>27</mn><mi>R</mi><mi>b</mi></mrow></mfrac></math>',zh:'联立两个临界条件，可得到临界摩尔体积和临界温度。',en:'Solving the two critical conditions gives the critical molar volume and temperature.'},
  {eq:'<math display="block"><msub><mi>P</mi><mi>c</mi></msub><mo>=</mo><mfrac><mi>a</mi><mrow><mn>27</mn><msup><mi>b</mi><mn>2</mn></msup></mrow></mfrac><mo>,</mo><mspace width=".7em"/><mi>a</mi><mo>=</mo><mfrac><mrow><mn>27</mn><msup><mi>R</mi><mn>2</mn></msup><msup><msub><mi>T</mi><mi>c</mi></msub><mn>2</mn></msup></mrow><mrow><mn>64</mn><msub><mi>P</mi><mi>c</mi></msub></mrow></mfrac><mo>,</mo><mspace width=".7em"/><mi>b</mi><mo>=</mo><mfrac><mrow><mi>R</mi><msub><mi>T</mi><mi>c</mi></msub></mrow><mrow><mn>8</mn><msub><mi>P</mi><mi>c</mi></msub></mrow></mfrac></math>',zh:'再代回状态方程得到 Pc，并整理出 a、b 的临界参数表达式。',en:'Substitution into the EOS yields Pc and the parameter expressions in terms of critical properties.'}
 ]},
 {id:'D2',zh:'Peng–Robinson 参数与温度函数',en:'Peng–Robinson parameters and temperature function',verified:false,steps:[]},
 {id:'D3',zh:'立方型状态方程的 Z 多项式',en:'Compressibility-factor cubic polynomial',verified:false,steps:[]},
 {id:'D4',zh:'逸度系数与相平衡判据',en:'Fugacity coefficient and phase-equilibrium criterion',verified:false,steps:[]},
 {id:'D5',zh:'剩余焓与剩余熵',en:'Enthalpy and entropy departure functions',verified:false,steps:[]},
 {id:'D6',zh:'Maxwell 等面积条件',en:'Maxwell equal-area condition',verified:false,steps:[]},
 {id:'D7',zh:'Clapeyron 与 Clausius–Clapeyron 方程',en:'Clapeyron and Clausius–Clapeyron equations',verified:false,steps:[]},
 {id:'D8',zh:'维里方程与低压压缩因子',en:'Virial equation and low-pressure compressibility',verified:false,steps:[]},
 {id:'D9',zh:'Joule–Thomson 系数',en:'Joule–Thomson coefficient',verified:false,steps:[]},
 {id:'D10',zh:'Gibbs–Duhem 方程',en:'Gibbs–Duhem equation',verified:false,steps:[]},
 {id:'D11',zh:'Rachford–Rice 闪蒸物料衡算',en:'Rachford–Rice flash material balance',verified:false,steps:[]}
 ];
 g.ThermoDerivations={all:D};
})(window);
