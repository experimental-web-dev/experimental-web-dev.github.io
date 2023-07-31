import basicVert from './shaders/myRaytracingShader.vert.wgsl?raw'
import raytracingFrag from './shaders/myRaytracingShader.frag.wgsl?raw'
import * as cube from './util/screen'
import * as scene from './util/scene'
import { normalize, mult } from './util/math'

// initialize webgpu device & config canvas context
async function initWebGPU(canvas: HTMLCanvasElement) {
    if(!navigator.gpu)
        throw new Error('Not Support WebGPU')
    const adapter = await navigator.gpu.requestAdapter()
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
                code: raytracingFrag,
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

    const lastFrameTexture = device.createTexture({
        size, format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    })

    const lastFrameView = lastFrameTexture.createView()

    //const offscreenTexture = device.createTexture({
    //    size, format,
    //    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    //})
//
    //const offscreenView = offscreenTexture.createView()

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
        size: 8 * 4, // 8 x uint32
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

    const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
    });

    const lastFrameGroup = device.createBindGroup({
        label: 'Frame Group',
        layout: pipeline.getBindGroupLayout(1),
        entries:[
            {
                binding: 0,
                resource: sampler
            },
            {
                binding: 1,
                resource: lastFrameView
            }
        ]
    })

    // return all vars
    return { pipeline, vertexBuffer, infoBuffer, uInfoBuffer, skyGradientBuffer, spheresBuffer, materialsBuffer,
        lightsBuffer, cameraBuffer, uniformGroup, depthTexture, depthView, lastFrameTexture, lastFrameView, lastFrameGroup, sampler}
}

// create & submit device commands
async function draw(
    device: GPUDevice, 
    context: GPUCanvasContext,
    pipelineObj: {
        pipeline: GPURenderPipeline
        vertexBuffer: GPUBuffer
        infoBuffer: GPUBuffer
        uInfoBuffer: GPUBuffer
        skyGradientBuffer: GPUBuffer
        spheresBuffer: GPUBuffer
        materialsBuffer: GPUBuffer
        lightsBuffer: GPUBuffer
        cameraBuffer: GPUBuffer
        uniformGroup: GPUBindGroup
        depthView: GPUTextureView
        lastFrameTexture: GPUTexture
        lastFrameView: GPUTextureView
        lastFrameGroup: GPUBindGroup
        sampler: GPUSampler
    }
) {
    // start encoder
    const commandEncoder = device.createCommandEncoder()

    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
            {
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0.0, g: 0.0, b: 0, a: 1.0 },
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

    // we can use commandEncoder to copy textures
    //commandEncoder.copyTextureToBuffer

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    
    passEncoder.setPipeline(pipelineObj.pipeline)
    passEncoder.setVertexBuffer(0, pipelineObj.vertexBuffer)
    passEncoder.setBindGroup(0, pipelineObj.uniformGroup)
    passEncoder.setBindGroup(1, pipelineObj.lastFrameGroup)

    passEncoder.draw(cube.vertexCount)
    passEncoder.end()

    // webgpu run in a separate process, all the commands will be executed after submit
    device.queue.submit([commandEncoder.finish()])
    //device.queue.onSubmittedWorkDone().then(() => {
    //    device.queue.copyExternalImageToTexture(
    //        {source: context.canvas},// pipelineObj.offscreenTexture},
    //        {texture: pipelineObj.lastFrameTexture},
    //        [pipelineObj.lastFrameTexture.width, pipelineObj.lastFrameTexture.height]
    //    )
    //})
    
    device.queue.copyExternalImageToTexture(
        {source: context.canvas},// pipelineObj.offscreenTexture},
        {texture: pipelineObj.lastFrameTexture},
        [pipelineObj.lastFrameTexture.width, pipelineObj.lastFrameTexture.height]
    )
}

