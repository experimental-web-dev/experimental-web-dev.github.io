let drakDiffuseScene = {
    skyGradient_1: {x: 0.0, y: 0.0, z: 0.0},
    skyGradient_2: {x: 0.0, y: 0.0, z: 0.0},
    camera: {
        position: {x: 0.0, y: 3.0, z: -5.0},
        lookAtTarget: {x: 0.0, y: 0.0, z: 0.0},
        up: {x: 0.0, y: 1.0, z: 0.0},
        forward: {x: 0.0, y: 0.0, z: 1.0},
        right: {x: 1.0, y: 0.0, z: 0.0},
        fov: 120.0,
    },
    lights: [

    ],
    spheres: [
        {
            position: {x: -1.0, y: 1.00, z: 0.0},
            radius: 1.0,
            obj_id: 0,
        },
        {
            position: {x: 1.0, y: 1.00, z: 0.0},
            radius: 1.0,
            obj_id: 1,
        },
        {
            position: {x: 0.0, y: -1000.0, z: 0.0},
            radius: 1000.0,
            obj_id: 2,
        },
    ],
    materials: [
        {
            albedo: {r: 0.9, g: 0.9, b: 0.9},
            diffuse: 1.0,
            emission: {r: 0.0, g: 0.0, b: 0.0},
            specular: 0.0,
            specular_exp: 100.0,
            shininess: 0.1,
            refraction: 1.0,
            refractive_index: 2.00,
            reflection: 1.0,
            fuzz: 0.5,
        },
        {
            albedo: {r: 0.0, g: 0.0, b: 0.0},
            diffuse: 1.0,
            emission: {r: 1.0, g: 1.0, b: 0.0},
            specular: 0.0,
            specular_exp: 1.0,
            shininess: 1.0,
            refraction: 0.0,
            refractive_index: 0.0,
            reflection: 0.0,
            fuzz: 0.0,
        },
        {
            albedo: {r: 0.9, g: 0.9, b: 0.9},
            diffuse: 1.0,
            emission: {r: 0.0, g: 0.0, b: 0.0},
            specular: 0.0,
            specular_exp: 1.0,
            shininess: 1.0,
            refraction: 0.0,
            refractive_index: 0.0,
            reflection: 0.0,
            fuzz: 0.0,
        },
    ]
}

let lightRefractionScene = {
    skyGradient_1: {x: 0.67, y: 0.84, z: 0.97},
    skyGradient_2: {x: 0.57, y: 0.63, z: 0.70},
    camera: {
        position: {x: 0.0, y: 1.1, z: -5.0},
        lookAtTarget: {x: 0.0, y: 0.0, z: 0.0},
        up: {x: 0.0, y: 1.0, z: 0.0},
        forward: {x: 0.0, y: 0.0, z: 1.0},
        right: {x: 1.0, y: 0.0, z: 0.0},
        fov: 120.0,
    },
    lights: [
        {
            position: {x: 0.0, y: 10.0, z: 0.0},
            radius: 0.1,
            color: {r: 1.0, g: 1.0, b: 1.0},
            intensity: 0.0,
            fallout: {c1: 0.1, c2: 0.01}, //companion constants to linear and quadratic terms
        },
        {
            position: {x: 0.0, y: -5.0, z: 0.0},
            radius: 0.1,
            color: {r: 1.0, g: 1.0, b: 1.0},
            intensity: 0.0,
            fallout: {c1: 0.0, c2: 0.0}, //companion constants to linear and quadratic terms
        }
    ],
    spheres: [
        {
            position: {x: -1.1, y: 1.05, z: 0.0},
            radius: 1.0,
            obj_id: 0,
        },
        {
            position: {x: 1.0, y: 1.05, z: 0.0},
            radius: 1.0,
            obj_id: 1,
        },
        {
            position: {x: 0.0, y: -1000.0, z: 0.0},
            radius: 1000.0,
            obj_id: 2,
        },
    ],
    materials: [
        {
            albedo: {r: 0.9, g: 0.9, b: 0.9},
            diffuse: 0.0,
            emission: {r: 0.0, g: 0.0, b: 0.0},
            specular: 0.0,
            specular_exp: 100.0,
            shininess: 0.1,
            refraction: 1.0,
            refractive_index: 2.00,
            reflection: 1.0,
            fuzz: 0.5,
        },
        {
            albedo: {r: 0.0, g: 0.0, b: 0.0},
            diffuse: 1.0,
            emission: {r: 1.0, g: 1.0, b: 0.0},
            specular: 0.0,
            specular_exp: 1.0,
            shininess: 1.0,
            refraction: 0.0,
            refractive_index: 0.0,
            reflection: 0.0,
            fuzz: 0.0,
        },
        {
            albedo: {r: 0.9, g: 0.9, b: 0.9},
            diffuse: 1.0,
            emission: {r: 0.0, g: 0.0, b: 0.0},
            specular: 0.0,
            specular_exp: 1.0,
            shininess: 1.0,
            refraction: 0.0,
            refractive_index: 0.0,
            reflection: 0.0,
            fuzz: 0.0,
        },
    ]
}

