@group(0) @binding(0) var<uniform> info : vec4<f32>;
@group(0) @binding(1) var<uniform> u_info : vec4<u32>;
@group(0) @binding(2) var<uniform> sky_gradient : array<vec4<f32>, 2>;
@group(0) @binding(3) var<uniform> spheres_array : array<Sphere, 100>;
@group(0) @binding(4) var<uniform> materials_array : array<Material, 100>;
@group(0) @binding(5) var<uniform> lights_array : array<Light, 100>;
@group(0) @binding(6) var<uniform> camera_setup : Camera;

@group(1) @binding(0) var my_sampler: sampler;
@group(1) @binding(1) var last_frame: texture_2d<f32>;

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
    diffuse:f32,
    emission:vec3<f32>,
    specular:f32,
    specular_exp:f32,
    shininess:f32,
    refraction:f32,
    refractive_index:f32,
    reflection:f32,
    fuzz:f32,
}

struct Camera{
    position:vec3<f32>,
    look_target:vec3<f32>,
    up:vec3<f32>,
    forward:vec3<f32>,
    right:vec3<f32>,
    fov:f32
}

struct Light{
    position:vec3<f32>,
    radius:f32,
    color:vec3<f32>,
    intensity:f32,
    fallout:vec2<f32>,
}

struct Ray{
    origin:vec3<f32>,
    direction:vec3<f32>,
}

struct HitData{
    point:vec3<f32>,
    norm:vec3<f32>,
    effective_norm:vec3<f32>,
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
    var effective_norm = norm;
    if (inside) {effective_norm = -1.0 * norm;}