async function run(){
    const canvas = document.querySelector('canvas')
    if (!canvas)
        throw new Error('No Canvas')
    const {device, context, format, size} = await initWebGPU(canvas)
    const pipelineObj = await initPipeline(device, format, size)
    let aspect = size.width/ size.height
    
    // start loop
    const startTime = Date.now()
    //let targetFPS = 60
    let lastFrameTime = 0
    const global = {
        frameAccumulator: true,
        frameCount: 0,
        raysPerPixel: 1,
        frameRateSlowDown: 2,
        slowCount: 0,
    }

    const input = {
        pressedKeys: new Set(),
        cameraSpeed: 3.0,
        fastCameraSpeed: 9.0,
        direction: {x: 0.0, y: 0.0},
        mouse:{
            movementX: 0.0,
            movementY: 0.0,
            rotate: false,
            previousX: 0.0,
            previousY: 0.0,
            sensibility: 0.15
        }
    }
    scene.setCamera()

    async function frame(){
        const deltaTime = (Date.now() - lastFrameTime) / 1000;
        handleInput(deltaTime)
        lastFrameTime = Date.now()

        if (global.slowCount % global.frameRateSlowDown === 0) {
            renderFrame()
        }
        global.slowCount++

        requestAnimationFrame(frame)
    }
    frame()

    async function renderFrame(){
        // rotate by time, and update transform matrix
        const milliseconds = Date.now() - startTime;
        const now = (Date.now() - startTime) / 1000
        const info = new Float32Array([now, aspect, size.width, size.height])
        
        const uInfo = new Uint32Array([scene.scene.spheres.length, scene.scene.lights.length, Math.trunc(milliseconds),
            global.frameCount, global.raysPerPixel])

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

        if (context.canvas.width != pipelineObj.lastFrameTexture.width || 
            context.canvas.height != pipelineObj.lastFrameTexture.height) {
                console.error(`Dimensions don't match ${context.canvas.width}, ${pipelineObj.lastFrameTexture.width}`)         
        } else {
        }

        // then draw
        draw(device, context, pipelineObj)

        if (global.frameAccumulator) {
            global.frameCount += 1
            //console.log(global.frameCount)
            //if (global.frameCount >= 600) {
            //    global.frameCount = 0
            //}
        } else {
            global.frameCount = 0
        }
    }

    function isKeyPressed(key:string) {
        return input.pressedKeys.has(key);
    }

    function handleInput(deltaTime:number){
        input.direction.x = 0
        input.direction.y = 0
        let speed = input.cameraSpeed

        if (isKeyPressed('w')) {
            input.direction.y += 1.0
            global.frameCount = 0
        }
        if (isKeyPressed('s')) {
            input.direction.y -= 1.0
            global.frameCount = 0
        }
        if (isKeyPressed('a')) {
            input.direction.x -= 1.0
            global.frameCount = 0
        }
        if (isKeyPressed('d')) {
            input.direction.x += 1.0
            global.frameCount = 0
        }
        if (isKeyPressed('shift')) {
            speed = input.fastCameraSpeed
        }
        //console.log(input.pressedKeys)
        
        if (global.frameCount === 0) {
            input.direction = normalize(input.direction)
            input.direction.x *= deltaTime * speed
            input.direction.y *= deltaTime * speed
            scene.moveCamera(input.direction)
        }
    }

    function colorToRGB (color:string) {
        return {
            r: +('0x' + color.slice(1, 3)) / 255,
            g: +('0x' + color.slice(3, 5)) / 255,
            b: +('0x' + color.slice(5, 7)) / 255,
        }
    }

    let emissiveSphere = {
        id: 1,
        color: () => {
            const color = (document.querySelector('.emission input[type="color"]') as HTMLInputElement).value
            return colorToRGB(color)
        },
        intensity: () => {
            const intensity = +(document.querySelector('.emission input[type="range"]') as HTMLInputElement).value
            return intensity
        },
        update: function () {
            let intensity = this.intensity()
            let color = this.color()
            scene.scene.materials[this.id].emission = mult(intensity, color)
        }
    }
    emissiveSphere.update();

    document.querySelector('.emission input[type="color"]')?.addEventListener('input', () => {
        emissiveSphere.update()
    })

    document.querySelector('.emission input[type="range"]')?.addEventListener('input', () => {
        emissiveSphere.update()
    })

    let skybox = {
        skyColor: document.getElementById('skybox-sky') as HTMLInputElement,
        horizonColor: document.getElementById('skybox-horizon') as HTMLInputElement,
        intensity: document.querySelector('.skybox input[type="range"]') as HTMLInputElement,
        update: function () {    
            let i = parseFloat(this.intensity.value)
            let sky = mult(i, colorToRGB(this.skyColor.value))
            let horizon = mult(i, colorToRGB(this.horizonColor.value))

            scene.scene.skyGradient_1 = sky
            scene.scene.skyGradient_2 = horizon
        }
    }
    skybox.update()

    let light = {
        id: 0,
        colorElement: document.getElementById('light-color') as HTMLInputElement,
        intensityElement: document.getElementById('light-intensity') as HTMLInputElement,
        radiusElement: document.getElementById('light-radius') as HTMLInputElement,
        update: function () {
            const intensity = parseFloat(this.intensityElement.value)
            const color = colorToRGB(this.colorElement.value)
            const radius = parseFloat(this.radiusElement.value)

            const light = scene.scene.lights[this.id]
            light.color = color
            light.intensity = intensity
            light.radius = radius
        }
    }
    light.update()
    
    let material = {
        id:0,
        typeElement: document.getElementById('material-type') as HTMLSelectElement,
        albedoElement: document.getElementById('albedo') as HTMLInputElement,
        specularElement: document.getElementById('specular') as HTMLInputElement,
        specularExpElement: document.getElementById('specular-exp') as HTMLInputElement,
        shininessElement: document.getElementById('shininess') as HTMLInputElement,
        metalFuzzElement: document.getElementById('metal-fuzz') as HTMLInputElement,
        refractionIndexElement: document.getElementById('refraction-index') as HTMLInputElement,
        upddate: function () {
            const materialType = this.typeElement.value
            const albedo = colorToRGB(this.albedoElement.value)
            const specular = parseFloat(this.specularElement.value)
            const specularExp = parseFloat(this.specularExpElement.value)
            const shininess = parseFloat(this.shininessElement.value)
            const metalFuzz = parseFloat(this.metalFuzzElement.value)
            const refractionIndex = parseFloat(this.refractionIndexElement.value)

            const material = scene.scene.materials[this.id]

            switch (materialType) {
                case 'Diffuse': {
                    material.diffuse = 1.0
                    material.refraction = 0.0
                    material.reflection = 0.0
                    break;
                }
                case 'Glass': {
                    material.diffuse = 0.0
                    material.refraction = 1.0
                    material.reflection = 0.0
                    break;
                }
                case 'Metal': {
                    material.diffuse = 0.0
                    material.refraction = 0.0
                    material.reflection = 1.0
                    break;
                }
                default: {
                    break;
                }
            }
            
            material.albedo = albedo
            material.specular = specular
            material.specularExp = specularExp
            material.shininess = 1.0 / shininess //Using the inverse representation on the UI
            material.fuzz = metalFuzz
            material.refractiveIndex = refractionIndex
        }
    }

    //document.querySelector()

    document.querySelectorAll('.material-property').forEach(element =>{
        element.addEventListener('input', () => {
            material.upddate()
        })
    })

    document.getElementById('skybox-sky')?.addEventListener('input', () => {
        skybox.update()
    })

    document.getElementById('skybox-horizon')?.addEventListener('input', () => {
        skybox.update()
    })

    document.querySelector('.skybox input[type="range"]')?.addEventListener('input', () => {
        skybox.update()
    })

    document.querySelectorAll('.light-property').forEach(element => {
        element.addEventListener('input', () => {
            light.update()
        })
    })

    document.getElementById('accumulator')?.addEventListener('input', event => {
        global.frameAccumulator = (event.target as HTMLInputElement).checked
        global.frameCount = 0
    })

    document.getElementById('fps-rate')?.addEventListener('input', event => {
        global.frameRateSlowDown = parseFloat((event.target as HTMLInputElement).value)
    })

    document.getElementById('rays-per-pixel')?.addEventListener('input', event => {
        global.raysPerPixel = parseInt((event.target as HTMLInputElement).value)
    })

    window.addEventListener('keydown', event => {
        input.pressedKeys.add(event.key.toLowerCase())
        if (event.key.toLocaleLowerCase() == 'r') {
            scene.resetCamera()
            global.frameCount = 0
        }
    })

    window.addEventListener('keyup', event => {
        input.pressedKeys.delete(event.key.toLowerCase())
    })

    window.addEventListener('mousemove', event => {
        input.mouse.movementX = event.offsetX - input.mouse.previousX;
        input.mouse.movementY = event.offsetY - input.mouse.previousY;
        input.mouse.previousX = event.offsetX
        input.mouse.previousY = event.offsetY

        //console.log(input.mouse.movementX)
        input.mouse.rotate = (event.buttons === 1);

        if (input.mouse.rotate) {
            const maxMovement = 100
            if (Math.abs(input.mouse.movementX) > maxMovement || Math.abs(input.mouse.movementY) > maxMovement){
                return
            }
            scene.rotateCamera({x: -input.mouse.sensibility * input.mouse.movementY, y: -input.mouse.sensibility * input.mouse.movementX})
            global.frameCount = 0
        }
    })

    // re-configure context on resize
    window.addEventListener('resize', ()=>{
        size.width = canvas.width = canvas.clientWidth * devicePixelRatio
        size.height = canvas.height = canvas.clientHeight * devicePixelRatio
        // update aspect
        aspect = size.width/ size.height
        global.frameCount = 0

        //context.configure()

        // don't need to recall context.configure() after v104
        // re-create depth texture
        pipelineObj.depthTexture.destroy()
        pipelineObj.depthTexture = device.createTexture({
            size, format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        })
        pipelineObj.depthView = pipelineObj.depthTexture.createView()

        pipelineObj.lastFrameTexture.destroy()
    
        pipelineObj.lastFrameTexture = device.createTexture({
            size, format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        pipelineObj.lastFrameView = pipelineObj.lastFrameTexture.createView()

        pipelineObj.lastFrameGroup = device.createBindGroup({
            label: 'Frame Group',
            layout: pipelineObj.pipeline.getBindGroupLayout(1),
            entries:[
                {
                    binding: 0,
                    resource: pipelineObj.sampler
                },
                {
                    binding: 1,
                    resource: pipelineObj.lastFrameView
                }
            ]
        })
    })
}
run()