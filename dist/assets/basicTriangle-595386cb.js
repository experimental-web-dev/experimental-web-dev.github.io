import"./modulepreload-polyfill-3cfb730f.js";const c=`@vertex\r
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
}`;async function u(){if(!navigator.gpu)throw new Error("not support webgpu");const e=await navigator.gpu.requestAdapter({powerPreference:"high-performance"});if(!e)throw new Error("failed to obtain adapter");const r=await e.requestDevice({requiredFeatures:["texture-compression-bc"]});console.log(e,r),e.features.forEach(i=>{console.log(i)});const t=document.querySelector("canvas");if(!t)throw new Error("canvas not found");const n=t.getContext("webgpu");if(!n)throw new Error("failed to obtain canvas context");const o=window.devicePixelRatio||1;t.width=t.clientWidth*o,t.height=t.clientHeight*o;const a=navigator.gpu.getPreferredCanvasFormat();return n.configure({device:r,format:a,alphaMode:"opaque"}),console.log(a),{adapter:e,device:r,context:n,format:a}}async function d(e,r){const t=e.createShaderModule({code:c}),n=e.createShaderModule({code:s});return{pipeline:await e.createRenderPipelineAsync({layout:"auto",vertex:{module:t,entryPoint:"main"},fragment:{module:n,entryPoint:"main",targets:[{format:r}]},primitive:{topology:"triangle-strip"}})}}function f(e,r,t){const n=e.createCommandEncoder(),o=n.beginRenderPass({colorAttachments:[{view:t.getCurrentTexture().createView(),loadOp:"clear",clearValue:{r:0,g:0,b:0,a:1},storeOp:"store"}]});o.setPipeline(r),o.draw(4),o.end();const a=n.finish();e.queue.submit([a])}async function l(){const{device:e,format:r,context:t}=await u(),{pipeline:n}=await d(e,r);f(e,n,t)}l();
