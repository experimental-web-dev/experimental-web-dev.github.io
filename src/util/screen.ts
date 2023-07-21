const vertex = new Float32Array([
    // float3 position, float2 uv
    +1, +1, 0,    1, 1,
    -1, +1, 0,    0, 1,
    -1, -1, 0,    0, 0,
    -1, -1, 0,    0, 0,
    +1, -1, 0,    1, 0,
    +1, +1, 0,    1, 1,
])

const vertexCount = 6

export {vertex, vertexCount}