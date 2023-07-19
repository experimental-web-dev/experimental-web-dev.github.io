(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();const E=`@binding(0) @group(0) var<uniform> mvpMatrix : mat4x4<f32>;\r
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
`,G=`@binding(0) @group(0) var<uniform> abc : array<vec4<f32>, 5>;\r
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
}`,B=new Float32Array([1,-1,1,1,1,-1,-1,1,0,1,-1,-1,-1,0,0,1,-1,-1,1,0,1,-1,1,1,1,-1,-1,-1,0,0,1,1,1,1,1,1,-1,1,0,1,1,-1,-1,0,0,1,1,-1,1,0,1,1,1,1,1,1,-1,-1,0,0,-1,1,1,1,1,1,1,1,0,1,1,1,-1,0,0,-1,1,-1,1,0,-1,1,1,1,1,1,1,-1,0,0,-1,-1,1,1,1,-1,1,1,0,1,-1,1,-1,0,0,-1,-1,-1,1,0,-1,-1,1,1,1,-1,1,-1,0,0,1,1,1,1,1,-1,1,1,0,1,-1,-1,1,0,0,-1,-1,1,0,0,1,-1,1,1,0,1,1,1,1,1,1,-1,-1,1,1,-1,-1,-1,0,1,-1,1,-1,0,0,1,1,-1,1,0,1,-1,-1,1,1,-1,1,-1,0,0]),O=36;var A=1e-6,z=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var e=0,r=arguments.length;r--;)e+=arguments[r]*arguments[r];return Math.sqrt(e)});function U(){var e=new z(16);return z!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function C(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function b(e,r,a){var t=r[0],n=r[1],i=r[2],c=r[3],s=r[4],l=r[5],d=r[6],v=r[7],o=r[8],f=r[9],p=r[10],y=r[11],w=r[12],u=r[13],M=r[14],P=r[15],h=a[0],g=a[1],m=a[2],x=a[3];return e[0]=h*t+g*s+m*o+x*w,e[1]=h*n+g*l+m*f+x*u,e[2]=h*i+g*d+m*p+x*M,e[3]=h*c+g*v+m*y+x*P,h=a[4],g=a[5],m=a[6],x=a[7],e[4]=h*t+g*s+m*o+x*w,e[5]=h*n+g*l+m*f+x*u,e[6]=h*i+g*d+m*p+x*M,e[7]=h*c+g*v+m*y+x*P,h=a[8],g=a[9],m=a[10],x=a[11],e[8]=h*t+g*s+m*o+x*w,e[9]=h*n+g*l+m*f+x*u,e[10]=h*i+g*d+m*p+x*M,e[11]=h*c+g*v+m*y+x*P,h=a[12],g=a[13],m=a[14],x=a[15],e[12]=h*t+g*s+m*o+x*w,e[13]=h*n+g*l+m*f+x*u,e[14]=h*i+g*d+m*p+x*M,e[15]=h*c+g*v+m*y+x*P,e}function T(e,r,a){var t=a[0],n=a[1],i=a[2],c,s,l,d,v,o,f,p,y,w,u,M;return r===e?(e[12]=r[0]*t+r[4]*n+r[8]*i+r[12],e[13]=r[1]*t+r[5]*n+r[9]*i+r[13],e[14]=r[2]*t+r[6]*n+r[10]*i+r[14],e[15]=r[3]*t+r[7]*n+r[11]*i+r[15]):(c=r[0],s=r[1],l=r[2],d=r[3],v=r[4],o=r[5],f=r[6],p=r[7],y=r[8],w=r[9],u=r[10],M=r[11],e[0]=c,e[1]=s,e[2]=l,e[3]=d,e[4]=v,e[5]=o,e[6]=f,e[7]=p,e[8]=y,e[9]=w,e[10]=u,e[11]=M,e[12]=c*t+v*n+y*i+r[12],e[13]=s*t+o*n+w*i+r[13],e[14]=l*t+f*n+u*i+r[14],e[15]=d*t+p*n+M*i+r[15]),e}function R(e,r,a){var t=a[0],n=a[1],i=a[2];return e[0]=r[0]*t,e[1]=r[1]*t,e[2]=r[2]*t,e[3]=r[3]*t,e[4]=r[4]*n,e[5]=r[5]*n,e[6]=r[6]*n,e[7]=r[7]*n,e[8]=r[8]*i,e[9]=r[9]*i,e[10]=r[10]*i,e[11]=r[11]*i,e[12]=r[12],e[13]=r[13],e[14]=r[14],e[15]=r[15],e}function F(e,r,a){var t=Math.sin(a),n=Math.cos(a),i=r[4],c=r[5],s=r[6],l=r[7],d=r[8],v=r[9],o=r[10],f=r[11];return r!==e&&(e[0]=r[0],e[1]=r[1],e[2]=r[2],e[3]=r[3],e[12]=r[12],e[13]=r[13],e[14]=r[14],e[15]=r[15]),e[4]=i*n+d*t,e[5]=c*n+v*t,e[6]=s*n+o*t,e[7]=l*n+f*t,e[8]=d*n-i*t,e[9]=v*n-c*t,e[10]=o*n-s*t,e[11]=f*n-l*t,e}function N(e,r,a){var t=Math.sin(a),n=Math.cos(a),i=r[0],c=r[1],s=r[2],l=r[3],d=r[8],v=r[9],o=r[10],f=r[11];return r!==e&&(e[4]=r[4],e[5]=r[5],e[6]=r[6],e[7]=r[7],e[12]=r[12],e[13]=r[13],e[14]=r[14],e[15]=r[15]),e[0]=i*n-d*t,e[1]=c*n-v*t,e[2]=s*n-o*t,e[3]=l*n-f*t,e[8]=i*t+d*n,e[9]=c*t+v*n,e[10]=s*t+o*n,e[11]=l*t+f*n,e}function L(e,r,a){var t=Math.sin(a),n=Math.cos(a),i=r[0],c=r[1],s=r[2],l=r[3],d=r[4],v=r[5],o=r[6],f=r[7];return r!==e&&(e[8]=r[8],e[9]=r[9],e[10]=r[10],e[11]=r[11],e[12]=r[12],e[13]=r[13],e[14]=r[14],e[15]=r[15]),e[0]=i*n+d*t,e[1]=c*n+v*t,e[2]=s*n+o*t,e[3]=l*n+f*t,e[4]=d*n-i*t,e[5]=v*n-c*t,e[6]=o*n-s*t,e[7]=f*n-l*t,e}function S(e,r,a,t,n){var i=1/Math.tan(r/2),c;return e[0]=i/a,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=i,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,n!=null&&n!==1/0?(c=1/(t-n),e[10]=(n+t)*c,e[14]=2*n*t*c):(e[10]=-1,e[14]=-2*t),e}var q=S;function D(e,r,a,t){var n,i,c,s,l,d,v,o,f,p,y=r[0],w=r[1],u=r[2],M=t[0],P=t[1],h=t[2],g=a[0],m=a[1],x=a[2];return Math.abs(y-g)<A&&Math.abs(w-m)<A&&Math.abs(u-x)<A?C(e):(v=y-g,o=w-m,f=u-x,p=1/Math.hypot(v,o,f),v*=p,o*=p,f*=p,n=P*f-h*o,i=h*v-M*f,c=M*o-P*v,p=Math.hypot(n,i,c),p?(p=1/p,n*=p,i*=p,c*=p):(n=0,i=0,c=0),s=o*c-f*i,l=f*n-v*c,d=v*i-o*n,p=Math.hypot(s,l,d),p?(p=1/p,s*=p,l*=p,d*=p):(s=0,l=0,d=0),e[0]=n,e[1]=s,e[2]=v,e[3]=0,e[4]=i,e[5]=l,e[6]=o,e[7]=0,e[8]=c,e[9]=d,e[10]=f,e[11]=0,e[12]=-(n*y+i*w+c*u),e[13]=-(s*y+l*w+d*u),e[14]=-(v*y+o*w+f*u),e[15]=1,e)}function I(){var e=new z(3);return z!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function V(e,r,a){var t=new z(3);return t[0]=e,t[1]=r,t[2]=a,t}(function(){var e=I();return function(r,a,t,n,i,c){var s,l;for(a||(a=3),t||(t=0),n?l=Math.min(n*a+t,r.length):l=r.length,s=t;s<l;s+=a)e[0]=r[s],e[1]=r[s+1],e[2]=r[s+2],i(e,e,c),r[s]=e[0],r[s+1]=e[1],r[s+2]=e[2];return r}})();function W(e,r,a,t){const n=Y(r,a,t),i=X(e),c=U();return b(c,i,n),c}function Y(e={x:0,y:0,z:0},r={x:0,y:0,z:0},a={x:1,y:1,z:1}){const t=U();return T(t,t,V(e.x,e.y,e.z)),F(t,t,r.x),N(t,t,r.y),L(t,t,r.z),R(t,t,V(a.x,a.y,a.z)),t}const _=V(0,0,0),H=V(0,1,0);function X(e,r=60/180*Math.PI,a=.1,t=100,n={x:0,y:0,z:0}){const i=U(),c=V(n.x,n.y,n.z);T(i,i,c),D(i,c,_,H);const s=U();return q(s,r,e,a,t),b(s,s,i),s}async function j(e){if(!navigator.gpu)throw new Error("Not Support WebGPU");const r=await navigator.gpu.requestAdapter();if(!r)throw new Error("No Adapter Found");const a=await r.requestDevice(),t=e.getContext("webgpu"),n=navigator.gpu.getPreferredCanvasFormat(),i=window.devicePixelRatio||1;e.width=e.clientWidth*i,e.height=e.clientHeight*i;const c={width:e.width,height:e.height};return t.configure({device:a,format:n,alphaMode:"opaque"}),{device:a,context:t,format:n,size:c}}async function K(e,r,a){const t=await e.createRenderPipelineAsync({label:"Basic Pipline",layout:"auto",vertex:{module:e.createShaderModule({code:E}),entryPoint:"main",buffers:[{arrayStride:20,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x2"}]}]},fragment:{module:e.createShaderModule({code:G}),entryPoint:"main",targets:[{format:r}]},primitive:{topology:"triangle-list",cullMode:"back",frontFace:"ccw"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}}),n=e.createTexture({size:a,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),i=n.createView(),c=e.createBuffer({label:"GPUBuffer store vertex",size:B.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(c,0,B);const s=e.createBuffer({label:"GPUBuffer store 4x4 matrix",size:4*4*4+4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),l=e.createBindGroup({label:"Uniform Group with Matrix",layout:t.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:s}}]});return{pipeline:t,vertexBuffer:c,mvpBuffer:s,uniformGroup:l,depthTexture:n,depthView:i}}function Z(e,r,a){const t=e.createCommandEncoder(),n={colorAttachments:[{view:r.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:a.depthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},i=t.beginRenderPass(n);i.setPipeline(a.pipeline),i.setVertexBuffer(0,a.vertexBuffer),i.setBindGroup(0,a.uniformGroup),i.draw(O),i.end(),e.queue.submit([t.finish()])}async function J(){const e=document.querySelector("canvas");if(!e)throw new Error("No Canvas");const{device:r,context:a,format:t,size:n}=await j(e),i=await K(r,t,n);let c=n.width/n.height;const s={x:0,y:0,z:-5},l={x:1,y:1,z:1},d={x:0,y:0,z:0},v=Date.now();function o(){const f=(Date.now()-v)/1e3;d.x=Math.sin(f/2),d.y=Math.cos(f/2);const p=W(c,s,d,l),y=new Float32Array([f,f,f,f]);r.queue.writeBuffer(i.mvpBuffer,0,p.buffer),r.queue.writeBuffer(i.mvpBuffer,4*4*4,y),Z(r,a,i),requestAnimationFrame(o)}o(),window.addEventListener("resize",()=>{n.width=e.width=e.clientWidth*devicePixelRatio,n.height=e.height=e.clientHeight*devicePixelRatio,i.depthTexture.destroy(),i.depthTexture=r.createTexture({size:n,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),i.depthView=i.depthTexture.createView(),c=n.width/n.height})}J();
