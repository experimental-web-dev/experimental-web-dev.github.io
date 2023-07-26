import computeShader from './shaders/myComputeShader.wgsl?raw'
import displayShader from './shaders/myDisplayShader.wgsl?raw'
import * as cube from './util/screen'
import * as scene from './util/scene'

// initialize webgpu device & config canvas context
async function initWebGPU(canvas: HTMLCanvasElement) {
    if(!navigator.gpu)
        throw new Error('Not Support WebGPU')
    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
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
        device, format,
        // prevent chrome warning after v102
        alphaMode: 'opaque'
    })
    return {device, context, format, size}
}

// create pipiline & buffers
async function initPipeline(device: GPUDevice, format: GPUTextureFormat, size: {width:number, height:number}) {
    const renderPipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
            code: displayShader,
            }),
            entryPoint: 'vert_main',
        },
        fragment: {
            module: device.createShaderModule({
            code: displayShader,
            }),
            entryPoint: 'frag_main',
            targets: [
            {
                format,
            },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });
    
    const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    });

    const accumulatorTexture = device.createTexture({
        size, format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,// | GPUTextureUsage.STORAGE_BINDING,
    })
    const accumulatorView = accumulatorTexture.createView()

    const outTexture = device.createTexture({
        size, format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    })
    const outView = outTexture.createView()

    // create a compute pipeline
    const computePipeline = await device.createComputePipelineAsync({
        layout: 'auto',
        compute: {
            module: device.createShaderModule({
                code: computeShader
            }),
            entryPoint: 'main'
        }
    })

    // create vertex buffer
    const vertexBuffer = device.createBuffer({
        label: 'GPUBuffer store vertex',
        size: cube.vertex.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    })
    device.queue.writeBuffer(vertexBuffer, 0, cube.vertex)
    // create a mvp matrix buffer
    const infoBuffer = device.createBuffer({
        label: 'Render info as hight/witdth and time',
        size: 4 * 4, // 4 x float32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const uInfoBuffer = device.createBuffer({
        label: 'Render info as unsigned int',
        size: 4 * 4, // 4 x uint32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const skyGradientBuffer = device.createBuffer({
        label: 'Sky gradient',
        size: 2 * 4 * 4, // 2 x 4 x float32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const spheresBuffer = device.createBuffer({
        label: 'Spheres',
        size: 3200,//scene.scene.spheres.length * scene.sphereByteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const materialsBuffer = device.createBuffer({
        label: 'Materials',
        size: 6400, //scene.scene.materials.length * scene.materialByteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const lightsBuffer = device.createBuffer({
        label: 'Lights',
        size: 4800, //scene.scene.lights.length * scene.lightByteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const cameraBuffer = device.createBuffer({
        label: 'Camera',
        size: 80, // n * floats
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    // create a uniform group for render pass
    const renderGroup = device.createBindGroup({
        label: 'Render Group',
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: sampler,
            },
            {
                binding: 1,
                resource: outView,
            },
        ]
    })

    // create a binding group for compute pass
    const computeGroup = device.createBindGroup({
        label: 'Compute Group',
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: infoBuffer
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: uInfoBuffer
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: skyGradientBuffer
                }
            },
            {
                binding: 3,
                resource: {
                    buffer: spheresBuffer
                }
            },
            {
                binding: 4,
                resource: {
                    buffer: materialsBuffer
                }
            },
            {
                binding: 5,
                resource: {
                    buffer: lightsBuffer
                }
            },
            {
                binding: 6,
                resource: {
                    buffer: cameraBuffer
                }
            },
        ]
    })

    const accumulatorBindGroup = device.createBindGroup({
        label: 'Accumulator/Compute BindGroup',
        layout: computePipeline.getBindGroupLayout(1),
        entries: [
            {
                binding: 0,
                resource: sampler,
            },
            {
                binding: 1,
                resource: accumulatorView
            },
            {
                binding: 2,
                resource: outView
            }
        ]
    })

    // return all vars
    return { renderPipeline, computePipeline, vertexBuffer, infoBuffer, uInfoBuffer, skyGradientBuffer, spheresBuffer, materialsBuffer,
        lightsBuffer, cameraBuffer, renderGroup, computeGroup, accumulatorBindGroup, accumulatorTexture, accumulatorView, outView}
}

