@binding(0) @group(0) var<uniform> abc : array<vec4<f32>, 5>;

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
    obj_id:u32,
}

struct Camera{
    position:vec3<f32>,
    look_target:vec3<f32>,
    forward:vec3<f32>,
    up:vec3<f32>,
    right:vec3<f32>,
    fov:f32,
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

fn intersect_sphere(sphere:Sphere, ray:Ray) -> Hit {
    var hit:Hit;
    hit.did_hit = false;

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
    hit.hit_data.obj_id = sphere.obj_id;
    return hit;
}

fn ray_cast(spheres:array<Sphere, 3>, sphere_count:u32, ray:Ray) -> Hit{
    var hit:Hit;
    hit.did_hit = false;
    var closest_distance:f32 = 10000.0;

    for (var i = 0u; i < sphere_count; i = i + 1u){
        let current_hit = intersect_sphere(spheres[i], ray);
        if current_hit.did_hit && current_hit.hit_data.distance < closest_distance{
            hit = current_hit;
            closest_distance = hit.hit_data.distance;
        }
    }
    return hit;
}

fn cast_raytracing(spheres:array<Sphere, 3>, sphere_count:u32, ray:Ray) -> vec3<f32>{
    let hit = ray_cast(spheres, sphere_count, ray);

    if hit.did_hit {
        return compute_direct_illumination(hit.hit_data);
    } else {
        return skybox(ray);
    }
}

fn compute_direct_illumination(hit_data:HitData) -> vec3<f32>{
    return hit_data.norm;
}

fn skybox(ray:Ray) -> vec3<f32>{
    let t = ray.direction.y;
    return t * vec3(0.67, 0.84, 0.97) + (1.0 - t) * vec3(0.57, 0.63, 0.70);
}

@fragment
fn main(
    @location(0) fragUV: vec2<f32>,
    @location(1) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
    var uv = fragUV * 2.0 - 1.0;
    let uv0 = uv;
    let time = 2.0 * abc[4][0];
    var finalColor = vec3<f32>(0.0);

    let camera = create_camera(vec3(0.0, 0.0, -5.0), vec3(0.0, 0.0, 0.0), 90.0);

    let spheres:array<Sphere, 3> = array<Sphere, 3>(
        Sphere(vec3(0.0, 0.0, 0.0), 1.0, u32(0)),
        Sphere(vec3(0.0, 3.0, 0.0), 1.0, u32(1)),
        Sphere(vec3(0.0, 3.0, 15.0), 10.0, u32(2)),
    );

    let ray = Ray(camera.position, normalize(camera.forward + uv.x * camera.right + uv.y * camera.up));

    return vec4(cast_raytracing(spheres, 3u, ray), 0.0);
}