/**
 * Minified by jsDelivr using Terser v3.14.1.
 * Original file: /npm/streamsaver@2.0.3/StreamSaver.js
 * 
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
((e,t)=>{"undefined"!=typeof module?module.exports=t():"function"==typeof define&&"object"==typeof define.amd?define(t):this.streamSaver=t()})(0,()=>{"use strict";let e=null,t=!1;const a=window.WebStreamsPolyfill||{},r=window.isSecureContext;let n=/constructor/i.test(window.HTMLElement)||!!window.safari;const o=r||"MozAppearance"in document.documentElement.style?"iframe":"navigate",s={createWriteStream:function(a,l,d){let m={size:null,pathname:null,writableStrategy:void 0,readableStrategy:void 0};Number.isFinite(l)?([d,l]=[l,d],console.warn("[StreamSaver] Depricated pass an object as 2nd argument when creating a write stream"),m.size=d,m.writableStrategy=l):l&&l.highWaterMark?(console.warn("[StreamSaver] Depricated pass an object as 2nd argument when creating a write stream"),m.size=d,m.writableStrategy=l):m=l||{};if(!n){e||(e=r?i(s.mitm):function(e){const t=document.createDocumentFragment(),a={frame:window.open(e,"popup","width=200,height=100"),loaded:!1,isIframe:!1,isPopup:!0,remove(){a.frame.close()},addEventListener(...e){t.addEventListener(...e)},dispatchEvent(...e){t.dispatchEvent(...e)},removeEventListener(...e){t.removeEventListener(...e)},postMessage(...e){a.frame.postMessage(...e)}},r=e=>{e.source===a.frame&&(a.loaded=!0,window.removeEventListener("message",r),a.dispatchEvent(new Event("load")))};return window.addEventListener("message",r),a}(s.mitm));var c=0,p=null,w=new MessageChannel;a=encodeURIComponent(a.replace(/\//g,":")).replace(/['()]/g,escape).replace(/\*/g,"%2A");const n={transferringReadable:t,pathname:m.pathname||Math.random().toString().slice(-6)+"/"+a,headers:{"Content-Type":"application/octet-stream; charset=utf-8","Content-Disposition":"attachment; filename*=UTF-8''"+a}};m.size&&(n.headers["Content-Length"]=m.size);const l=[n,"*",[w.port2]];if(t){const e="iframe"===o?void 0:{transform(e,t){c+=e.length,t.enqueue(e),p&&(location.href=p,p=null)},flush(){p&&(location.href=p)}};var u=new s.TransformStream(e,m.writableStrategy,m.readableStrategy);const t=u.readable;w.port1.postMessage({readableStream:t},[t])}w.port1.onmessage=(t=>{t.data.download&&("navigate"===o?(e.remove(),e=null,c?location.href=t.data.download:p=t.data.download):(e.isPopup&&(e.remove(),"iframe"===o&&i(s.mitm)),i(t.data.download)))}),e.loaded?e.postMessage(...l):e.addEventListener("load",()=>{e.postMessage(...l)},{once:!0})}let f=[];return!n&&u&&u.writable||new s.WritableStream({write(e){n?f.push(e):(w.port1.postMessage(e),c+=e.length,p&&(location.href=p,p=null))},close(){if(n){const e=new Blob(f,{type:"application/octet-stream; charset=utf-8"}),t=document.createElement("a");t.href=URL.createObjectURL(e),t.download=a,t.click()}else w.port1.postMessage("end")},abort(){f=[],w.port1.postMessage("abort"),w.port1.onmessage=null,w.port1.close(),w.port2.close(),w=null}},m.writableStrategy)},WritableStream:window.WritableStream||a.WritableStream,supported:!0,version:{full:"2.0.0",major:2,minor:0,dot:0},mitm:"https://jimmywarting.github.io/StreamSaver.js/mitm.html?version=2.0.0"};function i(e){if(!e)throw new Error("meh");const t=document.createElement("iframe");return t.hidden=!0,t.src=e,t.loaded=!1,t.name="iframe",t.isIframe=!0,t.postMessage=((...e)=>t.contentWindow.postMessage(...e)),t.addEventListener("load",()=>{t.loaded=!0},{once:!0}),document.body.appendChild(t),t}try{new Response(new ReadableStream),!r||"serviceWorker"in navigator||(n=!0)}catch(e){n=!0}return(e=>{try{e()}catch(e){}})(()=>{const{readable:e}=new TransformStream,a=new MessageChannel;a.port1.postMessage(e,[e]),a.port1.close(),a.port2.close(),t=!0,Object.defineProperty(s,"TransformStream",{configurable:!1,writable:!1,value:TransformStream})}),s});
//# sourceMappingURL=/sm/94a8e6efac25f1f814044c3ca658e28c0ad92fbb6fe3e4f189b13375bc630d7c.map