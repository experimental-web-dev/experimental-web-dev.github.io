let scene = {
    skyGradient_1: {x: 0.67, y: 0.84, z: 0.97},
    skyGradient_2: {x: 0.57, y: 0.63, z: 0.70},
    lightCount: 0,
    camera: {
        position: {x: 0.0, y: 0.0, z: -50.0},
        lookAtTarget: {x: 0.0, y: 0.0, z: 0.0},
        up: {x: 0.0, y: 1.0, z: 0.0},
        forward: {x: 0.0, y: 0.0, z: 1.0},
        right: {x: 1.0, y: 0.0, z: 0.0},
        fov: 120.0,
    },
    spheres: [
        {
            position: {x: 0.0, y: 0.0, z: 0.0},
            radius: 1.0,
            obj_id: 0,
        },
        {
            position: {x: 1.0, y: 5.0, z: 1.0},
            radius: 2.0,
            obj_id: 1,
        },
        {
            position: {x: 0.0, y: 0.0, z: 5.0},
            radius: 2.0,
            obj_id: 2,
        },
    ],
    materials: [
        {
            color: {r: 1.0, g: 0.0, b: 0.0}
        },
        {
            color: {r: 0.0, g: 10.0, b: 1.0}
        },
        {
            color: {r: 1.0, g: 0.0, b: 1.0}
        },
    ]
}

const sphereByteLength = 32 //1 * 3 * 4 + 2 * 4; //1 vec3 of floats and 2 single variables;
const materialByteLength = 16

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
    return new Float32Array([
        scene.materials[index].color.r, scene.materials[index].color.g, scene.materials[index].color.b,
    ])
}

const getMaterials = () => {
    let floatArray = new Float32Array(scene.materials.length * materialByteLength / 4)

    for (let i = 0; i < scene.materials.length; i++) {
        floatArray.set(getMaterial(i), i * materialByteLength / 4);
    }

    return floatArray;
}



export {scene, sphereByteLength, materialByteLength, getSkyGradient, getCamera, getSpheres, getMaterials};