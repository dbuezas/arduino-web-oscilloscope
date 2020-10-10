(this["webpackJsonparduino-web-oscilloscope"]=this["webpackJsonparduino-web-oscilloscope"]||[]).push([[0],{135:function(e,t,a){"use strict";var n=a(223);const r=new class{constructor(){this.port=void 0,this.reader=void 0,this.writer=void 0}async close(){console.log("closing"),this.reader&&(await this.reader.reader.cancel(),this.reader=void 0),this.writer&&(await this.writer.close(),this.writer=void 0),this.port&&(await this.port.close(),this.port=void 0),console.log("closed")}async connectWithPaired(e){const[t]=await navigator.serial.getPorts();if(!t)throw new Error("no paired");return this._connect(e,t)}async connect(e){const t=await navigator.serial.requestPort({});return this._connect(e,t)}async _connect(e,t){e={baudRate:9600,dataBits:8,stopBits:1,parity:"none",bufferSize:255,rtscts:!1,xon:!1,xoff:!1,...e},this.port&&await this.close(),this.port=t,await this.port.open(e),this.reader=new n.ReadableWebToNodeStream(this.port.readable),this.writer=this.port.writable.getWriter();const a=this.reader;return a.write=(e,t)=>(this.writer.write(e).then(()=>t(null),t),!0),a}};t.a=r,window.serial2=r},222:function(e,t,a){"use strict";(function(e){var n=a(0),r=a.n(n),c=a(59),l=a(462),i=a(461),o=a(135),s=a(224),u=a(225),d=a.n(u),m=a(226);const f=new(a.n(m).a),p={baudRate:57600,bufferSize:2e4},v={signature:e.from([30,149,15]),pageSize:128,timeout:400};t.a=function(){const[e,t]=Object(n.useState)(0),[a,u]=Object(n.useState)("active"),[m,g]=Object(n.useState)(!0),[b,h]=Object(n.useState)("");return r.a.createElement(r.a.Fragment,null,r.a.createElement("br",null),r.a.createElement(c.a,{color:"green",onClick:async()=>{h("Uploading...");try{g(!0);const e=await fetch("/arduino-web-oscilloscope/src.ino.hex").then(e=>e.text()).then(e=>d.a.parse(e).data),a=await o.a.connect(p);u("active"),t(0),g(!1),await(async(e,t,a,n)=>{let r=0;f.log=e=>{if("loaded page"===e){r+=1;const e=Math.round(100*r/(t.length/a.pageSize));n(e)}},await s.a.series([f.sync.bind(f,e,3,a.timeout),f.sync.bind(f,e,3,a.timeout),f.sync.bind(f,e,3,a.timeout),f.verifySignature.bind(f,e,a.signature,a.timeout),f.setOptions.bind(f,e,{},a.timeout),f.enterProgrammingMode.bind(f,e,a.timeout),f.upload.bind(f,e,t,a.pageSize,a.timeout),f.exitProgrammingMode.bind(f,e,a.timeout)])})(a,e,v,t),u("success"),h(`Uploaded ${e.length} bytes.`)}catch(e){console.error(e),h(e.toString()),u("fail")}o.a.close()}},r.a.createElement(l.a,{icon:"upload2"})," Upload lgt328p Firmware"),!m&&r.a.createElement(r.a.Fragment,null,r.a.createElement(i.a.Line,{percent:e,status:a}),b))}}).call(this,a(29).Buffer)},273:function(e,t,a){e.exports=a(458)},278:function(e,t,a){},444:function(e,t){},446:function(e,t){},458:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),c=a(25),l=a.n(c),i=(a(278),a(227)),o=a(3);function s(e,t){const a=e.data.slice(e.i,e.i+t);return e.i+=t,Array.from(a)}function u(e){const t=e.data[e.i];return e.i++,t}const d=u;function m(e){const t=e.data[e.i];e.i++;const a=e.data[e.i];return e.i++,a<<8|t}function f(e){const t={data:e,i:0},a=u(t),n=u(t),r=function(e){const t=e.data.slice(e.i,e.i+4);e.i+=4;const a=t.reverse().reduce((e,t)=>(e<<8)+t);if(0===a)return 0;const n=a>>>31?-1:1;let r=(a>>>23&255)-127;const c=(8388608+(8388607&a)).toString(2);let l=0;for(let i=0;i<c.length;i+=1)l+=parseInt(c[i])?Math.pow(2,r):0,r--;return l*n}(t),c=m(t),l=u(t),i=u(t),o=u(t),f=u(t),p=d(t),v=d(t),g=d(t),b=m(t),h=m(t),y=m(t),E=[1&f?s(t,y-h):[],2&f?s(t,y-h):[]],w=252&f?s(t,y-h):[],O=[4,8,16,32].map(e=>f&e?w.map(t=>t&e&&1):[]),j=I[l],x=[...E.map(e=>e.map(e=>e/256*j)),...O.map((e,t)=>e.map(e=>e*j/8+(t+.25)*j/4))].map(e=>e.map((e,t)=>({v:e,t:(t+1)*r})));return{triggerVoltage:a,triggerDir:n,secPerSample:r,triggerPos:c,amplifier:l,triggerMode:i,triggerChannel:o,isChannelOn:f,needData:p,forceUIUpdate:v,didTrigger:g,freeMemory:b,samplesPerBuffer:y,buffers:x}}const p=[0,1,255,253],v=(e,t)=>{const a=e.map(e=>String.fromCharCode(e)).join(""),n=t.map(e=>String.fromCharCode(e)).join(""),r=n.indexOf(a);return[r,n.indexOf(a,r+a.length)]},g=e=>new Promise(t=>setTimeout(t,e));const b=new class{constructor(){this.reader=void 0,this.writer=void 0,this.port=void 0,this.readbuffer=[],this.outputDone=void 0,this.write=async e=>{this.writer&&await this.writer.write(e)}}async close(){console.log("closing"),this.reader&&(await this.reader.cancel(),this.reader=void 0),this.writer&&(await this.writer.close(),this.writer=void 0),this.outputDone&&(await this.outputDone,this.outputDone=void 0),this.port&&(await this.port.close(),this.port=void 0),console.log("closed")}async connectWithPaired(e){const t=await navigator.serial.getPorts();if(console.log(t),!t.length)throw new Error("no paired");this._connect(e,t[0])}async connect(e){const t=await navigator.serial.requestPort({});this._connect(e,t)}async _connect(e,t){e={baudRate:9600,dataBits:8,stopBits:1,parity:"none",bufferSize:255,rtscts:!1,xon:!1,xoff:!1,...e},this.port&&await this.close(),this.port=t,await this.port.open(e),this.readbuffer=[],this.reader=this.port.readable.getReader();const a=new TextEncoderStream;this.outputDone=a.readable.pipeTo(this.port.writable);const n=a.writable;this.writer=n.getWriter()}onData(e){const t=()=>{let t=!0;for(;t;){const[a,n]=v(p,this.readbuffer);if(a>-1&&n>-1){const t=this.readbuffer.slice(a+p.length,n);this.readbuffer=this.readbuffer.slice(n);const r=(t.pop()<<8)+t.pop(),c=t.reduce((e,t)=>e+t,0)%Math.pow(2,16);r===c?e(t):console.error(`Checksum error: ${c}\u2260${r}`)}else t=!1}};let a=!0;return(async()=>{for(;a;){if(await g(16),!this.reader)continue;const{value:e}=await this.reader.read();void 0!==e&&(this.readbuffer.push(...e),t())}})(),()=>{a=!1}}};var h=b;function y(e){return Object(o.d)({key:"memo"+e.key,get:({get:t})=>t(e),set:({set:t,get:a},n)=>{a(e)!==n&&t(e,n)}})}function E({key:e,ui2mcu:t,mcu2ui:a,default:n}){const r=y(Object(o.c)({key:e,default:t(n,null)})),c=h.write;return{send:Object(o.d)({key:e+"-selector",get:({get:e})=>a(e(r),e),set:({set:a,get:n,reset:l},i)=>{if(i instanceof o.a)return l(r);a(r,t(i,n)),c(e+t(i,n)+">")}}),receive:Object(o.d)({key:e+"-receive-selector",get:()=>{throw new Error("cant get here")},set:({set:e},t)=>{if(t instanceof o.a)throw new Error("no reset allowed");e(r,t)}})}}window.serial=b,window.addEventListener("beforeunload",()=>b.close());var w=a(203),O=a.n(w);function j(e){let t=e.map(({v:e})=>e);if(0===t.length)return[];if(t.length<2)return console.log("fix me"),[];const a=e.length,n=e[a-1].t-e[a-2].t,r=(c=t).reduce((e,t)=>e+t,0)/c.length;var c;t=t.map(e=>e-r);const l=Math.ceil(Math.log2(512)),i=Math.pow(2,l)-t.length;let o=t;i>0&&(o=[...t,...Array(i).fill(0)]),i<0&&(o=t.slice(0,512));return O()(o).map(e=>512*e/t.length).map((e,t)=>({v:e,t:n*t}))}var x=window;const k=E({key:"V",ui2mcu:(e,t)=>{const[a,,n]=t?t(_):[0,5,5];return Math.ceil((e+a)/n*255)},mcu2ui:(e,t)=>{const[a,,n]=t?t(_):[0,5,5];return e/255*n+a},default:1}),S=E({key:"P",ui2mcu:(e,t)=>{const a=t?t(R.send):512,n=e*a;return n<0?0:n>a-1?a-1:n},mcu2ui:(e,t)=>e/(t?t(R.send):512),default:.5}),M=E({key:"C",ui2mcu:e=>e,mcu2ui:e=>e,default:275e-8}),C=E({key:"R",ui2mcu:e=>e,mcu2ui:e=>e,default:0});let N;!function(e){e.FALLING="Falling",e.RISING="Rising"}(N||(N={}));const D=E({key:"D",ui2mcu:e=>e===N.RISING?0:1,mcu2ui:e=>e?N.FALLING:N.RISING,default:N.FALLING}),A=E({key:"T",ui2mcu:e=>e,mcu2ui:e=>e,default:0}),z=E({key:"B",ui2mcu:e=>e.map(e=>e?1:0).reduce((e,t,a)=>e+(t<<a),0),mcu2ui:e=>Array(8).fill(0).map((t,a)=>Boolean(e&1<<a)),default:[!0,!1,!1,!1,!1,!1]}),F=(e,t,a)=>e<t?t:e>a?a:e,I=[25,6.25,5,3.125,1.5625,.78125,.78125,.625,.390625,.3125,.1953125,.15625],P=E({key:"A",ui2mcu:e=>F(e,0,I.length-1),mcu2ui:e=>e,default:1}),R=E({key:"S",ui2mcu:e=>e,mcu2ui:e=>e,default:512});let L;!function(e){e.AUTO="Auto",e.NORMAL="Normal",e.SINGLE="Single",e.SLOW="Slow"}(L||(L={}));const T=E({key:"M",ui2mcu:e=>Object.values(L).indexOf(e),mcu2ui:e=>Object.values(L)[e],default:L.AUTO}),U=Object(o.c)({key:"data",default:[...new Array(8)].map(()=>[])}),B=y(Object(o.c)({key:"is-running",default:!0})),W=y(Object(o.c)({key:"oversampling-factor",default:0})),V=Object(o.c)({key:"xy-mode",default:!1}),G=Object(o.c)({key:"fft0",default:!1}),H=Object(o.c)({key:"fft1",default:!1}),X=y(Object(o.c)({key:"did-trigger",default:!1})),Y=y(Object(o.c)({key:"free-memory",default:0})),$=Object(o.d)({key:"frequency",get:({get:e})=>function(e){if(e.length<2)return 0;const t=function(e){let t=e[0];return e.map(e=>(t=.5*t+.5*e,t))}(e.map(({v:e})=>e)),a=(Math.max(...t)+Math.min(...t))/2;let n=-1,r=0,c=0;for(let l=1;l<e.length;l++){e[l-1].v<a&&e[l].v>=a&&(c++,n<0&&(n=e[l].t),r=e[l].t)}return(c-1)/(r-n)}(e(U)[0])}),q=Object(o.d)({key:"voltages",get:({get:e})=>{const t=e(U)[0].map(({v:e})=>e),a=Math.max(...t),n=Math.min(...t),r=a-n;return{vavr:(e=>e.reduce((e,t)=>e+t,0))(t)/t.length,vpp:r,vmin:n,vmax:a}}}),_=Object(o.d)({key:"voltage-range",get:({get:e})=>{const t=I[e(P.send)];return[0,t,t-0]}}),J=Object(o.d)({key:"sendFullState-this shouldnt be a selector",get:()=>null,set:({get:e,set:t})=>{t(S.send,e(S.send)),t(M.send,e(M.send)),t(R.send,e(R.send)),t(P.send,e(P.send)),t(k.send,e(k.send)),t(D.send,e(D.send)),t(A.send,e(A.send)),t(T.send,e(T.send)),t(z.send,e(z.send))}}),K=Object(o.d)({key:"receiveFullState-this shouldnt be a selector",get:()=>{throw new Error("write only selector")},set:({set:e},t)=>{t instanceof o.a||(e(S.receive,t.triggerPos),e(M.receive,t.secPerSample),e(R.receive,t.samplesPerBuffer),e(P.receive,t.amplifier),e(k.receive,t.triggerVoltage),e(D.receive,t.triggerDir),e(A.receive,t.triggerChannel),e(T.receive,t.triggerMode),e(z.receive,t.isChannelOn))}}),Q=Object(o.d)({key:"all-data-this shouldnt be a selector",get:()=>[],set:({set:e,get:t},a)=>{if(x.$recoilDebugStates=[],a instanceof o.a)return;if(0===a.length)return;const n=f(a);n.needData&&e(J,null),n.forceUIUpdate&&e(K,n);let r=n.buffers;e(Y,n.freeMemory),e(X,!!n.didTrigger);if(t(B)&&r.some(e=>e.length>0)){const a=t(U),n=t(W);if(n>0){const e=1-2/(n+1);r=r.map((t,n)=>function(e,t,a){return t.map(({v:t,t:n},r)=>{var c;return{t:n,v:((null===(c=a[r])||void 0===c?void 0:c.v)||0)*e+t*(1-e)}})}(e,r[n],a[n]))}if(t(T.send)===L.SLOW){const e=Math.max(...a.map(e=>{var t;return(null===(t=e[e.length-1])||void 0===t?void 0:t.t)||0}));r=r.map((t,n)=>[...a[n],...t.map(({v:t,t:a})=>({v:t,t:a+e}))]);const n=t(M.send)*t(R.send);Math.max(...r.map(e=>{var t;return(null===(t=e[e.length-1])||void 0===t?void 0:t.t)||0}))>n&&(r=r.map(()=>[]))}const c=[...r,t(G)?j(r[0]):[],t(H)?j(r[1]):[]];e(U,c),t(T.send)===L.SINGLE&&e(B,!1)}}});var Z=a(17);const ee=20,te=50,ae=30,ne=50,re=Object(o.d)({key:"xDomain",get:({get:e})=>[0,e(M.send)*e(R.send)]}),ce=_,le=y(Object(o.c)({key:"plot-width",default:0})),ie=y(Object(o.c)({key:"plot-height",default:0})),oe=Object(o.d)({key:"xScale",get:({get:e})=>{const t=e(re),a=e(le);return Z.d().domain(t).range([ne,a-te])}}),se=Object(o.d)({key:"yScale",get:({get:e})=>{const t=e(ce),a=e(ie);return Z.d().domain(t).rangeRound([a-ae,ee])}}),ue=Object(o.d)({key:"line",get:({get:e})=>{const t=e(oe),a=e(se);return Z.c().x(({t:e})=>t(e)).y(({v:e})=>a(e))}}),de=Object(o.d)({key:"xy-line",get:({get:e})=>{const t=e(se),a=e(oe),[,n]=e(re),[,r]=e(ce);return Z.c().x(e=>a(e[1]/r*n)).y(e=>t(-e[0]))}}),me=(Object(o.d)({key:"plot-data",get:({get:e})=>{const t=e(U),a=e(ue);return t.map(e=>a(e)||void 0)}}),Object(n.forwardRef)((e,t)=>{const[a,c]=Object(n.useState)(!1),l=Object(o.f)(se),i=Object(o.f)(le),[s,u]=Object(o.e)(k.send);Object(n.useImperativeHandle)(t,()=>({onMouseUp(){c(!1)},onMouseMove(e){a&&u(l.invert(e.nativeEvent.offsetY))}}));const d=l(s);return r.a.createElement(r.a.Fragment,null,r.a.createElement("line",{className:"triggerVoltage",x1:ne,x2:i-te,y1:d,y2:d}),r.a.createElement("line",{className:"triggerVoltageHandle",onMouseDown:e=>{e.preventDefault(),e.stopPropagation(),c(!0)},x1:ne,x2:i-te,y1:d,y2:d}),r.a.createElement("text",{fill:"currentColor",y:d,x:i-te,dy:".32em",dx:"10"},s.toFixed(2),"v"))}));me.displayName="TriggerVoltageHandle";var fe=me;const pe=Object(n.forwardRef)((e,t)=>{const[a,c]=Object(n.useState)(!1),l=Object(o.f)(oe),i=Object(o.f)(ie),[s,u]=Object(o.e)(S.send),d=Object(o.f)(re);Object(n.useImperativeHandle)(t,()=>({onMouseUp(){c(!1)},onMouseMove(e){a&&u(l.invert(e.nativeEvent.offsetX)/d[1])}}));const m=l(s*d[1]);return r.a.createElement(r.a.Fragment,null,r.a.createElement("line",{className:"triggerPos",x1:m,x2:m,y1:i-ae,y2:ee}),r.a.createElement("line",{className:"triggerPosHandle",onMouseDown:e=>{e.preventDefault(),e.stopPropagation(),c(!0)},x1:m,x2:m,y1:i-ae,y2:ee}),r.a.createElement("text",{fill:"currentColor",x:m,dx:"-1em",dy:"1em"},Math.round(100*s),"%"))});pe.displayName="TriggerPosHandle";var ve=pe;const ge=(e,t=0)=>{const a=Math.pow(10,t);return(Math.round(e*a)/a).toFixed(t)};function be(e){if(e=Number(e),Number.isNaN(e))return"--";const t=e/60,a=e/60/60,n=1e3*e,r=1e3*n;return r<1e3?ge(r,0)+"\u03bcs":n<10?ge(n,2)+"ms":n<1e3?ge(n)+"ms":e<10?ge(e,1)+"s":a>1?ge(a,0)+"h"+ge(t%60,1)+"m":t>5?ge(t,0)+"m"+ge(e%60,1)+"s":ge(e,0)+"s"}function he(e){if(e<0)return"-"+he(-e);const t=1e3*e,a=1e3*t;return a<10?ge(a,2)+"\xb5v":a<50?ge(a,1)+"\xb5v":a<1e3?ge(a,0)+"\xb5v":t<10?ge(t,2)+"mv":t<50?ge(t,1)+"mv":t<1e3?ge(t,0)+"mv":ge(e,2)+"v"}function ye(){const e=Object(n.useRef)(null),t=Object(o.f)(ie),a=Object(o.f)(oe),c=e.current;return Object(n.useLayoutEffect)(()=>{if(!c)return;const e=Z.f(a.domain()[0],a.domain()[1],10);Z.e(c).call(n=>n.attr("transform",`translate(0,${t-ae})`).call(Z.a(a).tickValues(e).tickPadding(10).tickSize(-t+ee+ae).tickFormat(be).tickSizeOuter(0)).call(e=>e.select(".domain").remove()))},[c,a,t]),r.a.createElement("g",{className:"x axis",ref:e})}function Ee(){const e=Object(n.useRef)(null),t=Object(o.f)(le),a=Object(o.f)(se),c=e.current;return Object(n.useLayoutEffect)(()=>{if(!c)return;const e=Z.f(a.domain()[0],a.domain()[1],10);Z.e(c).call(n=>n.attr("transform",`translate(${ne},0)`).call(Z.b(a).tickValues(e).tickPadding(10).tickSize(-t+te+ne-1).tickFormat(e=>e+"v"))).call(e=>e.select(".domain").attr("d",(e,t,a)=>Z.e(a[0]).attr("d")+"z"))},[c,a,t]),r.a.createElement("g",{className:"y axis",ref:e})}var we=a(204);const Oe=Object(n.forwardRef)((e,t)=>{const[a,c]=Object(n.useState)(!1),l=Object(o.f)(oe),i=Object(o.f)(se),[s,u]=Object(n.useState)({x:-1,y:-1}),[d,m]=Object(n.useState)({x:-1,y:-1});return Object(n.useImperativeHandle)(t,()=>({onMouseDown(e){u({x:l.invert(e.nativeEvent.offsetX),y:i.invert(e.nativeEvent.offsetY)}),m({x:l.invert(e.nativeEvent.offsetX),y:i.invert(e.nativeEvent.offsetY)}),c(!0)},onMouseUp(e){a&&(m({x:l.invert(e.nativeEvent.offsetX),y:i.invert(e.nativeEvent.offsetY)}),c(!1))},onMouseMove(e){a&&m({x:l.invert(e.nativeEvent.offsetX),y:i.invert(e.nativeEvent.offsetY)})}})),Object(we.isEqual)(s,d)?r.a.createElement(r.a.Fragment,null):r.a.createElement("g",{className:"Measure"},r.a.createElement("line",{className:"measureCap",x1:l(s.x)-5,x2:l(s.x)+5,y1:i(s.y)-5,y2:i(s.y)+5}),r.a.createElement("line",{className:"measureCap",x1:l(s.x)-5,x2:l(s.x)+5,y1:i(s.y)+5,y2:i(s.y)-5}),r.a.createElement("line",{className:"measureX",x1:l(s.x),x2:l(d.x),y1:i(s.y),y2:i(s.y)}),r.a.createElement("text",{fill:"currentColor",x:l((s.x+d.x)/2),y:i(s.y),dx:"-1em",dy:"1.5em"},be(d.x-s.x)),r.a.createElement("line",{className:"measureCap",x1:l(d.x)-5,x2:l(d.x)+5,y1:i(d.y)-5,y2:i(d.y)+5}),r.a.createElement("line",{className:"measureCap",x1:l(d.x)-5,x2:l(d.x)+5,y1:i(d.y)+5,y2:i(d.y)-5}),r.a.createElement("line",{className:"measureY",x1:l(d.x),x2:l(d.x),y1:i(s.y),y2:i(d.y)}),r.a.createElement("text",{fill:"currentColor",x:l(d.x),y:i((s.y+d.y)/2),dx:"1em",dy:"0"},he(d.y-s.y)))});Oe.displayName="Measure";var je=Oe;function xe(){const e=Object(o.f)(V),t=Object(o.f)(z.send),a=Object(o.f)(de),n=Object(o.f)(U),c=n[0].map((e,t)=>{var a;return[-(null===(a=n[1][t])||void 0===a?void 0:a.v)||0,e.v]});return e&&t[0]&&t[1]?r.a.createElement(r.a.Fragment,null,r.a.createElement("path",{className:"plot-area-xy",d:a(c)||void 0})):r.a.createElement(r.a.Fragment,null)}function ke(){const e=Object(o.f)(ue),t=Object(o.f)(U).map(t=>e(t)||void 0),a=t.slice(0,2),n=t.slice(2,6),c=t.slice(6,8);return r.a.createElement(r.a.Fragment,null,a.map((e,t)=>r.a.createElement("path",{key:t,className:"plot-area-a"+t,d:e})),n.map((e,t)=>r.a.createElement("path",{key:t,className:"plot-area-d"+t,d:e})),c.map((e,t)=>r.a.createElement("path",{key:t,className:"plot-area-fft"+t,d:e})))}function Se(){const e=Object(n.useRef)(null),t=Object(n.useRef)(null),a=Object(n.useRef)(null),c=Object(n.useRef)(null),l=Object(n.useRef)(null),[s,u]=Object(i.a)(l),d=Object(o.g)(ie),m=Object(o.g)(le);return Object(n.useEffect)(()=>{d(u),m(s)},[u,d,m,s]),r.a.createElement("div",{className:"plotContainer",ref:l},r.a.createElement("svg",{className:"plot",ref:e,onMouseMove:e=>{var n,r,l;null===(n=t.current)||void 0===n||n.onMouseMove(e),null===(r=a.current)||void 0===r||r.onMouseMove(e),null===(l=c.current)||void 0===l||l.onMouseMove(e),e.preventDefault()},onMouseLeave:e=>{var n,r,l;null===(n=t.current)||void 0===n||n.onMouseUp(e),null===(r=a.current)||void 0===r||r.onMouseUp(e),null===(l=c.current)||void 0===l||l.onMouseUp(e),e.preventDefault()},onMouseUp:e=>{var n,r,l;null===(n=t.current)||void 0===n||n.onMouseUp(e),null===(r=a.current)||void 0===r||r.onMouseUp(e),null===(l=c.current)||void 0===l||l.onMouseUp(e),e.preventDefault()},onMouseDown:e=>{var t;null===(t=c.current)||void 0===t||t.onMouseDown(e),e.preventDefault()}},r.a.createElement(ye,null),r.a.createElement(Ee,null),r.a.createElement(ke,null),r.a.createElement(xe,null),r.a.createElement(je,{ref:c}),r.a.createElement(fe,{ref:a}),r.a.createElement(ve,{ref:t})))}var Me=a(468),Ce=a(469),Ne=a(470),De=a(59),Ae=a(471),ze=a(462),Fe=a(472);const Ie={marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"};function Pe(){const e=Object(o.f)(B);x.requestData=Object(o.g)(C.send);const[t,a]=Object(o.e)(T.send),[n,c]=Object(o.e)(A.send),l=Object(o.f)(X),[i,s]=Object(o.e)(D.send),u=Object(o.f)(M.send)<.0046875;return r.a.createElement(Me.a,{header:"Trigger",shaded:!0,collapsible:!0,defaultExpanded:!0},r.a.createElement(Ce.a,{style:Ie},r.a.createElement(Ne.a,null,["A0","AS","A2","A3","A4","A5"].map((e,t)=>r.a.createElement(De.a,{key:t,appearance:n===t?"primary":"default",disabled:["A2","A3"].includes(e),size:"sm",onClick:()=>c(t)},e)))),r.a.createElement(Ce.a,{style:Ie},r.a.createElement(Ne.a,null,Object.values(L).map(e=>r.a.createElement(De.a,{key:e,appearance:t===e?"primary":"default",color:e===L.SLOW&&u?"red":void 0,size:"sm",onClick:()=>a(e)},e)))),r.a.createElement(Ce.a,{style:Ie},r.a.createElement("div",null,"Direction:"),r.a.createElement(Ne.a,null,r.a.createElement(Ae.a,{size:"sm",appearance:i===N.FALLING?"primary":"default",icon:r.a.createElement(ze.a,{icon:"level-down"}),onClick:()=>s(N.FALLING)}),r.a.createElement(Ae.a,{size:"sm",appearance:i===N.RISING?"primary":"default",icon:r.a.createElement(ze.a,{icon:"level-up"}),onClick:()=>s(N.RISING)}))),r.a.createElement(Ce.a,{style:Ie},"State:\xa0",e?l?r.a.createElement(Fe.a,{color:"green"},"Triggered"):r.a.createElement(Fe.a,{color:"yellow"},"Searching"):r.a.createElement(Fe.a,{color:"red"},"Hold")))}var Re=a(467);const Le={marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"};function Te(){const[e,t]=Object(o.e)(W),[a,n]=Object(o.e)(V),[c,l]=Object(o.e)(G),[i,s]=Object(o.e)(H),[u,d]=Object(o.e)(z.send);return r.a.createElement(Me.a,{header:"Channels",shaded:!0,collapsible:!0,defaultExpanded:!0},r.a.createElement(Ce.a,{style:Le},r.a.createElement(Ne.a,null,["A0","AS","A2","A3","A4","A5"].map((e,t)=>r.a.createElement(De.a,{key:t,appearance:u[t]?"primary":"default",size:"sm",disabled:["A2","A3"].includes(e),onClick:()=>{const e=u.slice();e[t]=!e[t],d(e)}},e)))),r.a.createElement("div",{style:Le},"Oversample",r.a.createElement(Re.a,{style:{width:"50%"},value:e,onChange:t,max:30,min:0,step:.1})),r.a.createElement(Ne.a,null,r.a.createElement(De.a,{appearance:c?"primary":"default",disabled:!u[0],size:"sm",onClick:()=>{l(!c)}},"FFT A0"),r.a.createElement(De.a,{appearance:i?"primary":"default",disabled:!u[1],size:"sm",onClick:()=>{s(!i)}},"FFT AS"),r.a.createElement(De.a,{appearance:a?"primary":"default",disabled:!(u[1]&&u[0]),size:"sm",onClick:()=>{n(!a)}},"XY")))}var Ue=a(19),Be=a.n(Ue),We=a(466);function Ve(){const[e,t]=Object(n.useState)(!1),[a,r]=Object(n.useState)(-1);return[e,()=>{t(!0),clearTimeout(a);const e=window.setTimeout(()=>t(!1),200);r(e)}]}var Ge=function(){const[e,t]=Object(o.e)(P.send),[a,c]=Ve(),[l,i]=Ve();return Object(n.useEffect)(()=>(Be.a.bind("up",a=>{a.preventDefault(),c(),t(e-1)}),Be.a.bind("down",a=>{a.preventDefault(),i(),t(e+1)}),()=>{Be.a.unbind("up"),Be.a.unbind("down")}),[e,t,i,c]),r.a.createElement("div",{style:{width:" 100%",display:" flex",justifyContent:" space-between",marginBottom:5}},r.a.createElement(Ae.a,{active:l,size:"md",icon:r.a.createElement(ze.a,{icon:"down"}),onClick:()=>t(e+1)}),r.a.createElement(We.a,{searchable:!1,value:e,cleanable:!1,onChange:t,data:I.map((e,t)=>({label:he(e/10)+" / div",value:t})),style:{flex:1,marginLeft:5,marginRight:5}}),r.a.createElement(Ae.a,{active:a,size:"md",icon:r.a.createElement(ze.a,{icon:"up"}),onClick:()=>t(e-1)}))};const He=e=>e/1e6,Xe=e=>e/1e3,Ye=(e,t,a)=>{let n=e.map(({value:e})=>e).indexOf(t)+a;return n=F(n,0,e.length-1),e[n].value};function $e(){const[e,t]=Object(o.e)(M.send),a=Object(o.f)(R.send),[c,l]=Ve(),[i,s]=Ve(),u=[He(100),He(140.8),He(200),He(500),He(1e3),Xe(2),Xe(5),Xe(10),Xe(20),Xe(50),.1,.2,.5,1,2,5,10,20,50,100,1e3].map(e=>{const t=10*e/a;return{label:be(e)+" / div",value:t}});return Object(n.useEffect)(()=>(Be.a.bind("right",a=>{a.preventDefault(),s(),t(Ye(u,e,1))}),Be.a.bind("left",a=>{a.preventDefault(),l(),t(Ye(u,e,-1))}),()=>{Be.a.unbind("right"),Be.a.unbind("left")}),[t,e,u,s,l]),x.setSecPerSample=t,r.a.createElement("div",{style:{width:" 100%",display:" flex",justifyContent:" space-between",marginBottom:5}},r.a.createElement(Ae.a,{active:c,size:"md",icon:r.a.createElement(ze.a,{icon:"left"}),onClick:()=>t(Ye(u,e,-1))}),r.a.createElement(We.a,{searchable:!0,value:e,cleanable:!1,onChange:e=>{t(e)},data:u,style:{flex:1,marginLeft:5,marginRight:5}}),r.a.createElement(Ae.a,{active:i,size:"md",icon:r.a.createElement(ze.a,{icon:"right"}),onClick:()=>t(Ye(u,e,1))}))}function qe(){const[e,t]=Object(o.e)(B),[a,c]=Ve();return Object(n.useEffect)(()=>(Be.a.bind("space",e=>{e.preventDefault(),c(),t(e=>!e)}),()=>{Be.a.unbind("space")}),[t,c]),r.a.createElement(Me.a,{header:"Scales",shaded:!0,collapsible:!0,defaultExpanded:!0},r.a.createElement(De.a,{active:a,style:{color:"white",backgroundColor:e?"green":"red",width:"100%",marginBottom:"10px"},size:"sm",onClick:()=>{t(!e)}},(e?"Run":"Hold")+" [space]"),r.a.createElement($e,null),r.a.createElement(Ge,null))}var _e=a(222);const Je={baudRate:115200,bufferSize:2e4},Ke={marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"};var Qe=function(){const[e,t]=Object(n.useState)("Disconnected"),a=Object(o.g)(Q);return Object(n.useEffect)(()=>h.onData(e=>{a(e)}),[a]),Object(n.useEffect)(()=>{t("Connecting..."),h.connectWithPaired(Je).then(()=>t("Connected")).catch(()=>t("Disconnected"))},[]),r.a.createElement(Me.a,{shaded:!0,header:"Serial"},r.a.createElement(Ne.a,{style:Ke},r.a.createElement(Ae.a,{style:{flex:1},appearance:"Connected"===e?"primary":void 0,size:"md",onClick:async()=>{h.connect(Je).then(()=>t("Connected")).catch(()=>t("Error"))},icon:r.a.createElement(ze.a,{icon:"arrow-right",style:{width:" 100%"}}),placement:"right"}),r.a.createElement(Ae.a,{style:{flex:1},size:"md",appearance:"Connected"!==e?"primary":void 0,onClick:async()=>{h.close().then(()=>t("Disconnected")).catch(()=>t("Error"))},icon:r.a.createElement(ze.a,{icon:"stop",style:{width:" 100%"}}),placement:"right"}),r.a.createElement(Ae.a,{style:{flex:1},size:"md",onClick:async()=>{t("Connecting..."),await h.connectWithPaired(Je).catch(()=>h.connect(Je)).then(()=>t("Connected")).catch(()=>t("Error"))},icon:r.a.createElement(ze.a,{icon:"recycle",style:{width:" 100%"}}),placement:"right"})),r.a.createElement(Ce.a,{style:Ke},"State:\xa0",(()=>{const t={Connected:"green","Connecting...":"yellow",Error:"red",Disconnected:void 0}[e];return r.a.createElement(Fe.a,{color:t},e)})()),"Disconnected"===e&&r.a.createElement(_e.a,null))};function Ze(){const e=Object(o.f)(Y);return r.a.createElement(Fe.a,null,"Mem: ",e,"bytes")}function et(){const e=Object(o.f)($);return r.a.createElement(Fe.a,null,"Freq: ",function(e){if(e>0){const t=e/1e3;return e<1e3?ge(e)+"Hz":t<10?ge(t,2)+"KHz":ge(t)+"KHz"}return"--"}(e))}function tt(){const e=Object(o.f)($);return r.a.createElement(Fe.a,null,"Wavelength: ",be(1/e))}const at={width:" 100%",display:" flex",justifyContent:" space-between"};function nt(){const e=Object(o.f)(q);return r.a.createElement(r.a.Fragment,null,r.a.createElement("div",{style:at},r.a.createElement(Fe.a,null,"Vmin: ",he(e.vmin)),r.a.createElement(Fe.a,null,"Vmax: ",he(e.vmax))),r.a.createElement("div",{style:at},r.a.createElement(Fe.a,null,"Vavr: ",he(e.vavr)),r.a.createElement(Fe.a,null,"Vp-p: ",he(e.vpp))))}function rt(){return r.a.createElement("div",null,r.a.createElement(Me.a,{header:"Voltages",shaded:!0,collapsible:!0,defaultExpanded:!0},r.a.createElement(nt,null),r.a.createElement("div",{style:at},r.a.createElement(Ze,null),r.a.createElement(et,null),r.a.createElement(tt,null))))}var ct=function(){return r.a.createElement(r.a.Fragment,null,r.a.createElement(Qe,null),r.a.createElement(qe,null),r.a.createElement(Te,null),r.a.createElement(Pe,null),r.a.createElement(rt,null))},lt=a(465),it=a(473),ot=a(474);function st(){return r.a.createElement(Me.a,{header:"About",shaded:!0,collapsible:!0,defaultExpanded:!0},r.a.createElement("p",null,"David Buezas 2020"),r.a.createElement("a",{href:"https://github.com/dbuezas/arduino-web-oscilloscope"},"https://github.com/dbuezas/arduino-web-oscilloscope"))}var ut=function(){return navigator.serial?r.a.createElement("div",{className:"App"},r.a.createElement(lt.a,null,r.a.createElement(it.a,null,r.a.createElement(Me.a,{shaded:!0},r.a.createElement(Se,null))),r.a.createElement(ot.a,{width:261},r.a.createElement(ct,null),r.a.createElement(st,null)))):r.a.createElement(r.a.Fragment,null,"Enable experimental web platform features to activate the Web Serial API",r.a.createElement("br",null),"paste this url in your browser and",r.a.createElement("br",null),r.a.createElement("img",{alt:"",src:"/arduino-web-oscilloscope/ExperimentalWebPlatformFeatures.png"}),"chrome://flags/#enable-experimental-web-platform-features")};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(o.b,null,r.a.createElement(ut,null))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(e=>{e.unregister()}).catch(e=>{console.error(e.message)})}},[[273,1,2]]]);
//# sourceMappingURL=main.46876e64.chunk.js.map