const scene = lightRefractionScene

const sphereByteLength = 32 //1 * 3 * 4 + 2 * 4; //1 vec3 of floats and 2 single variables;
const materialByteLength = 16*4
const lightByteLength = 12*4

const getSkyGradient = () => {
    return new Float32Array([
        scene.skyGradient_1.x, scene.skyGradient_1.y, scene.skyGradient_1.z, 1.0,
        scene.skyGradient_2.x, scene.skyGradient_2.y, scene.skyGradient_1.z, 1.0
    ])
}

const getCamera = () => {
    return new Float32Array([
        scene.camera.position.x, scene.camera.position.y, scene.camera.position.z, 0.0,
        scene.camera.lookAtTarget.x, scene.camera.lookAtTarget.y, scene.camera.lookAtTarget.z, 0.0,
        scene.camera.up.x, scene.camera.up.y, scene.camera.up.z, 0.0,
        scene.camera.forward.x, scene.camera.forward.y, scene.camera.forward.z, 0.0,
        scene.camera.right.x, scene.camera.right.y, scene.camera.right.z,
        scene.camera.fov
    ])
}

const getSphere = (obj_id:number) => {
    return new Float32Array([
        scene.spheres[obj_id].position.x, scene.spheres[obj_id].position.y, scene.spheres[obj_id].position.z,
        scene.spheres[obj_id].radius, obj_id
    ])
}

const getSpheres = () => {
    //let spheresArray = new SharedArrayBuffer(scene.spheres.length * sphereByteLength)
    let floatLens = new Float32Array(scene.spheres.length * sphereByteLength / 4)

    for (let i = 0; i < scene.spheres.length; i++) {
        floatLens.set(getSphere(i), i * sphereByteLength / 4);
    }

    return floatLens;
}

const getMaterial = (index:number) => {
    let material = scene.materials[index]
    return new Float32Array([
        material.albedo.r, material.albedo.g, material.albedo.b, material.diffuse, //0.0 for memory layout with shader
        material.emission.r, material.emission.g, material.emission.b, material.specular,
        material.specular_exp, material.shininess, material.refraction, material.refractive_index,
        material.reflection, material.fuzz, 0.0, 0.0
    ])
}

const getMaterials = () => {
    let floatArray = new Float32Array(scene.materials.length * materialByteLength / 4)

    for (let i = 0; i < scene.materials.length; i++) {
        floatArray.set(getMaterial(i), i * materialByteLength / 4);
    }

    return floatArray;
}

const getLight = (index:number) => {
    let light = scene.lights[index]
    return new Float32Array([
        light.position.x, light.position.y, light.position.z, light.radius,
        light.color.r, light.color.g, light.color.b, light.intensity,
        light.fallout.c1, light.fallout.c2, 0.0, 0.0
    ])
}

const getLights = () => {
    let floatArray = new Float32Array(scene.lights.length * lightByteLength / 4)

    for (let i = 0; i < scene.lights.length; i++) {
        floatArray.set(getLight(i), i * lightByteLength / 4);
    }

    return floatArray;
}



export {scene, sphereByteLength, materialByteLength, lightByteLength, getSkyGradient, getCamera, getSpheres, getMaterials, getLights};