import basicVert from './shaders/myRaytracingShader.vert.wgsl?raw'
import positionFrag from './shaders/myRaytracingShader.frag.wgsl?raw'
import computeShader from './shaders/myComputeShader.wgsl?raw'
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
    const pipeline = await device.createRenderPipelineAsync({
        label: 'Basic Pipline',
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: basicVert,
            }),
            entryPoint: 'main',
            buffers: [{
                arrayStride: 5 * 4, // 3 position 2 uv,
                attributes: [
                    {
                        // position
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3',
                    },
                    {
                        // uv
                        shaderLocation: 1,
                        offset: 3 * 4,
                        format: 'float32x2',
                    }
                ]
            }]
        },
        fragment: {
            module: device.createShaderModule({
                code: positionFrag,
            }),
            entryPoint: 'main',
            targets: [
                {
                    format: format
                }
            ]
        },
        primitive: {
            topology: 'triangle-list',
            // Culling backfaces pointing away from the camera
            cullMode: 'back',
            frontFace: 'ccw'
        },
        // Enable depth testing since we have z-level positions
        // Fragment closest to the camera is rendered in front
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        }
    } as GPURenderPipelineDescriptor)
    // create depthTexture for renderPass
    const depthTexture = device.createTexture({
        size, format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    const depthView = depthTexture.createView()

    // create depthTexture for renderPass
    const accumulatorTexture = device.createTexture({
        size, format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    })
    const accumulatorView = accumulatorTexture.createView()

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

    // create a uniform group for Matrix
    const uniformGroup = device.createBindGroup({
        label: 'Uniform Group',
        layout: pipeline.getBindGroupLayout(0),
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
        label: 'Compute Group',
        layout: computePipeline.getBindGroupLayout(1),
        entries: [
            {
                binding: 0,
                resource: accumulatorView,
            },
        ]
    })

    // return all vars
    return { pipeline, computePipeline, vertexBuffer, infoBuffer, uInfoBuffer, skyGradientBuffer, spheresBuffer, materialsBuffer,
        lightsBuffer, cameraBuffer, uniformGroup, computeGroup, accumulatorBindGroup, depthTexture, depthView, accumulatorTexture, accumulatorView}
}

// create & submit device commands
function draw(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipelineObj: {
        pipeline: GPURenderPipeline
        computePipeline:GPUComputePipeline
        vertexBuffer: GPUBuffer
        infoBuffer: GPUBuffer
        uInfoBuffer: GPUBuffer
        skyGradientBuffer: GPUBuffer
        spheresBuffer: GPUBuffer
        materialsBuffer: GPUBuffer
        lightsBuffer: GPUBuffer
        cameraBuffer: GPUBuffer
        uniformGroup: GPUBindGroup
        computeGroup: GPUBindGroup
        accumulatorBindGroup: GPUBindGroup
        depthView: GPUTextureView
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
    computePass.dispatchWorkgroups(64000)
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
        depthStencilAttachment: {
            view: pipelineObj.depthView,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        },
    }
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipelineObj.pipeline)
    // set vertex
    passEncoder.setVertexBuffer(0, pipelineObj.vertexBuffer)
    // set uniformGroup
    passEncoder.setBindGroup(0, pipelineObj.uniformGroup)
    // draw vertex count of cube
    passEncoder.draw(cube.vertexCount)
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
        // re-create depth texture
        pipelineObj.depthTexture.destroy()
        pipelineObj.depthTexture = device.createTexture({
            size, format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        })
        pipelineObj.depthView = pipelineObj.depthTexture.createView()

        pipelineObj.accumulatorTexture.destroy()
        pipelineObj.accumulatorTexture = device.createTexture({
            size, format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        })
        pipelineObj.accumulatorView = pipelineObj.accumulatorTexture.createView()
        // update aspect
        aspect = size.width/ size.height
    })
}
run()