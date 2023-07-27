import"./modulepreload-polyfill-3cfb730f.js";const b=`@binding(0) @group(0) var<uniform> mvpMatrix : mat4x4<f32>;\r
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
}`,T=new Float32Array([1,-1,1,1,1,-1,-1,1,0,1,-1,-1,-1,0,0,1,-1,-1,1,0,1,-1,1,1,1,-1,-1,-1,0,0,1,1,1,1,1,1,-1,1,0,1,1,-1,-1,0,0,1,1,-1,1,0,1,1,1,1,1,1,-1,-1,0,0,-1,1,1,1,1,1,1,1,0,1,1,1,-1,0,0,-1,1,-1,1,0,-1,1,1,1,1,1,1,-1,0,0,-1,-1,1,1,1,-1,1,1,0,1,-1,1,-1,0,0,-1,-1,-1,1,0,-1,-1,1,1,1,-1,1,-1,0,0,1,1,1,1,1,-1,1,1,0,1,-1,-1,1,0,0,-1,-1,1,0,0,1,-1,1,1,0,1,1,1,1,1,1,-1,-1,1,1,-1,-1,-1,0,1,-1,1,-1,0,0,1,1,-1,1,0,1,-1,-1,1,1,-1,1,-1,0,0]),C=36;var A=1e-6,V=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var e=0,r=arguments.length;r--;)e+=arguments[r]*arguments[r];return Math.sqrt(e)});function B(){var e=new V(16);return V!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function R(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function u(e,r,a){var n=r[0],t=r[1],i=r[2],c=r[3],s=r[4],v=r[5],d=r[6],p=r[7],l=r[8],f=r[9],h=r[10],y=r[11],w=r[12],M=r[13],P=r[14],z=r[15],o=a[0],x=a[1],g=a[2],m=a[3];return e[0]=o*n+x*s+g*l+m*w,e[1]=o*t+x*v+g*f+m*M,e[2]=o*i+x*d+g*h+m*P,e[3]=o*c+x*p+g*y+m*z,o=a[4],x=a[5],g=a[6],m=a[7],e[4]=o*n+x*s+g*l+m*w,e[5]=o*t+x*v+g*f+m*M,e[6]=o*i+x*d+g*h+m*P,e[7]=o*c+x*p+g*y+m*z,o=a[8],x=a[9],g=a[10],m=a[11],e[8]=o*n+x*s+g*l+m*w,e[9]=o*t+x*v+g*f+m*M,e[10]=o*i+x*d+g*h+m*P,e[11]=o*c+x*p+g*y+m*z,o=a[12],x=a[13],g=a[14],m=a[15],e[12]=o*n+x*s+g*l+m*w,e[13]=o*t+x*v+g*f+m*M,e[14]=o*i+x*d+g*h+m*P,e[15]=o*c+x*p+g*y+m*z,e}function E(e,r,a){var n=a[0],t=a[1],i=a[2],c,s,v,d,p,l,f,h,y,w,M,P;return r===e?(e[12]=r[0]*n+r[4]*t+r[8]*i+r[12],e[13]=r[1]*n+r[5]*t+r[9]*i+r[13],e[14]=r[2]*n+r[6]*t+r[10]*i+r[14],e[15]=r[3]*n+r[7]*t+r[11]*i+r[15]):(c=r[0],s=r[1],v=r[2],d=r[3],p=r[4],l=r[5],f=r[6],h=r[7],y=r[8],w=r[9],M=r[10],P=r[11],e[0]=c,e[1]=s,e[2]=v,e[3]=d,e[4]=p,e[5]=l,e[6]=f,e[7]=h,e[8]=y,e[9]=w,e[10]=M,e[11]=P,e[12]=c*n+p*t+y*i+r[12],e[13]=s*n+l*t+w*i+r[13],e[14]=v*n+f*t+M*i+r[14],e[15]=d*n+h*t+P*i+r[15]),e}function F(e,r,a){var n=a[0],t=a[1],i=a[2];return e[0]=r[0]*n,e[1]=r[1]*n,e[2]=r[2]*n,e[3]=r[3]*n,e[4]=r[4]*t,e[5]=r[5]*t,e[6]=r[6]*t,e[7]=r[7]*t,e[8]=r[8]*i,e[9]=r[9]*i,e[10]=r[10]*i,e[11]=r[11]*i,e[12]=r[12],e[13]=r[13],e[14]=r[14],e[15]=r[15],e}function S(e,r,a){var n=Math.sin(a),t=Math.cos(a),i=r[4],c=r[5],s=r[6],v=r[7],d=r[8],p=r[9],l=r[10],f=r[11];return r!==e&&(e[0]=r[0],e[1]=r[1],e[2]=r[2],e[3]=r[3],e[12]=r[12],e[13]=r[13],e[14]=r[14],e[15]=r[15]),e[4]=i*t+d*n,e[5]=c*t+p*n,e[6]=s*t+l*n,e[7]=v*t+f*n,e[8]=d*t-i*n,e[9]=p*t-c*n,e[10]=l*t-s*n,e[11]=f*t-v*n,e}function q(e,r,a){var n=Math.sin(a),t=Math.cos(a),i=r[0],c=r[1],s=r[2],v=r[3],d=r[8],p=r[9],l=r[10],f=r[11];return r!==e&&(e[4]=r[4],e[5]=r[5],e[6]=r[6],e[7]=r[7],e[12]=r[12],e[13]=r[13],e[14]=r[14],e[15]=r[15]),e[0]=i*t-d*n,e[1]=c*t-p*n,e[2]=s*t-l*n,e[3]=v*t-f*n,e[8]=i*n+d*t,e[9]=c*n+p*t,e[10]=s*n+l*t,e[11]=v*n+f*t,e}function N(e,r,a){var n=Math.sin(a),t=Math.cos(a),i=r[0],c=r[1],s=r[2],v=r[3],d=r[4],p=r[5],l=r[6],f=r[7];return r!==e&&(e[8]=r[8],e[9]=r[9],e[10]=r[10],e[11]=r[11],e[12]=r[12],e[13]=r[13],e[14]=r[14],e[15]=r[15]),e[0]=i*t+d*n,e[1]=c*t+p*n,e[2]=s*t+l*n,e[3]=v*t+f*n,e[4]=d*t-i*n,e[5]=p*t-c*n,e[6]=l*t-s*n,e[7]=f*t-v*n,e}function O(e,r,a,n,t){var i=1/Math.tan(r/2),c;return e[0]=i/a,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=i,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,t!=null&&t!==1/0?(c=1/(n-t),e[10]=(t+n)*c,e[14]=2*t*n*c):(e[10]=-1,e[14]=-2*n),e}var D=O;function L(e,r,a,n){var t,i,c,s,v,d,p,l,f,h,y=r[0],w=r[1],M=r[2],P=n[0],z=n[1],o=n[2],x=a[0],g=a[1],m=a[2];return Math.abs(y-x)<A&&Math.abs(w-g)<A&&Math.abs(M-m)<A?R(e):(p=y-x,l=w-g,f=M-m,h=1/Math.hypot(p,l,f),p*=h,l*=h,f*=h,t=z*f-o*l,i=o*p-P*f,c=P*l-z*p,h=Math.hypot(t,i,c),h?(h=1/h,t*=h,i*=h,c*=h):(t=0,i=0,c=0),s=l*c-f*i,v=f*t-p*c,d=p*i-l*t,h=Math.hypot(s,v,d),h?(h=1/h,s*=h,v*=h,d*=h):(s=0,v=0,d=0),e[0]=t,e[1]=s,e[2]=p,e[3]=0,e[4]=i,e[5]=v,e[6]=l,e[7]=0,e[8]=c,e[9]=d,e[10]=f,e[11]=0,e[12]=-(t*y+i*w+c*M),e[13]=-(s*y+v*w+d*M),e[14]=-(p*y+l*w+f*M),e[15]=1,e)}function W(){var e=new V(3);return V!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function U(e,r,a){var n=new V(3);return n[0]=e,n[1]=r,n[2]=a,n}(function(){var e=W();return function(r,a,n,t,i,c){var s,v;for(a||(a=3),n||(n=0),t?v=Math.min(t*a+n,r.length):v=r.length,s=n;s<v;s+=a)e[0]=r[s],e[1]=r[s+1],e[2]=r[s+2],i(e,e,c),r[s]=e[0],r[s+1]=e[1],r[s+2]=e[2];return r}})();function Y(e,r,a,n){const t=_(r,a,n),i=k(e),c=B();return u(c,i,t),c}function _(e={x:0,y:0,z:0},r={x:0,y:0,z:0},a={x:1,y:1,z:1}){const n=B();return E(n,n,U(e.x,e.y,e.z)),S(n,n,r.x),q(n,n,r.y),N(n,n,r.z),F(n,n,U(a.x,a.y,a.z)),n}const H=U(0,0,0),I=U(0,1,0);function k(e,r=60/180*Math.PI,a=.1,n=100,t={x:0,y:0,z:0}){const i=B(),c=U(t.x,t.y,t.z);E(i,i,c),L(i,c,H,I);const s=B();return D(s,r,e,a,n),u(s,s,i),s}async function X(e){if(!navigator.gpu)throw new Error("Not Support WebGPU");const r=await navigator.gpu.requestAdapter();if(!r)throw new Error("No Adapter Found");const a=await r.requestDevice(),n=e.getContext("webgpu"),t=navigator.gpu.getPreferredCanvasFormat(),i=window.devicePixelRatio||1;e.width=e.clientWidth*i,e.height=e.clientHeight*i;const c={width:e.width,height:e.height};return n.configure({device:a,format:t,alphaMode:"opaque"}),{device:a,context:n,format:t,size:c}}async function j(e,r,a){const n=await e.createRenderPipelineAsync({label:"Basic Pipline",layout:"auto",vertex:{module:e.createShaderModule({code:b}),entryPoint:"main",buffers:[{arrayStride:20,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x2"}]}]},fragment:{module:e.createShaderModule({code:G}),entryPoint:"main",targets:[{format:r}]},primitive:{topology:"triangle-list",cullMode:"back",frontFace:"ccw"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}}),t=e.createTexture({size:a,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),i=t.createView(),c=e.createBuffer({label:"GPUBuffer store vertex",size:T.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(c,0,T);const s=e.createBuffer({label:"GPUBuffer store 4x4 matrix",size:4*4*4+4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),v=e.createBindGroup({label:"Uniform Group with Matrix",layout:n.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:s}}]});return{pipeline:n,vertexBuffer:c,mvpBuffer:s,uniformGroup:v,depthTexture:t,depthView:i}}function Z(e,r,a){const n=e.createCommandEncoder(),t={colorAttachments:[{view:r.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:a.depthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},i=n.beginRenderPass(t);i.setPipeline(a.pipeline),i.setVertexBuffer(0,a.vertexBuffer),i.setBindGroup(0,a.uniformGroup),i.draw(C),i.end(),e.queue.submit([n.finish()])}async function J(){const e=document.querySelector("canvas");if(!e)throw new Error("No Canvas");const{device:r,context:a,format:n,size:t}=await X(e),i=await j(r,n,t);let c=t.width/t.height;const s={x:0,y:0,z:-5},v={x:1,y:1,z:1},d={x:0,y:0,z:0},p=Date.now();function l(){const f=(Date.now()-p)/1e3;d.x=Math.sin(f/2),d.y=Math.cos(f/2);const h=Y(c,s,d,v),y=new Float32Array([f,f,f,f]);r.queue.writeBuffer(i.mvpBuffer,0,h.buffer),r.queue.writeBuffer(i.mvpBuffer,4*4*4,y),Z(r,a,i),requestAnimationFrame(l)}l(),window.addEventListener("resize",()=>{t.width=e.width=e.clientWidth*devicePixelRatio,t.height=e.height=e.clientHeight*devicePixelRatio,i.depthTexture.destroy(),i.depthTexture=r.createTexture({size:t,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),i.depthView=i.depthTexture.createView(),c=t.width/t.height})}J();