// create & submit device commands
function draw(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipelineObj: {
        renderPipeline: GPURenderPipeline
        computePipeline:GPUComputePipeline
        vertexBuffer: GPUBuffer
        infoBuffer: GPUBuffer
        uInfoBuffer: GPUBuffer
        skyGradientBuffer: GPUBuffer
        spheresBuffer: GPUBuffer
        materialsBuffer: GPUBuffer
        lightsBuffer: GPUBuffer
        cameraBuffer: GPUBuffer
        renderGroup: GPUBindGroup
        computeGroup: GPUBindGroup
        accumulatorBindGroup: GPUBindGroup
        accumulatorView: GPUTextureView
    }
) {
    // start encoder
    const commandEncoder = device.createCommandEncoder()
    // compute pass
    const computePass = commandEncoder.beginComputePass()
    computePass.setPipeline(pipelineObj.computePipeline)
    computePass.setBindGroup(0, pipelineObj.computeGroup)
    computePass.setBindGroup(1, pipelineObj.accumulatorBindGroup)
    computePass.dispatchWorkgroups(10, 10)
    computePass.end()

    // render pass
    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
            {
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }
        ],
    }
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipelineObj.renderPipeline)
    passEncoder.setVertexBuffer(0, pipelineObj.vertexBuffer)
    passEncoder.setBindGroup(0, pipelineObj.renderGroup)
    passEncoder.draw(cube.vertexCount);
    passEncoder.end()
    // webgpu run in a separate process, all the commands will be executed after submit
    device.queue.submit([commandEncoder.finish()])
}

async function run(){
    const canvas = document.querySelector('canvas')
    if (!canvas)
        throw new Error('No Canvas')
    
    const {device, context, format, size} = await initWebGPU(canvas)
    const pipelineObj = await initPipeline(device, format, size)
    // default state
    let aspect = size.width/ size.height
    // start loop
    const startTime = Date.now()
    function frame(){
        // rotate by time, and update transform matrix
        const milliseconds = Date.now() - startTime;
        const now = (Date.now() - startTime) / 1000
        const info = new Float32Array([now, aspect, size.width, size.height])
        const uInfo = new Uint32Array([scene.scene.spheres.length, scene.scene.lights.length, Math.trunc(milliseconds)])

        device.queue.writeBuffer(
            pipelineObj.infoBuffer,
            0,
            info
        )

        device.queue.writeBuffer(
            pipelineObj.uInfoBuffer,
            0,
            uInfo
        )

        device.queue.writeBuffer(
            pipelineObj.skyGradientBuffer,
            0,
            scene.getSkyGradient()
        )
        
        device.queue.writeBuffer(
            pipelineObj.spheresBuffer,
            0,
            scene.getSpheres()
        )

        device.queue.writeBuffer(
            pipelineObj.materialsBuffer,
            0,
            scene.getMaterials()
        )

        device.queue.writeBuffer(
            pipelineObj.lightsBuffer,
            0,
            scene.getLights()
        )

        device.queue.writeBuffer(
            pipelineObj.cameraBuffer,
            0,
            scene.getCamera()
        )

        // then draw
        draw(device, context, pipelineObj)
        requestAnimationFrame(frame)
    }
    frame()

    // re-configure context on resize
    window.addEventListener('resize', ()=>{
        size.width = canvas.width = canvas.clientWidth * devicePixelRatio
        size.height = canvas.height = canvas.clientHeight * devicePixelRatio
        // don't need to recall context.configure() after v104
        // re-create texture

        pipelineObj.accumulatorTexture.destroy()
        pipelineObj.accumulatorTexture = device.createTexture({
            size, format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        pipelineObj.accumulatorView = pipelineObj.accumulatorTexture.createView()
        // update aspect
        aspect = size.width/ size.height
    })
}
run()