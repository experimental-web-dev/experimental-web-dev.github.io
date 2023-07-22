@group(0) @binding(0) var<uniform> info : vec4<f32>;
@group(0) @binding(1) var<uniform> u_info : vec4<u32>;
@group(0) @binding(2) var<uniform> sky_gradient : array<vec4<f32>, 2>;
@group(0) @binding(3) var<uniform> spheres_array : array<Sphere, 100>;
@group(0) @binding(4) var<uniform> materials_array : array<Material, 100>;
@group(0) @binding(5) var<uniform> camera_setup : Camera;
//[[group(0), binding(5), minBufferBindingSize(80)]] var<uniform> camera_setup : Camera;

fn palette(t:f32) -> vec3<f32>{
    let a = vec3<f32>(0.5, 0.5, 0.5);
    let b = vec3<f32>(0.5, 0.5, 0.5);
    let c = vec3<f32>(1.0, 1.0, 1.0);
    let d = vec3<f32>(0.00, 0.10, 0.20);
    
    return a + b * cos( 6.28318*(c*t+d) );
}

struct Sphere{
    position:vec3<f32>,
    radius:f32,
    obj_id:f32,
}

struct Material{
    albedo:vec3<f32>,
}

struct Camera{
    position:vec3<f32>,
    look_target:vec3<f32>,
    up:vec3<f32>,
    forward:vec3<f32>,
    right:vec3<f32>,
    fov:f32
}

struct Ray{
    origin:vec3<f32>,
    direction:vec3<f32>,
}

struct HitData{
    point:vec3<f32>,
    norm:vec3<f32>,
    inside:bool,
    distance:f32,
    obj_id:u32
}

struct Hit{
    did_hit:bool,
    hit_data:HitData,
}

fn create_camera(position:vec3<f32>, look_target:vec3<f32>, fov:f32) -> Camera{
    var camera:Camera;
    camera.position = position;
    camera.look_target = look_target;
    camera.fov = fov;

    camera.forward = normalize(look_target - position);
    camera.up = normalize(vec3(0.0, 1.0, 0.0) - dot(vec3(0.0, 1.0, 0.0), camera.forward) * camera.forward);
    camera.right = cross(camera.up, camera.forward);

    return camera;
}

fn intersect_sphere(id:u32, ray:Ray) -> Hit {
    var hit:Hit;
    hit.did_hit = false;
    let sphere = spheres_array[id];

    let origin_to_center = sphere.position - ray.origin;
    let proj_length = dot(origin_to_center, ray.direction);

    // Test if sphere is in the opposite direction of ray
    let square_distance_to_sphere_origin = dot(origin_to_center, origin_to_center);
    let square_radius = sphere.radius * sphere.radius;
    if proj_length <= 0.0 && square_radius < square_distance_to_sphere_origin{
        return hit;//nothing
    }

    let center_to_direction = origin_to_center - proj_length * ray.direction;
    let square_distance = dot(center_to_direction, center_to_direction);

    // Distance from the ray to the center of the sphere greater than radius
    if square_distance > square_radius{
        return hit;//nothing
    }

    let displacement = sqrt(square_radius - square_distance);

    // Distance from camera
    var distance:f32;
    var inside:bool;

    // Finding if we are inside or outside the sphere and choosing adequate point
    if proj_length > displacement{
        inside = false;
        distance = proj_length - displacement;
    } else {
        inside = true;
        distance = proj_length + displacement;
    }

    //Distance from camera and surface norm
    let point = ray.origin + distance * ray.direction;
    let norm = normalize(point - sphere.position);

    hit.did_hit = true;
    hit.hit_data.point = point;
    hit.hit_data.norm = norm;
    hit.hit_data.inside = inside;
    hit.hit_data.distance = distance;
    hit.hit_data.obj_id = id;
    return hit;
}

fn ray_cast(sphere_count:u32, ray:Ray) -> Hit{
    var hit:Hit;
    hit.did_hit = false;
    var closest_distance:f32 = 10000.0;

    for (var i = 0u; i < sphere_count; i = i + 1u){
        let current_hit = intersect_sphere(i, ray);
        if current_hit.did_hit && current_hit.hit_data.distance < closest_distance{
            hit = current_hit;
            closest_distance = hit.hit_data.distance;
        }
    }
    return hit;
}

fn cast_raytracing(sphere_count:u32, ray:Ray) -> vec3<f32>{
    let hit = ray_cast(sphere_count, ray);

    if hit.did_hit {
        return compute_direct_illumination(hit.hit_data);
    } else {
        return skybox(ray);
    }
}

fn compute_direct_illumination(hit_data:HitData) -> vec3<f32>{
    return materials_array[hit_data.obj_id].albedo * hit_data.norm;
}

fn skybox(ray:Ray) -> vec3<f32>{
    let t = ray.direction.y;
    //return t * vec3(0.67, 0.84, 0.97) + (1.0 - t) * vec3(0.57, 0.63, 0.70);
    return t * sky_gradient[0].xyz + (1.0 - t) * sky_gradient[1].xyz;
}

@fragment
fn main(
    @location(0) fragUV: vec2<f32>,
    @location(1) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
    var uv = fragUV * 2.0 - 1.0;
    let uv0 = uv;
    let time = 1.0 * info[0];
    let aspect_ratio = info[1];
    let width = info[2];
    let height = info[3];
    var finalColor = vec3<f32>(0.0);

    let camera = create_camera(vec3(30.0 * sin(time), 1.0, 30.0 * cos(time)), camera_setup.look_target, camera_setup.fov);
    //var camera = create_camera(camera_setup.position, camera_setup.look_target, camera_setup.fov);
    //camera.position = vec3(30.0 * sin(time), 1.0, 30.0 * cos(time));

    // Many possible otimizations here, not the time yet
    let fov = tan(camera.fov / 180.0 * 3.1514 / 2.0);
    let x = fov * uv.x * (width / 2.0) / width;
    let y = fov * uv.y * (height / 2.0) / width;
    let ray = Ray(camera.position, normalize(camera.forward + x * camera.right + y * camera.up));

    //let b = spheres_array[0].obj_id;
    //let id = u32(round(b));
    let obj_count = u_info[0];
    let light_count = u_info[1];
    let f = camera_setup.fov;

    return vec4(cast_raytracing(obj_count, ray), 1.0);
}