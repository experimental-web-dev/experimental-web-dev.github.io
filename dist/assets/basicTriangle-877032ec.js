(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const a of t.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(e){if(e.ep)return;e.ep=!0;const t=n(e);fetch(e.href,t)}})();const c=`@vertex\r
fn main(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4<f32> {\r
    var pos = array<vec2<f32>, 4>(\r
	    vec2<f32>(0.0, 0.5),\r
	    vec2<f32>(-0.5, -0.5),\r
	    vec2<f32>(0.5, -0.5),\r
        vec2<f32>(0.0, -0.9)\r
    );\r
    return vec4<f32>(pos[VertexIndex], 0.0, 1.0);\r
}`,s=`@fragment\r
fn main() -> @location(0) vec4<f32> {\r
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);\r
}`;async function u(){if(!navigator.gpu)throw new Error("not support webgpu");const r=await navigator.gpu.requestAdapter({powerPreference:"high-performance"});if(!r)throw new Error("failed to obtain adapter");const o=await r.requestDevice({requiredFeatures:["texture-compression-bc"]});console.log(r,o),r.features.forEach(a=>{console.log(a)});const n=document.querySelector("canvas");if(!n)throw new Error("canvas not found");const i=n.getContext("webgpu");if(!i)throw new Error("failed to obtain canvas context");const e=window.devicePixelRatio||1;n.width=n.clientWidth*e,n.height=n.clientHeight*e;const t=navigator.gpu.getPreferredCanvasFormat();return i.configure({device:o,format:t,alphaMode:"opaque"}),console.log(t),{adapter:r,device:o,context:i,format:t}}async function f(r,o){const n=r.createShaderModule({code:c}),i=r.createShaderModule({code:s});return{pipeline:await r.createRenderPipelineAsync({layout:"auto",vertex:{module:n,entryPoint:"main"},fragment:{module:i,entryPoint:"main",targets:[{format:o}]},primitive:{topology:"triangle-strip"}})}}function l(r,o,n){const i=r.createCommandEncoder(),e=i.beginRenderPass({colorAttachments:[{view:n.getCurrentTexture().createView(),loadOp:"clear",clearValue:{r:0,g:0,b:0,a:1},storeOp:"store"}]});e.setPipeline(o),e.draw(4),e.end();const t=i.finish();r.queue.submit([t])}async function d(){const{device:r,format:o,context:n}=await u(),{pipeline:i}=await f(r,o);l(r,i,n)}d();
