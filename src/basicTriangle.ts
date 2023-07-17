import vertex from './shaders/triangle.vert.wgsl?raw'
import frag from './shaders/red.frag.wgsl?raw'

async function myInitWebGPU(){
    if(!navigator.gpu)
        throw new Error('not support webgpu')

    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
    })

    if(!adapter)
        throw new Error('failed to obtain adapter')
    const device = await adapter.requestDevice({
        requiredFeatures: ['texture-compression-bc'],
    })
    console.log(adapter, device)
    adapter.features.forEach(feature => {
        console.log(feature)
    })

    const canvas = document.querySelector('canvas')
    if(!canvas)
        throw new Error('canvas not found')
    
    const context = canvas.getContext('webgpu')
    if(!context)
        throw new Error('failed to obtain canvas context')

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio

    const format = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device: device,
        format: format,
        alphaMode: "opaque"
    })
    console.log(format)
    return {adapter, device, context, format}
}

async function initPipeline(device: GPUDevice, format: GPUTextureFormat){
    const vertexShader = device.createShaderModule({
        code: vertex
    })
    const fragmentShader = device.createShaderModule({
        code: frag
    })

    const pipeline = await device.createRenderPipelineAsync({
        layout: 'auto',
        vertex: {
            module: vertexShader,
            entryPoint: 'main',
        },
        fragment: {
            module: fragmentShader,
            entryPoint: 'main',
            targets: [{
                format
            }]
        },
        primitive: {
            topology: 'triangle-strip'
        }
    })

    return {pipeline}
}

function draw(device: GPUDevice, pipeline: GPURenderPipeline, context: GPUCanvasContext){
    const encoder = device.createCommandEncoder()
    //Define render pass
    const renderPass = encoder.beginRenderPass({
        colorAttachments:[{
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            clearValue: {r:0, g:0, b:0, a:1},
            storeOp: 'store'
        }]
    })
    renderPass.setPipeline(pipeline)
    renderPass.draw(4)
    renderPass.end()

    const buffer = encoder.finish()
    device.queue.submit([buffer])
}

async function run(){
    console.log("Loading ts")
    const {device, format, context} = await myInitWebGPU()
    const {pipeline} = await initPipeline(device, format)
    draw(device, pipeline, context)
}

run()

/*import triangleVert from './shaders/triangle.vert.wgsl?raw'
import redFrag from './shaders/red.frag.wgsl?raw'

// initialize webgpu device & config canvas context
async function initWebGPU(canvas: HTMLCanvasElement) {
    if(!navigator.gpu)
        throw new Error('Not Support WebGPU')
    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
        // powerPreference: 'low-power'
    })
    if (!adapter)
        throw new Error('No Adapter Found')
    const device = await adapter.requestDevice()
    const context = canvas.getContext('webgpu') as GPUCanvasContext
    const format = navigator.gpu.getPreferredCanvasFormat()
    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio
    const size = {width: canvas.width, height: canvas.height}
    context.configure({
        // json specific format when key and value are the same
        device, format,
        // prevent chrome warning
        alphaMode: 'opaque'
    })
    return {device, context, format, size}
}
// create a simple pipiline
async function initPipeline(device: GPUDevice, format: GPUTextureFormat): Promise<GPURenderPipeline> {
    const descriptor: GPURenderPipelineDescriptor = {
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: triangleVert
            }),
            entryPoint: 'main'
        },
        primitive: {
            topology: 'triangle-list' // try point-list, line-list, line-strip, triangle-strip?
        },
        fragment: {
            module: device.createShaderModule({
                code: redFrag
            }),
            entryPoint: 'main',
            targets: [
                {
                    format: format
                }
            ]
        }
    }
    return await device.createRenderPipelineAsync(descriptor)
}
// create & submit device commands
function draw(device: GPUDevice, context: GPUCanvasContext, pipeline: GPURenderPipeline) {
    const commandEncoder = device.createCommandEncoder()
    const view = context.getCurrentTexture().createView()
    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
            {
                view: view,
                clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
                loadOp: 'clear', // clear/load
                storeOp: 'store' // store/discard
            }
        ]
    }
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipeline)
    // 3 vertex form a triangle
    passEncoder.draw(3)
    passEncoder.end()
    // webgpu run in a separate process, all the commands will be executed after submit
    device.queue.submit([commandEncoder.finish()])
}

async function run(){
    const canvas = document.querySelector('canvas')
    if (!canvas)
        throw new Error('No Canvas')
    const {device, context, format} = await initWebGPU(canvas)
    const pipeline = await initPipeline(device, format)
    // start draw
    draw(device, context, pipeline)
    
    // re-configure context on resize
    window.addEventListener('resize', ()=>{
        canvas.width = canvas.clientWidth * devicePixelRatio
        canvas.height = canvas.clientHeight * devicePixelRatio
        // don't need to recall context.configure() after v104
        draw(device, context, pipeline)
    })
}
run()
*/