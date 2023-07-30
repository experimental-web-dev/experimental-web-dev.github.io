import{g as v}from"./math-56068315.js";const m=`@binding(0) @group(0) var<uniform> mvpMatrix : mat4x4<f32>;\r
\r
struct VertexOutput {\r
    @builtin(position) Position : vec4<f32>,\r
    @location(0) fragUV : vec2<f32>,\r
    @location(1) fragPosition: vec4<f32>\r
};\r
\r
@vertex\r
fn main(\r
    @location(0) position : vec4<f32>,\r
    @location(1) uv : vec2<f32>\r
) -> VertexOutput {\r
    var output : VertexOutput;\r
    output.Position = mvpMatrix * position;\r
    output.fragUV = uv;\r
    output.fragPosition = 0.5 * (position + vec4<f32>(1.0, 1.0, 1.0, 1.0));\r
    return output;\r
}\r
`,w=`@binding(0) @group(0) var<uniform> abc : array<vec4<f32>, 5>;\r
\r
fn palette(t:f32) -> vec3<f32>{\r
    let a = vec3<f32>(0.5, 0.5, 0.5);\r
    let b = vec3<f32>(0.5, 0.5, 0.5);\r
    let c = vec3<f32>(1.0, 1.0, 1.0);\r
    let d = vec3<f32>(0.00, 0.10, 0.20);\r
    \r
    return a + b * cos( 6.28318*(c*t+d) );\r
}\r
\r
@fragment\r
fn main(\r
    @location(0) fragUV: vec2<f32>,\r
    @location(1) fragPosition: vec4<f32>\r
) -> @location(0) vec4<f32> {\r
    var uv = fragUV * 2.0 - 1.0;\r
    let uv0 = uv;\r
    let time = 2.0 * abc[0][2];\r
    var finalColor = vec3<f32>(0.0);\r
\r
    for (var i = 0; i < 2; i++){\r
        uv = 2.0 * fract(uv * 1.666) - 1.0;\r
\r
        var distance = length(uv) * exp(-length(uv0));\r
        let color = palette(length(uv0) + f32(i) * 0.4 + time * .4);\r
\r
        distance = sin(distance * 8.0 - time);\r
        distance = abs(distance);\r
        distance = 0.16 / distance;\r
        distance = pow(distance, 1.2);\r
\r
        finalColor += color * distance;\r
    }\r
\r
    return vec4(finalColor, 1.0);\r
}`,d=new Float32Array([1,-1,1,1,1,-1,-1,1,0,1,-1,-1,-1,0,0,1,-1,-1,1,0,1,-1,1,1,1,-1,-1,-1,0,0,1,1,1,1,1,1,-1,1,0,1,1,-1,-1,0,0,1,1,-1,1,0,1,1,1,1,1,1,-1,-1,0,0,-1,1,1,1,1,1,1,1,0,1,1,1,-1,0,0,-1,1,-1,1,0,-1,1,1,1,1,1,1,-1,0,0,-1,-1,1,1,1,-1,1,1,0,1,-1,1,-1,0,0,-1,-1,-1,1,0,-1,-1,1,1,1,-1,1,-1,0,0,1,1,1,1,1,-1,1,1,0,1,-1,-1,1,0,0,-1,-1,1,0,0,1,-1,1,1,0,1,1,1,1,1,1,-1,-1,1,1,-1,-1,-1,0,1,-1,1,-1,0,0,1,1,-1,1,0,1,-1,-1,1,1,-1,1,-1,0,0]),x=36;async function P(e){if(!navigator.gpu)throw new Error("Not Support WebGPU");const n=await navigator.gpu.requestAdapter();if(!n)throw new Error("No Adapter Found");const o=await n.requestDevice(),i=e.getContext("webgpu"),r=navigator.gpu.getPreferredCanvasFormat(),t=window.devicePixelRatio||1;e.width=e.clientWidth*t,e.height=e.clientHeight*t;const a={width:e.width,height:e.height};return i.configure({device:o,format:r,alphaMode:"opaque"}),{device:o,context:i,format:r,size:a}}async function b(e,n,o){const i=await e.createRenderPipelineAsync({label:"Basic Pipline",layout:"auto",vertex:{module:e.createShaderModule({code:m}),entryPoint:"main",buffers:[{arrayStride:20,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x2"}]}]},fragment:{module:e.createShaderModule({code:w}),entryPoint:"main",targets:[{format:n}]},primitive:{topology:"triangle-list",cullMode:"back",frontFace:"ccw"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}}),r=e.createTexture({size:o,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),t=r.createView(),a=e.createBuffer({label:"GPUBuffer store vertex",size:d.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(a,0,d);const u=e.createBuffer({label:"GPUBuffer store 4x4 matrix",size:4*4*4+4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),s=e.createBindGroup({label:"Uniform Group with Matrix",layout:i.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}]});return{pipeline:i,vertexBuffer:a,mvpBuffer:u,uniformGroup:s,depthTexture:r,depthView:t}}function U(e,n,o){const i=e.createCommandEncoder(),r={colorAttachments:[{view:n.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:o.depthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},t=i.beginRenderPass(r);t.setPipeline(o.pipeline),t.setVertexBuffer(0,o.vertexBuffer),t.setBindGroup(0,o.uniformGroup),t.draw(x),t.end(),e.queue.submit([i.finish()])}async function y(){const e=document.querySelector("canvas");if(!e)throw new Error("No Canvas");const{device:n,context:o,format:i,size:r}=await P(e),t=await b(n,i,r);let a=r.width/r.height;const u={x:0,y:0,z:-5},s={x:1,y:1,z:1},f={x:0,y:0,z:0},p=Date.now();function l(){const c=(Date.now()-p)/1e3;f.x=Math.sin(c/2),f.y=Math.cos(c/2);const h=v(a,u,f,s),g=new Float32Array([c,c,c,c]);n.queue.writeBuffer(t.mvpBuffer,0,h.buffer),n.queue.writeBuffer(t.mvpBuffer,4*4*4,g),U(n,o,t),requestAnimationFrame(l)}l(),window.addEventListener("resize",()=>{r.width=e.width=e.clientWidth*devicePixelRatio,r.height=e.height=e.clientHeight*devicePixelRatio,t.depthTexture.destroy(),t.depthTexture=n.createTexture({size:r,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),t.depthView=t.depthTexture.createView(),a=r.width/r.height})}y();
