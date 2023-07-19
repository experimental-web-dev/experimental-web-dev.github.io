@binding(0) @group(0) var<uniform> abc : array<vec4<f32>, 5>;

fn palette(t:f32) -> vec3<f32>{
    let a = vec3<f32>(0.5, 0.5, 0.5);
    let b = vec3<f32>(0.5, 0.5, 0.5);
    let c = vec3<f32>(1.0, 1.0, 1.0);
    let d = vec3<f32>(0.00, 0.10, 0.20);
    
    return a + b * cos( 6.28318*(c*t+d) );
}

@fragment
fn main(
    @location(0) fragUV: vec2<f32>,
    @location(1) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
    var uv = fragUV * 2.0 - 1.0;
    let uv0 = uv;
    let time = 2.0 * abc[0][2];
    var finalColor = vec3<f32>(0.0);

    for (var i = 0; i < 2; i++){
        uv = 2.0 * fract(uv * 1.666) - 1.0;

        var distance = length(uv) * exp(-length(uv0));
        let color = palette(length(uv0) + f32(i) * 0.4 + time * .4);

        distance = sin(distance * 8.0 - time);
        distance = abs(distance);
        distance = 0.16 / distance;
        distance = pow(distance, 1.2);

        finalColor += color * distance;
    }

    return vec4(finalColor, 1.0);
}