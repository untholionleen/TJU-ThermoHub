(function(g){'use strict';
 const n=[0.11670521452767e4,-0.72421316703206e6,-0.17073846940092e2,0.12020824702470e5,-0.32325550322333e7,0.14915108613530e2,-0.48232657361591e4,0.40511340542057e6,-0.23855557567849e0,0.65017534844798e3];
 function pSat(T){if(!Number.isFinite(T)||T<273.15||T>647.096)throw new RangeError('IF97 Region 4 温度范围为 273.15–647.096 K。');const theta=T+n[8]/(T-n[9]);const A=theta*theta+n[0]*theta+n[1],B=n[2]*theta*theta+n[3]*theta+n[4],C=n[5]*theta*theta+n[6]*theta+n[7];const d=B*B-4*A*C;if(d<0)throw new Error('饱和方程判别式为负。');return Math.pow(2*C/(-B+Math.sqrt(d)),4);}
 function tSat(P){if(!Number.isFinite(P)||P<0.000611657||P>22.064)throw new RangeError('压力必须在三相点压力与临界压力之间。');let lo=273.15,hi=647.096;for(let i=0;i<100;i++){const m=(lo+hi)/2;if(pSat(m)>P)hi=m;else lo=m;}return (lo+hi)/2;}
 function linear(x0,x1,y0,y1,x){if(x1===x0)throw new Error('插值区间两端不能相同。');if(x<Math.min(x0,x1)||x>Math.max(x0,x1))throw new RangeError('目标点超出插值区间，不允许静默外推。');return y0+(x-x0)/(x1-x0)*(y1-y0);}
 function bilinear(x0,x1,y0,y1,f00,f10,f01,f11,x,y){if(x1===x0||y1===y0)throw new Error('网格边长不能为零。');if(x<Math.min(x0,x1)||x>Math.max(x0,x1)||y<Math.min(y0,y1)||y>Math.max(y0,y1))throw new RangeError('目标点超出网格范围，不允许静默外推。');const t=(x-x0)/(x1-x0),u=(y-y0)/(y1-y0);return {value:(1-t)*(1-u)*f00+t*(1-u)*f10+(1-t)*u*f01+t*u*f11,t,u};}
 g.ThermoSteam={pSat,tSat,linear,bilinear};
})(window);