    hit.did_hit = true;
    hit.hit_data.point = point;
    hit.hit_data.norm = norm;
    hit.hit_data.effective_norm = effective_norm;
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

//fn cast_raytracing(sphere_count:u32, light_count:u32, ray:Ray) -> vec3<f32>{
//    let hit = ray_cast(sphere_count, ray);
//
//    if hit.did_hit {
//        return compute_direct_illumination(sphere_count, light_count, ray.direction, hit.hit_data);
//    } else {
//        return skybox(ray);
//    }
//}

struct RayStack{
    ray:Ray,
    color:vec3<f32>,
    hit_data:HitData,
}

const DISPLACEMENT_DISTANCE = 0.001;

fn min_element_wise(vector:vec3<f32>, m:f32) -> vec3<f32>{
    return vec3<f32>(
        min(vector.x, m),
        min(vector.y, m),
        min(vector.z, m),
    );
}

fn stack_raytracing(sphere_count:u32, light_count:u32, ray:Ray) -> vec3<f32>{
    const stack_size = 10u;
    var stack:array<RayStack, stack_size>;
    var stack_pointer = 0u;

    stack[stack_pointer].ray = ray;
    stack[stack_pointer].color = vec3(0.0, 0.0, 0.0);

    let helper_seed = u32(abs(10000.0 * ray.direction.x + 908721.0 * ray.direction.y + 12735758.0 * ray.direction.z));
    var seed = u_info[2] + helper_seed;
    seed = random(seed);
    seed = random(seed);
    seed = random(seed);

    //return rand01_f32(seed).value * vec3<f32>(1.0, 1.0, 1.0) + 0.0;

    // Start Stack Loop
    loop {
        let hit = ray_cast(sphere_count, stack[stack_pointer].ray);

        if (hit.did_hit) {
            stack[stack_pointer].hit_data = hit.hit_data;
            if (materials_array[hit.hit_data.obj_id].diffuse > 0.9){
                stack[stack_pointer].color += compute_direct_illumination(sphere_count, light_count, stack[stack_pointer].ray.direction, hit.hit_data);
            }
            
            stack[stack_pointer].color += materials_array[hit.hit_data.obj_id].emission;
            if (stack_pointer + 1u >= stack_size) {break;}

            var out_ray:Ray;

            let scatter = scatter(ray, hit.hit_data, materials_array[hit.hit_data.obj_id], seed);
            seed = scatter.seed;
            // Direction is returned by scatter, using reflection for now
            if (!scatter.did_scatter){
                break;
            }

            out_ray.direction = scatter.direction;

            if (dot(hit.hit_data.effective_norm, out_ray.direction) >= 0.0) {
                out_ray.origin = hit.hit_data.point + DISPLACEMENT_DISTANCE * hit.hit_data.effective_norm;
            } else {
                out_ray.origin = hit.hit_data.point - DISPLACEMENT_DISTANCE * hit.hit_data.effective_norm;
            }
            
            // "Recursive call" is made with continue
            stack[stack_pointer + 1u].ray = out_ray;
            stack[stack_pointer + 1u].color = vec3(0.0, 0.0, 0.0);
            stack_pointer = stack_pointer + 1u;
        } else {
            stack[stack_pointer].color = skybox(stack[stack_pointer].ray);
            break;
        }
    }
    // End Stack Loop

    for (var i = i32(stack_pointer) - 1; i >= 0; i = i - 1){
        let index = u32(i);
        let indirect_illumination = stack[index+1u].color;
        let material = materials_array[stack[index].hit_data.obj_id];

        var effective_norm = stack[index].hit_data.effective_norm;

        let specular = light_specular(material, stack[index + 1u].ray.direction,
             effective_norm, stack[index].ray.direction);

        var attenuation = vec3(1.0, 1.0, 1.0);
        if (material.diffuse > 0.1) {
            attenuation = material.albedo;
        }

        stack[index].color +=  indirect_illumination * (specular + attenuation);
    }

    // Reduce colors

    return stack[0u].color;
}

fn compute_direct_illumination(sphere_count:u32, light_count:u32, dir_in:vec3<f32>, hit_data:HitData) -> vec3<f32>{
    var color = vec3(0.0, 0.0, 0.0);
    let material = materials_array[hit_data.obj_id];

    let displacement_point = hit_data.point + DISPLACEMENT_DISTANCE * hit_data.effective_norm;

    for (var i = 0u; i < light_count; i = i + 1u) {
        if (lights_array[i].intensity < 0.01) {
            continue;
        }
        var light_dir = lights_array[i].position - hit_data.point;
        let light_distance = length(light_dir);
        // Normalize
        light_dir = light_dir / light_distance;

        // Cos between norm and light
        let cos = dot(hit_data.norm, light_dir);

        let ray = Ray(displacement_point, light_dir);
        let intersection = ray_cast(sphere_count, ray);

        if (intersection.did_hit && intersection.hit_data.distance < light_distance){
            // Light obstructed, jump for next light
            continue;
        }

        // Light can be seen
        let light_color = light_attenuation(lights_array[i], light_distance); // Replace for light attenuation
        let specular = light_specular(material, light_dir, hit_data.norm, dir_in);
        color = color + cos * light_color * material.albedo + light_color * specular;
    }

    return color;
}

struct Scatter{
    did_scatter:bool,
    direction:vec3<f32>,
    seed:u32,
}

fn scatter(ray:Ray, hit_data:HitData, material:Material, seed:u32) -> Scatter{
    if (material.diffuse > 0.9) {
        return scatter_diffuse(ray.direction, hit_data, seed);
    }

    if (material.refraction > 0.9) {
        return scatter_glass(ray.direction, hit_data, material.refractive_index, seed);
    }
    
    return scatter_metal(ray.direction, hit_data, material.fuzz, seed);
}

fn scatter_diffuse(dir_in:vec3<f32>, hit_data:HitData, seed:u32) -> Scatter{
    var scatter:Scatter;
    let v = random_in_unit_vector(seed);
    scatter.direction = normalize(hit_data.effective_norm + v.value); //Lambertian
    scatter.seed = v.seed;
    scatter.did_scatter = true;
    return scatter;
}

fn scatter_metal(dir_in:vec3<f32>, hit_data:HitData, fuzz:f32, seed:u32) -> Scatter{
    var scatter:Scatter;
    scatter.did_scatter = false;

    let reflected = reflect(dir_in, hit_data.effective_norm);
    let v = random_in_unit_sphere(seed);
    let dir = reflected + (fuzz * v.value);

    if dot(dir, hit_data.effective_norm) > 0.0 {
        scatter.direction = normalize(dir);
        scatter.did_scatter = true;
    }

    scatter.seed = v.seed;
    return scatter;
}

fn scatter_glass(dir_in:vec3<f32>, hit_data:HitData, refraction:f32, seed:u32) -> Scatter{
    var scatter:Scatter;
    scatter.did_scatter = true;
    scatter.seed = seed;

    let norm = hit_data.effective_norm;
    let dir = dir_in;

    var r:f32;
    var sign:f32;
    if hit_data.inside{
            r = refraction;
            sign = -1.0;
            //scatter.direction = dir_in;
            //return scatter;
            
    }else{
            r = 1.0/refraction;
            sign = 1.0;
            //catter.direction = dir_in;
            //return scatter;
    }

    // Refract
    let cos_theta = abs(dot(dir, norm));
    let sin_theta = sqrt(1.0 - cos_theta * cos_theta);
    let sin_theta_2 = r * sin_theta;

    let rand01 = rand01_f32(seed);
    scatter.seed = rand01.seed;

    if (sin_theta_2 > 1.0) || (reflectance(cos_theta, r) > rand01.value) {
        //Impossible to cannot refract or reflectance chance is greater
        scatter.direction = reflect(dir, norm);
        return scatter;
    }

    //let out_perpendicular = r * (dir + abs(cos_theta) * norm);
    //let out_parallel = -sqrt(1.0 - dot(out_perpendicular, out_perpendicular)) * norm;//-cos_theta_2 * norm;

    let cos_theta_2 = sqrt(1.0 - sin_theta_2 * sin_theta_2);
    let out_perpendicular = sin_theta_2 * normalize(dir_in + abs(cos_theta) * norm);
    let out_parallel = -cos_theta_2 * norm;
    
    scatter.direction = normalize(out_parallel + sign * out_perpendicular);

    return scatter;
}

fn reflectance(cos:f32, refraction_relation:f32) -> f32 {
    var r0 = (1.0 - refraction_relation) / (1.0 + refraction_relation);
    r0 = r0 * r0;
    return r0 + (1.0 - r0) * pow(1.0 - cos, 5.0);
}

fn light_attenuation(light:Light, distance:f32) -> vec3<f32>{
    return light.intensity / (1.0 + light.fallout.x * distance + light.fallout. y * distance * distance) * light.color;
}

fn light_specular(material:Material, light_dir:vec3<f32>, norm:vec3<f32>, vision_dir:vec3<f32>) -> f32{
    let vision_reflected = reflect(vision_dir, norm);
    var specular_attenuation = dot(light_dir, vision_reflected);

    if specular_attenuation <= 0.0{
        return 0.0;
    }

    let shininess = 1.0 - material.shininess;
    let specular = material.specular_exp / 100.0;
    specular_attenuation = 
        shininess * pow(specular_attenuation, material.shininess) 
        + specular * pow(specular_attenuation, material.specular_exp);
    return material.specular * specular_attenuation;
}

fn skybox(ray:Ray) -> vec3<f32>{
    let t = ray.direction.y;
    //return t * vec3(0.67, 0.84, 0.97) + (1.0 - t) * vec3(0.57, 0.63, 0.70);
    return t * sky_gradient[0].xyz + (1.0 - t) * sky_gradient[1].xyz;
}

fn random(seed:u32) -> u32{
    return 1664525u * seed + 1013904223u;
}

struct FloatRandomSeed{
    value:f32,
    seed:u32,
}

struct Vec3RandomSeed{
    value:vec3<f32>,
    seed:u32,
}

fn rand01_f32(seed:u32) -> FloatRandomSeed{
    var random = FloatRandomSeed(f32(seed)/f32(4294967295u), random(seed));
    random.value = random.value;
    return random;
}

fn rand_f32(seed:u32) -> FloatRandomSeed{
    var random = FloatRandomSeed(f32(seed)/f32(4294967295u), random(seed));
    random.value = random.value * 2.0 - 1.0;
    return random;
}

fn random_in_unit_sphere(seed:u32) -> Vec3RandomSeed {
    var s = seed;
    loop{
        let x = rand_f32(s);
        let y = rand_f32(x.seed);
        let z = rand_f32(y.seed);
        let p = vec3(x.value, y.value, z.value);
        if dot(p, p) < 1.0 { //square norm less one, means norm is less than one
            return Vec3RandomSeed(p, z.seed);
        }
        s = z.seed;
    }
}

fn random_in_hemisphere(norm:vec3<f32>, seed:u32) -> Vec3RandomSeed {
    var v = random_in_unit_sphere(seed);
    if dot(v.value, norm) < 0.0 {
        v.value = -v.value;
    }
    return v;
}

fn random_in_unit_vector(seed:u32) -> Vec3RandomSeed {
    var v = random_in_unit_sphere(seed);
    v.value = normalize(v.value);
    return v;
}

fn raytracing(camera:Camera, uv:vec2<f32>, width:f32, height:f32, obj_count:u32, light_count:u32, rays_per_pixel:u32) -> vec3<f32>{
    // Many possible otimizations here, not the time yet
    let fov = tan(camera.fov / 180.0 * 3.1514 / 2.0);
    let x = fov * uv.x * (width / 2.0) / width;
    let y = fov * uv.y * (height / 2.0) / width;
    let ray = Ray(camera.position, normalize(camera.forward + x * camera.right + y * camera.up));

    var color = vec3<f32>(0.0, 0.0, 0.0);
    for (var i = 0u; i < rays_per_pixel; i = i + 1u) {
        let ray = Ray(camera.position, normalize(camera.forward + x * camera.right + y * camera.up));
        color += stack_raytracing(obj_count, light_count, ray);
    }

    return color / f32(rays_per_pixel);
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
    
    let camera_distance = camera_setup.position.z;
    let camera_position = camera_setup.position;
    //let camera_position = vec3(camera_distance * sin(time), camera_setup.position.y, camera_distance * cos(time));

    let camera = create_camera(camera_position, camera_setup.look_target, camera_setup.fov);

    let obj_count = u_info[0];
    let light_count = u_info[1];

    let color = raytracing(camera, uv, width, height, obj_count, light_count, 1u);
    
    // Calculate accumulator color
    let frame_count = u_info[3];

    let texture_uv = vec2(fragUV.x, 1.0 - fragUV.y);
    let frame_dimensions = textureDimensions(last_frame);

    let last_pixel = textureSampleLevel(
        last_frame,
        my_sampler,
        texture_uv,
        0.0
      ).rgb;

    let frame_value = 1.0 / (1.0 + f32(frame_count));
    let last_frame_value = 1.0 - frame_value;

    let final_color = last_frame_value * last_pixel + frame_value * color;

    return vec4(final_color, 1.0);
}