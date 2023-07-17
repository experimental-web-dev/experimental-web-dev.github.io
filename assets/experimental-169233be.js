import"./main-3d0639df.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function o(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=o(n);fetch(n.href,r)}})();const F="modulepreload",N=function(t){return"/"+t},x={},W=function(e,o,i){if(!o||o.length===0)return e();const n=document.getElementsByTagName("link");return Promise.all(o.map(r=>{if(r=N(r),r in x)return;x[r]=!0;const s=r.endsWith(".css"),c=s?'[rel="stylesheet"]':"";if(!!i)for(let d=n.length-1;d>=0;d--){const f=n[d];if(f.href===r&&(!s||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${r}"]${c}`))return;const a=document.createElement("link");if(a.rel=s?"stylesheet":F,s||(a.as="script",a.crossOrigin=""),a.href=r,document.head.appendChild(a),s)return new Promise((d,f)=>{a.addEventListener("load",d),a.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${r}`)))})})).then(()=>e()).catch(r=>{const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=r,window.dispatchEvent(s),!s.defaultPrevented)throw r})},B=(()=>typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:Function("return this")())(),E=__DEFINES__;Object.keys(E).forEach(t=>{const e=t.split(".");let o=B;for(let i=0;i<e.length;i++){const n=e[i];i===e.length-1?o[n]=E[t]:o=o[n]||(o[n]={})}});const V=__BASE__||"/",z=`
<style>
:host {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  --monospace: 'SFMono-Regular', Consolas,
  'Liberation Mono', Menlo, Courier, monospace;
  --red: #ff5555;
  --yellow: #e2aa53;
  --purple: #cfa4ff;
  --cyan: #2dd9da;
  --dim: #c9c9c9;

  --window-background: #181818;
  --window-color: #d8d8d8;
}

.backdrop {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  margin: 0;
  background: rgba(0, 0, 0, 0.66);
}

.window {
  font-family: var(--monospace);
  line-height: 1.5;
  width: 800px;
  color: var(--window-color);
  margin: 30px auto;
  padding: 25px 40px;
  position: relative;
  background: var(--window-background);
  border-radius: 6px 6px 8px 8px;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  overflow: hidden;
  border-top: 8px solid var(--red);
  direction: ltr;
  text-align: left;
}

pre {
  font-family: var(--monospace);
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 1em;
  overflow-x: scroll;
  scrollbar-width: none;
}

pre::-webkit-scrollbar {
  display: none;
}

.message {
  line-height: 1.3;
  font-weight: 600;
  white-space: pre-wrap;
}

.message-body {
  color: var(--red);
}

.plugin {
  color: var(--purple);
}

.file {
  color: var(--cyan);
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.frame {
  color: var(--yellow);
}

.stack {
  font-size: 13px;
  color: var(--dim);
}

.tip {
  font-size: 13px;
  color: #999;
  border-top: 1px dotted #999;
  padding-top: 13px;
}

code {
  font-size: 13px;
  font-family: var(--monospace);
  color: var(--yellow);
}

.file-link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
<div class="backdrop" part="backdrop">
  <div class="window" part="window">
    <pre class="message" part="message"><span class="plugin" part="plugin"></span><span class="message-body" part="message-body"></span></pre>
    <pre class="file" part="file"></pre>
    <pre class="frame" part="frame"></pre>
    <pre class="stack" part="stack"></pre>
    <div class="tip" part="tip">
      Click outside or fix the code to dismiss.<br>
      You can also disable this overlay by setting
      <code part="config-option-name">server.hmr.overlay</code> to <code part="config-option-value">false</code> in <code part="config-file-name">vite.config.js.</code>
    </div>
  </div>
</div>
`,_=/(?:[a-zA-Z]:\\|\/).*?:\d+:\d+/g,m=/^(?:>?\s+\d+\s+\|.*|\s+\|\s*\^.*)\r?\n/gm,{HTMLElement:j=class{}}=globalThis;class U extends j{constructor(e,o=!0){var i;super(),this.root=this.attachShadow({mode:"open"}),this.root.innerHTML=z,m.lastIndex=0;const n=e.frame&&m.test(e.frame),r=n?e.message.replace(m,""):e.message;e.plugin&&this.text(".plugin",`[plugin:${e.plugin}] `),this.text(".message-body",r.trim());const[s]=(((i=e.loc)===null||i===void 0?void 0:i.file)||e.id||"unknown file").split("?");e.loc?this.text(".file",`${s}:${e.loc.line}:${e.loc.column}`,o):e.id&&this.text(".file",s),n&&this.text(".frame",e.frame.trim()),this.text(".stack",e.stack,o),this.root.querySelector(".window").addEventListener("click",c=>{c.stopPropagation()}),this.addEventListener("click",()=>{this.close()}),this.closeOnEsc=c=>{(c.key==="Escape"||c.code==="Escape")&&this.close()},document.addEventListener("keydown",this.closeOnEsc)}text(e,o,i=!1){const n=this.root.querySelector(e);if(!i)n.textContent=o;else{let r=0,s;for(_.lastIndex=0;s=_.exec(o);){const{0:c,index:l}=s;if(l!=null){const a=o.slice(r,l);n.appendChild(document.createTextNode(a));const d=document.createElement("a");d.textContent=c,d.className="file-link",d.onclick=()=>{fetch(`${V}__open-in-editor?file=`+encodeURIComponent(c))},n.appendChild(d),r+=a.length+c.length}}}}close(){var e;(e=this.parentNode)===null||e===void 0||e.removeChild(this),document.removeEventListener("keydown",this.closeOnEsc)}}const h="vite-error-overlay",{customElements:v}=globalThis;v&&!v.get(h)&&v.define(h,U);console.debug("[vite] connecting...");const b=new URL(import.meta.url),D=__SERVER_HOST__,k=__HMR_PROTOCOL__||(b.protocol==="https:"?"wss":"ws"),A=__HMR_PORT__,S=`${__HMR_HOSTNAME__||b.hostname}:${A||b.port}${__HMR_BASE__}`,$=__HMR_DIRECT_TARGET__,y=__BASE__||"/",L=[];let p;try{let t;A||(t=()=>{p=R(k,$,()=>{const e=new URL(import.meta.url),o=e.host+e.pathname.replace(/@vite\/client$/,"");console.error(`[vite] failed to connect to websocket.
your current setup:
  (browser) ${o} <--[HTTP]--> ${D} (server)
  (browser) ${S} <--[WebSocket (failing)]--> ${$} (server)
Check out your Vite / network configuration and https://vitejs.dev/config/server-options.html#server-hmr .`)}),p.addEventListener("open",()=>{console.info("[vite] Direct websocket connection fallback. Check out https://vitejs.dev/config/server-options.html#server-hmr to remove the previous connection error.")},{once:!0})}),p=R(k,S,t)}catch(t){console.error(`[vite] failed to connect to websocket (${t}). `)}function R(t,e,o){const i=new WebSocket(`${t}://${e}`,"vite-hmr");let n=!1;return i.addEventListener("open",()=>{n=!0,u("vite:ws:connect",{webSocket:i})},{once:!0}),i.addEventListener("message",async({data:r})=>{J(JSON.parse(r))}),i.addEventListener("close",async({wasClean:r})=>{if(!r){if(!n&&o){o();return}u("vite:ws:disconnect",{webSocket:i}),console.log("[vite] server connection lost. polling for restart..."),await X(t,e),location.reload()}}),i}function G(t,e){t.message.match("fetch")||console.error(t),console.error(`[hmr] Failed to reload ${e}. This could be due to syntax errors or importing non-existent modules. (see errors above)`)}function P(t){const e=new URL(t,location.toString());return e.searchParams.delete("direct"),e.pathname+e.search}let M=!0;const O=new WeakSet,Y=t=>{let e;return()=>{e&&(clearTimeout(e),e=null),e=setTimeout(()=>{location.reload()},t)}},T=Y(50);async function J(t){switch(t.type){case"connected":console.debug("[vite] connected."),ne(),setInterval(()=>{p.readyState===p.OPEN&&p.send('{"type":"ping"}')},__HMR_TIMEOUT__);break;case"update":if(u("vite:beforeUpdate",t),M&&Q()){window.location.reload();return}else q(),M=!1;await Promise.all(t.updates.map(async e=>{if(e.type==="js-update")return Z(oe(e));const{path:o,timestamp:i}=e,n=P(o),r=Array.from(document.querySelectorAll("link")).find(c=>!O.has(c)&&P(c.href).includes(n));if(!r)return;const s=`${y}${n.slice(1)}${n.includes("?")?"&":"?"}t=${i}`;return new Promise(c=>{const l=r.cloneNode();l.href=new URL(s,r.href).href;const a=()=>{r.remove(),console.debug(`[vite] css hot updated: ${n}`),c()};l.addEventListener("load",a),l.addEventListener("error",a),O.add(r),r.after(l)})})),u("vite:afterUpdate",t);break;case"custom":{u(t.event,t.data);break}case"full-reload":if(u("vite:beforeFullReload",t),t.path&&t.path.endsWith(".html")){const e=decodeURI(location.pathname),o=y+t.path.slice(1);(e===o||t.path==="/index.html"||e.endsWith("/")&&e+"index.html"===o)&&T();return}else T();break;case"prune":u("vite:beforePrune",t),t.paths.forEach(e=>{const o=se.get(e);o&&o(I.get(e))});break;case"error":{u("vite:error",t);const e=t.err;H?K(e):console.error(`[vite] Internal Server Error
${e.message}
${e.stack}`);break}default:return t}}function u(t,e){const o=ce.get(t);o&&o.forEach(i=>i(e))}const H=__HMR_ENABLE_OVERLAY__;function K(t){H&&(q(),document.body.appendChild(new U(t)))}function q(){document.querySelectorAll(h).forEach(t=>t.close())}function Q(){return document.querySelectorAll(h).length}let g=!1,w=[];async function Z(t){if(w.push(t),!g){g=!0,await Promise.resolve(),g=!1;const e=[...w];w=[],(await Promise.all(e)).forEach(o=>o&&o())}}async function X(t,e,o=1e3){const i=t==="wss"?"https":"http",n=async()=>{try{return await fetch(`${i}://${e}`,{mode:"no-cors",headers:{Accept:"text/x-vite-ping"}}),!0}catch{}return!1};if(!await n())for(await C(o);;)if(document.visibilityState==="visible"){if(await n())break;await C(o)}else await ee()}function C(t){return new Promise(e=>setTimeout(e,t))}function ee(){return new Promise(t=>{const e=async()=>{document.visibilityState==="visible"&&(t(),document.removeEventListener("visibilitychange",e))};document.addEventListener("visibilitychange",e)})}const te=new Map;"document"in globalThis&&document.querySelectorAll("style[data-vite-dev-id]").forEach(t=>{te.set(t.getAttribute("data-vite-dev-id"),t)});async function oe({path:t,acceptedPath:e,timestamp:o,explicitImportRequired:i}){const n=re.get(t);if(!n)return;let r;const s=t===e,c=n.callbacks.filter(({deps:l})=>l.includes(e));if(s||c.length>0){const l=ie.get(e);l&&await l(I.get(e));const[a,d]=e.split("?");try{r=await W(()=>import(y+a.slice(1)+`?${i?"import&":""}t=${o}${d?`&${d}`:""}`),[])}catch(f){G(f,e)}}return()=>{for(const{deps:a,fn:d}of c)d(a.map(f=>f===e?r:void 0));const l=s?t:`${e} via ${t}`;console.debug(`[vite] hot updated: ${l}`)}}function ne(){p.readyState===1&&(L.forEach(t=>p.send(t)),L.length=0)}const re=new Map,ie=new Map,se=new Map,I=new Map,ce=new Map,ae=`@vertex\r
fn main(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4<f32> {\r
    var pos = array<vec2<f32>, 4>(\r
	    vec2<f32>(0.0, 0.5),\r
	    vec2<f32>(-0.5, -0.5),\r
	    vec2<f32>(0.5, -0.5),\r
        vec2<f32>(0.0, -0.9)\r
    );\r
    return vec4<f32>(pos[VertexIndex], 0.0, 1.0);\r
}`,le=`@fragment\r
fn main() -> @location(0) vec4<f32> {\r
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);\r
}`;async function de(){if(!navigator.gpu)throw new Error("not support webgpu");const t=await navigator.gpu.requestAdapter({powerPreference:"high-performance"});if(!t)throw new Error("failed to obtain adapter");const e=await t.requestDevice({requiredFeatures:["texture-compression-bc"]});console.log(t,e),t.features.forEach(s=>{console.log(s)});const o=document.querySelector("canvas");if(!o)throw new Error("canvas not found");const i=o.getContext("webgpu");if(!i)throw new Error("failed to obtain canvas context");const n=window.devicePixelRatio||1;o.width=o.clientWidth*n,o.height=o.clientHeight*n;const r=navigator.gpu.getPreferredCanvasFormat();return i.configure({device:e,format:r,alphaMode:"opaque"}),console.log(r),{adapter:t,device:e,context:i,format:r}}async function fe(t,e){const o=t.createShaderModule({code:ae}),i=t.createShaderModule({code:le});return{pipeline:await t.createRenderPipelineAsync({layout:"auto",vertex:{module:o,entryPoint:"main"},fragment:{module:i,entryPoint:"main",targets:[{format:e}]},primitive:{topology:"triangle-strip"}})}}function ue(t,e,o){const i=t.createCommandEncoder(),n=i.beginRenderPass({colorAttachments:[{view:o.getCurrentTexture().createView(),loadOp:"clear",clearValue:{r:0,g:0,b:0,a:1},storeOp:"store"}]});n.setPipeline(e),n.draw(4),n.end();const r=i.finish();t.queue.submit([r])}async function pe(){const{device:t,format:e,context:o}=await de(),{pipeline:i}=await fe(t,e);ue(t,i,o)}pe();
