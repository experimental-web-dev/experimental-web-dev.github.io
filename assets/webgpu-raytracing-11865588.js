import{t as g,f as F,c as x,s as ne,n as Z,a as H,b as v,r as E,d as Y,e as O,h as ae,i as ie,j as B,m as U,k as oe}from"./math-56068315.js";const se=`struct VertexOutput {\r
    @builtin(position) Position : vec4<f32>,\r
    @location(0) fragUV : vec2<f32>,\r
    @location(1) fragPosition: vec4<f32>\r
};\r
\r
@vertex\r
fn main(\r
    @location(0) position : vec4<f32>,\r
    @location(1) uv : vec2<f32>\r
) -> VertexOutput {\r
    var output : VertexOutput;\r
    output.Position = position;\r
    output.fragUV = uv;\r
    output.fragPosition = position;\r
    \r
    return output;\r
}\r
`,ce=`@group(0) @binding(0) var<uniform> info : vec4<f32>;\r
@group(0) @binding(1) var<uniform> u_info : array<vec4<u32>,2>;\r
@group(0) @binding(2) var<uniform> sky_gradient : array<vec4<f32>, 2>;\r
@group(0) @binding(3) var<uniform> spheres_array : array<Sphere, 100>;\r
@group(0) @binding(4) var<uniform> materials_array : array<Material, 100>;\r
@group(0) @binding(5) var<uniform> lights_array : array<Light, 100>;\r
@group(0) @binding(6) var<uniform> camera_setup : Camera;\r
\r
@group(1) @binding(0) var my_sampler: sampler;\r
@group(1) @binding(1) var last_frame: texture_2d<f32>;\r
\r
fn palette(t:f32) -> vec3<f32>{\r
    let a = vec3<f32>(0.5, 0.5, 0.5);\r
    let b = vec3<f32>(0.5, 0.5, 0.5);\r
    let c = vec3<f32>(1.0, 1.0, 1.0);\r
    let d = vec3<f32>(0.00, 0.10, 0.20);\r
    \r
    return a + b * cos( 6.28318*(c*t+d) );\r
}\r
\r
struct Sphere{\r
    position:vec3<f32>,\r
    radius:f32,\r
    obj_id:f32,\r
}\r
\r
struct Material{\r
    albedo:vec3<f32>,\r
    diffuse:f32,\r
    emission:vec3<f32>,\r
    specular:f32,\r
    specular_exp:f32,\r
    shininess:f32,\r
    refraction:f32,\r
    refractive_index:f32,\r
    reflection:f32,\r
    fuzz:f32,\r
}\r
\r
struct Camera{\r
    position:vec3<f32>,\r
    look_target:vec3<f32>,\r
    up:vec3<f32>,\r
    forward:vec3<f32>,\r
    right:vec3<f32>,\r
    fov:f32\r
}\r
\r
struct Light{\r
    position:vec3<f32>,\r
    radius:f32,\r
    color:vec3<f32>,\r
    intensity:f32,\r
    fallout:vec2<f32>,\r
}\r
\r
struct Ray{\r
    origin:vec3<f32>,\r
    direction:vec3<f32>,\r
}\r
\r
struct HitData{\r
    point:vec3<f32>,\r
    norm:vec3<f32>,\r
    effective_norm:vec3<f32>,\r
    inside:bool,\r
    distance:f32,\r
    obj_id:u32\r
}\r
\r
struct Hit{\r
    did_hit:bool,\r
    hit_data:HitData,\r
}\r
\r
fn create_camera(position:vec3<f32>, look_target:vec3<f32>, fov:f32) -> Camera{\r
    var camera:Camera;\r
    camera.position = position;\r
    camera.look_target = look_target;\r
    camera.fov = fov;\r
\r
    camera.forward = normalize(look_target - position);\r
    camera.up = normalize(vec3(0.0, 1.0, 0.0) - dot(vec3(0.0, 1.0, 0.0), camera.forward) * camera.forward);\r
    camera.right = cross(camera.up, camera.forward);\r
\r
    return camera;\r
}\r
\r
fn intersect_sphere(id:u32, ray:Ray) -> Hit {\r
    var hit:Hit;\r
    hit.did_hit = false;\r
    let sphere = spheres_array[id];\r
\r
    let origin_to_center = sphere.position - ray.origin;\r
    let proj_length = dot(origin_to_center, ray.direction);\r
\r
    // Test if sphere is in the opposite direction of ray\r
    let square_distance_to_sphere_origin = dot(origin_to_center, origin_to_center);\r
    let square_radius = sphere.radius * sphere.radius;\r
    if proj_length <= 0.0 && square_radius < square_distance_to_sphere_origin{\r
        return hit;//nothing\r
    }\r
\r
    let center_to_direction = origin_to_center - proj_length * ray.direction;\r
    let square_distance = dot(center_to_direction, center_to_direction);\r
\r
    // Distance from the ray to the center of the sphere greater than radius\r
    if square_distance > square_radius{\r
        return hit;//nothing\r
    }\r
\r
    let displacement = sqrt(square_radius - square_distance);\r
\r
    // Distance from camera\r
    var distance:f32;\r
    var inside:bool;\r
\r
    // Finding if we are inside or outside the sphere and choosing adequate point\r
    if proj_length > displacement{\r
        inside = false;\r
        distance = proj_length - displacement;\r
    } else {\r
        inside = true;\r
        distance = proj_length + displacement;\r
    }\r
\r
    //Distance from camera and surface norm\r
    let point = ray.origin + distance * ray.direction;\r
    let norm = normalize(point - sphere.position);\r
    var effective_norm = norm;\r
    if (inside) {effective_norm = -1.0 * norm;}\r
\r
    hit.did_hit = true;\r
    hit.hit_data.point = point;\r
    hit.hit_data.norm = norm;\r
    hit.hit_data.effective_norm = effective_norm;\r
    hit.hit_data.inside = inside;\r
    hit.hit_data.distance = distance;\r
    hit.hit_data.obj_id = id;\r
    return hit;\r
}\r
\r
fn ray_cast(sphere_count:u32, ray:Ray) -> Hit{\r
    var hit:Hit;\r
    hit.did_hit = false;\r
    var closest_distance:f32 = 10000.0;\r
\r
    for (var i = 0u; i < sphere_count; i = i + 1u){\r
        let current_hit = intersect_sphere(i, ray);\r
        if current_hit.did_hit && current_hit.hit_data.distance < closest_distance{\r
            hit = current_hit;\r
            closest_distance = hit.hit_data.distance;\r
        }\r
    }\r
    return hit;\r
}\r
\r
//fn cast_raytracing(sphere_count:u32, light_count:u32, ray:Ray) -> vec3<f32>{\r
//    let hit = ray_cast(sphere_count, ray);\r
//\r
//    if hit.did_hit {\r
//        return compute_direct_illumination(sphere_count, light_count, ray.direction, hit.hit_data);\r
//    } else {\r
//        return skybox(ray);\r
//    }\r
//}\r
\r
struct RayStack{\r
    ray:Ray,\r
    color:vec3<f32>,\r
    hit_data:HitData,\r
}\r
\r
const DISPLACEMENT_DISTANCE = 0.001;\r
\r
fn min_element_wise(vector:vec3<f32>, m:f32) -> vec3<f32>{\r
    return vec3<f32>(\r
        min(vector.x, m),\r
        min(vector.y, m),\r
        min(vector.z, m),\r
    );\r
}\r
\r
fn stack_raytracing(sphere_count:u32, light_count:u32, ray:Ray, ray_seed:u32) -> vec3<f32>{\r
    const stack_size = 10u;\r
    var stack:array<RayStack, stack_size>;\r
    var stack_pointer = 0u;\r
\r
    stack[stack_pointer].ray = ray;\r
    stack[stack_pointer].color = vec3(0.0, 0.0, 0.0);\r
\r
    var seed = ray_seed;\r
\r
    // Start Stack Loop\r
    loop {\r
        let hit = ray_cast(sphere_count, stack[stack_pointer].ray);\r
\r
        if (hit.did_hit) {\r
            stack[stack_pointer].hit_data = hit.hit_data;\r
            if (materials_array[hit.hit_data.obj_id].diffuse > 0.9){\r
                stack[stack_pointer].color += compute_direct_illumination(sphere_count, light_count, stack[stack_pointer].ray.direction, hit.hit_data);\r
            }\r
            //let light = lights_array[0];\r
            \r
            stack[stack_pointer].color += materials_array[hit.hit_data.obj_id].emission;\r
            if (stack_pointer + 1u >= stack_size) {break;}\r
\r
            var out_ray:Ray;\r
\r
            let scatter = scatter(ray, hit.hit_data, materials_array[hit.hit_data.obj_id], seed);\r
            seed = scatter.seed;\r
            // Direction is returned by scatter, using reflection for now\r
            if (!scatter.did_scatter){\r
                break;\r
            }\r
\r
            out_ray.direction = scatter.direction;\r
\r
            if (dot(hit.hit_data.effective_norm, out_ray.direction) >= 0.0) {\r
                out_ray.origin = hit.hit_data.point + DISPLACEMENT_DISTANCE * hit.hit_data.effective_norm;\r
            } else {\r
                out_ray.origin = hit.hit_data.point - DISPLACEMENT_DISTANCE * hit.hit_data.effective_norm;\r
            }\r
            //tests\r
            //stack[stack_pointer].color += 0.5 * (dot(hit.hit_data.effective_norm, out_ray.direction) + 1.0);\r
            //stack[stack_pointer].color += 0.5 * (dot(stack[stack_pointer].ray.direction, out_ray.direction));\r
            //stack[stack_pointer].color += hit.hit_data.effective_norm;\r
            \r
            \r
            // "Recursive call" is made with continue\r
            stack[stack_pointer + 1u].ray = out_ray;\r
            stack[stack_pointer + 1u].color = vec3(0.0, 0.0, 0.0);\r
            stack_pointer = stack_pointer + 1u;\r
        } else {\r
            stack[stack_pointer].color = skybox(stack[stack_pointer].ray);\r
            break;\r
        }\r
    }\r
    // End Stack Loop\r
\r
    for (var i = i32(stack_pointer) - 1; i >= 0; i = i - 1){\r
        let index = u32(i);\r
        let indirect_illumination = stack[index+1u].color;\r
        let material = materials_array[stack[index].hit_data.obj_id];\r
\r
        var effective_norm = stack[index].hit_data.effective_norm;\r
\r
        let specular = light_specular(material, stack[index + 1u].ray.direction,\r
             effective_norm, stack[index].ray.direction);\r
\r
        var attenuation = vec3(1.0, 1.0, 1.0);\r
        if (material.diffuse > 0.1) {\r
            attenuation = material.albedo;\r
        }\r
\r
        stack[index].color +=  indirect_illumination * (specular + attenuation);\r
    }\r
\r
    // Reduce colors\r
\r
    return stack[0u].color;\r
}\r
\r
fn compute_direct_illumination(sphere_count:u32, light_count:u32, dir_in:vec3<f32>, hit_data:HitData) -> vec3<f32>{\r
    var color = vec3(0.0, 0.0, 0.0);\r
    let material = materials_array[hit_data.obj_id];\r
\r
    let displacement_point = hit_data.point + DISPLACEMENT_DISTANCE * hit_data.effective_norm;\r
\r
    for (var i = 0u; i < light_count; i = i + 1u) {\r
        if (lights_array[i].intensity < 0.01) {\r
            continue;\r
        }\r
        var light_dir = lights_array[i].position - hit_data.point;\r
        let light_distance = length(light_dir);\r
        // Normalize\r
        light_dir = light_dir / light_distance;\r
\r
        // Cos between norm and light\r
        let cos = dot(hit_data.norm, light_dir);\r
\r
        let ray = Ray(displacement_point, light_dir);\r
        let intersection = ray_cast(sphere_count, ray);\r
\r
        if (intersection.did_hit && intersection.hit_data.distance < light_distance){\r
            // Light obstructed, jump for next light\r
            continue;\r
        }\r
\r
        // Light can be seen\r
        let light_color = light_attenuation(lights_array[i], light_distance); // Replace for light attenuation\r
        let specular = light_specular(material, light_dir, hit_data.norm, dir_in);\r
        color = color + cos * light_color * material.albedo + light_color * specular;\r
    }\r
\r
    return color;\r
}\r
\r
struct Scatter{\r
    did_scatter:bool,\r
    direction:vec3<f32>,\r
    seed:u32,\r
}\r
\r
fn scatter(ray:Ray, hit_data:HitData, material:Material, seed:u32) -> Scatter{\r
    if (material.diffuse > 0.9) {\r
        return scatter_diffuse(ray.direction, hit_data, seed);\r
    }\r
\r
    if (material.refraction > 0.9) {\r
        return scatter_glass(ray.direction, hit_data, material.refractive_index, seed);\r
    }\r
    \r
    return scatter_metal(ray.direction, hit_data, material.fuzz, seed);\r
}\r
\r
fn scatter_diffuse(dir_in:vec3<f32>, hit_data:HitData, seed:u32) -> Scatter{\r
    var scatter:Scatter;\r
    let v = random_in_unit_vector(seed);\r
    scatter.direction = normalize(hit_data.effective_norm + v.value); //Lambertian\r
    scatter.seed = v.seed;\r
    scatter.did_scatter = true;\r
    return scatter;\r
}\r
\r
fn scatter_metal(dir_in:vec3<f32>, hit_data:HitData, fuzz:f32, seed:u32) -> Scatter{\r
    var scatter:Scatter;\r
    scatter.did_scatter = false;\r
\r
    let reflected = reflect(dir_in, hit_data.effective_norm);\r
    let v = random_in_unit_sphere(seed);\r
    let dir = reflected + (fuzz * v.value);\r
\r
    if dot(dir, hit_data.effective_norm) > 0.0 {\r
        scatter.direction = normalize(dir);\r
        scatter.did_scatter = true;\r
    }\r
\r
    scatter.seed = v.seed;\r
    return scatter;\r
}\r
\r
fn scatter_glass(dir_in:vec3<f32>, hit_data:HitData, refraction:f32, seed:u32) -> Scatter{\r
    var scatter:Scatter;\r
    scatter.did_scatter = true;\r
    scatter.seed = seed;\r
\r
    let norm = hit_data.effective_norm;\r
    let dir = dir_in;\r
\r
    var r:f32;\r
    var sign:f32;\r
    if hit_data.inside{\r
            r = refraction; //inside should have refraction/1.0\r
            sign = -1.0;\r
            //scatter.direction = dir_in;\r
            //return scatter;\r
            \r
    }else{\r
            r = 1.0/refraction;\r
            sign = 1.0;\r
            //catter.direction = dir_in;\r
            //return scatter;\r
    }\r
\r
    // Refract\r
    let cos_theta = abs(dot(dir, norm));\r
    let sin_theta_square = 1.0 - cos_theta * cos_theta;\r
    let sin_theta = sqrt(clamp(sin_theta_square, 0.001, 0.999));\r
    let sin_theta_2 = r * sin_theta;\r
\r
    let rand01 = rand01_f32(seed);\r
    scatter.seed = rand01.seed;\r
\r
    if (sin_theta_2 > 1.0) || (reflectance(cos_theta, r) > rand01.value) {\r
        //Impossible to cannot refract or reflectance chance is greater\r
        scatter.direction = reflect(dir, norm);\r
        return scatter;\r
    }\r
\r
    //let out_perpendicular = r * (dir + abs(cos_theta) * norm);\r
    //let out_parallel = -sqrt(1.0 - dot(out_perpendicular, out_perpendicular)) * norm;//-cos_theta_2 * norm;\r
    \r
    let cos_theta_2_square = 1.0 - sin_theta_2 * sin_theta_2;\r
    let cos_theta_2 = sqrt(clamp(cos_theta_2_square, 0.001, 0.999));\r
    let out_perpendicular = sin_theta_2 * normalize(dir_in + abs(cos_theta) * norm);\r
    let out_parallel = -cos_theta_2 * norm;\r
    \r
    scatter.direction = normalize(out_parallel + sign * out_perpendicular);\r
    //scatter.direction = normalize(out_parallel + out_perpendicular);\r
\r
    return scatter;\r
}\r
\r
fn reflectance(cos:f32, refraction_relation:f32) -> f32 {\r
    var r0 = (1.0 - refraction_relation) / (1.0 + refraction_relation);\r
    r0 = r0 * r0;\r
    return r0 + (1.0 - r0) * pow(1.0 - cos, 5.0);\r
}\r
\r
fn light_attenuation(light:Light, distance:f32) -> vec3<f32>{\r
    return light.intensity / (1.0 + light.fallout.x * distance + light.fallout. y * distance * distance) * light.color;\r
}\r
\r
fn light_specular(material:Material, light_dir:vec3<f32>, norm:vec3<f32>, vision_dir:vec3<f32>) -> f32{\r
    let vision_reflected = reflect(vision_dir, norm);\r
    var specular_attenuation = dot(light_dir, vision_reflected);\r
\r
    if specular_attenuation <= 0.0{\r
        return 0.0;\r
    }\r
\r
    let shininess = 1.0 - material.shininess;\r
    let specular = material.specular_exp / 100.0;\r
    specular_attenuation = \r
        shininess * pow(specular_attenuation, material.shininess) \r
        + specular * pow(specular_attenuation, material.specular_exp);\r
    return material.specular * specular_attenuation;\r
}\r
\r
fn skybox(ray:Ray) -> vec3<f32>{\r
    let t = ray.direction.y;\r
    //return t * vec3(0.67, 0.84, 0.97) + (1.0 - t) * vec3(0.57, 0.63, 0.70);\r
    return t * sky_gradient[0].xyz + (1.0 - t) * sky_gradient[1].xyz;\r
}\r
\r
fn random(seed:u32) -> u32{\r
    return 1664525u * seed + 1013904223u;\r
    //return PCG_Hash(seed);\r
}\r
\r
fn PCG_Hash(seed:u32) -> u32 {\r
    let state = seed * 747796405u + 2891336453u;\r
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;\r
    return (word>>22u) ^ word;\r
}\r
\r
struct FloatRandomSeed{\r
    value:f32,\r
    seed:u32,\r
}\r
\r
struct Vec3RandomSeed{\r
    value:vec3<f32>,\r
    seed:u32,\r
}\r
\r
fn rand01_f32(seed:u32) -> FloatRandomSeed{\r
    var random = FloatRandomSeed(f32(seed)/f32(4294967295u), random(seed));\r
    random.value = random.value;\r
    return random;\r
}\r
\r
fn rand_f32(seed:u32) -> FloatRandomSeed{\r
    var random = FloatRandomSeed(f32(seed)/f32(4294967295u), random(seed));\r
    random.value = random.value * 2.0 - 1.0;\r
    return random;\r
}\r
\r
fn random_in_unit_sphere(seed:u32) -> Vec3RandomSeed {\r
    var s = seed;\r
    loop{\r
        let x = rand_f32(s);\r
        let y = rand_f32(x.seed);\r
        let z = rand_f32(y.seed);\r
        let p = vec3(x.value, y.value, z.value);\r
        if dot(p, p) < 1.0 { //square norm less one, means norm is less than one\r
            return Vec3RandomSeed(p, z.seed);\r
        }\r
        s = z.seed;\r
    }\r
}\r
\r
fn random_in_hemisphere(norm:vec3<f32>, seed:u32) -> Vec3RandomSeed {\r
    var v = random_in_unit_sphere(seed);\r
    if dot(v.value, norm) < 0.0 {\r
        v.value = -v.value;\r
    }\r
    return v;\r
}\r
\r
fn random_in_unit_vector(seed:u32) -> Vec3RandomSeed {\r
    var v = random_in_unit_sphere(seed);\r
    v.value = normalize(v.value);\r
    return v;\r
}\r
\r
fn make_seed(x:f32, y:f32) -> u32 {\r
    let v = normalize(vec3(x, y, 1.0));\r
    let helper_seed = u32(abs(10100.1 * v.x + 908721.0 * v.y + 12735758.0 * v.z));\r
    var seed = u_info[0][2] * 137u + helper_seed;\r
    seed = random(seed);\r
    seed = random(seed);\r
    return random(seed);\r
}\r
\r
fn raytracing(camera:Camera, uv:vec2<f32>, width:f32, height:f32, obj_count:u32, light_count:u32, rays_per_pixel:u32) -> vec3<f32>{\r
    // Many possible otimizations here, not the time yet\r
    let fov = tan(camera.fov / 180.0 * 3.1514 / 2.0);\r
    var x = fov * uv.x * (width / 2.0) / width;\r
    var y = fov * uv.y * (height / 2.0) / width;\r
    let pixel_width = 0.5 / width;\r
    let pixel_height = 0.5 / height;\r
\r
    var rand = rand_f32(make_seed(x, y));\r
    let pixel_x_offset = pixel_width * rand.value;\r
    rand = rand_f32(rand.seed);\r
    let pixel_y_offset = pixel_height * rand.value;\r
\r
    x = x + pixel_x_offset;\r
    y = y + pixel_y_offset;\r
\r
    //return vec3(rand.value); // if you want to visualize the seeds result\r
\r
    let ray = Ray(camera.position, normalize(camera.forward + x * camera.right + y * camera.up));\r
\r
    var seed = rand.seed;\r
    var color = vec3<f32>(0.0, 0.0, 0.0);\r
    for (var i = 0u; i < rays_per_pixel; i = i + 1u) {\r
        let ray = Ray(camera.position, normalize(camera.forward + x * camera.right + y * camera.up));\r
        color += stack_raytracing(obj_count, light_count, ray, seed);\r
        seed = random(seed);\r
    }\r
\r
    return color / f32(rays_per_pixel);\r
}\r
\r
@fragment\r
fn main(\r
    @location(0) fragUV: vec2<f32>,\r
    @location(1) fragPosition: vec4<f32>\r
) -> @location(0) vec4<f32> {\r
    var uv = fragUV * 2.0 - 1.0;\r
    let uv0 = uv;\r
    let time = 1.0 * info[0];\r
    let aspect_ratio = info[1];\r
    let width = info[2];\r
    let height = info[3];\r
    \r
    let camera_distance = camera_setup.position.z;\r
    let camera_position = camera_setup.position;\r
    //let camera_position = vec3(camera_distance * sin(time), camera_setup.position.y, camera_distance * cos(time));\r
\r
    let camera = create_camera(camera_position, camera_setup.look_target, camera_setup.fov);\r
\r
    let obj_count = u_info[0][0];\r
    let light_count = u_info[0][1];\r
\r
    let rays_per_pixel = u_info[1][0];\r
    let color = raytracing(camera, uv, width, height, obj_count, light_count, rays_per_pixel);\r
    \r
    // Calculate accumulator color\r
    let frame_count = u_info[0][3];\r
\r
    let texture_uv = vec2(fragUV.x, 1.0 - fragUV.y);\r
    let frame_dimensions = textureDimensions(last_frame);\r
\r
    let last_pixel = textureSampleLevel(\r
        last_frame,\r
        my_sampler,\r
        texture_uv,\r
        0.0\r
      ).rgb;\r
\r
    let frame_value = 1.0 / (1.0 + f32(frame_count));\r
    let last_frame_value = 1.0 - frame_value;\r
\r
    let final_color = last_frame_value * last_pixel + frame_value * color;\r
\r
    return vec4(final_color, 1.0);\r
}`,j=new Float32Array([1,1,0,1,1,-1,1,0,0,1,-1,-1,0,0,0,-1,-1,0,0,0,1,-1,0,1,0,1,1,0,1,1]),ue=6;let le={skyGradient_1:{r:0,g:0,b:0},skyGradient_2:{r:0,g:0,b:0},camera:{position:{x:0,y:3,z:-5},lookAtTarget:{x:0,y:0,z:0},up:{x:0,y:1,z:0},forward:{x:0,y:0,z:1},right:{x:1,y:0,z:0},fov:120,moveCamera:J},lights:[{position:{x:0,y:10,z:0},radius:.1,color:{r:1,g:1,b:1},intensity:0,fallout:{c1:.1,c2:.01}}],spheres:[{position:{x:-1,y:1,z:0},radius:1,obj_id:0},{position:{x:1,y:1,z:0},radius:1,obj_id:1},{position:{x:0,y:-1e3,z:0},radius:1e3,obj_id:2}],materials:[{albedo:{r:.9,g:.9,b:.9},diffuse:1,emission:{r:0,g:0,b:0},specular:0,specularExp:100,shininess:.1,refraction:1,refractiveIndex:2,reflection:1,fuzz:.5},{albedo:{r:0,g:0,b:0},diffuse:1,emission:{r:1,g:1,b:0},specular:0,specularExp:1,shininess:1,refraction:0,refractiveIndex:0,reflection:0,fuzz:0},{albedo:{r:.9,g:.9,b:.9},diffuse:1,emission:{r:0,g:0,b:0},specular:0,specularExp:1,shininess:1,refraction:0,refractiveIndex:0,reflection:0,fuzz:0}]},de={skyGradient_1:{r:.67,g:.84,b:.97},skyGradient_2:{r:.57,g:.63,b:.7},camera:{position:{x:0,y:1.1,z:-5},lookAtTarget:{x:0,y:0,z:0},up:{x:0,y:1,z:0},forward:{x:0,y:0,z:1},right:{x:1,y:0,z:0},fov:120},lights:[{position:{x:0,y:10,z:0},radius:.1,color:{r:1,g:1,b:1},intensity:0,fallout:{c1:.1,c2:.01}},{position:{x:0,y:-5,z:0},radius:.1,color:{r:1,g:1,b:1},intensity:0,fallout:{c1:0,c2:0}}],spheres:[{position:{x:-1.1,y:1.05,z:0},radius:1,obj_id:0},{position:{x:1,y:1.05,z:0},radius:1,obj_id:1},{position:{x:0,y:-1e3,z:0},radius:1e3,obj_id:2}],materials:[{albedo:{r:.9,g:.9,b:.9},diffuse:0,emission:{r:0,g:0,b:0},specular:0,specularExp:100,shininess:.1,refraction:1,refractiveIndex:2.1,reflection:1,fuzz:.5},{albedo:{r:0,g:0,b:0},diffuse:1,emission:{r:1,g:1,b:0},specular:0,specularExp:1,shininess:1,refraction:0,refractiveIndex:0,reflection:0,fuzz:0},{albedo:{r:.9,g:.9,b:.9},diffuse:1,emission:{r:0,g:0,b:0},specular:0,specularExp:1,shininess:1,refraction:0,refractiveIndex:0,reflection:0,fuzz:0}]};function C(){const r=t.camera,e=g(r.position),n=g(r.lookAtTarget),o=F(0,1,0),u=x(),a=x();ne(u,n,e),Z(u,u),H(a,o,u),H(o,u,a),r.up=v(o),r.forward=v(u),r.right=v(a)}function fe(){t.camera.lookAtTarget={x:0,y:0,z:0},t.camera.position={x:0,y:1,z:-5},C()}function J(r){const e=t.camera;let n=g(e.position),o=g(e.lookAtTarget);const u=g(e.forward),a=g(e.right);if(B(n,n,a,r.x),B(n,n,u,r.y),B(o,o,a,r.x),B(o,o,u,r.y),n[1]<.5){const l=.5-n[1];n[1]+=l,o[1]+=l}t.camera.position=v(n),t.camera.lookAtTarget=v(o)}function me(r){const e=t.camera,n=x(),o=g(e.forward);E(o,o,n,Y(r.y));const u=g(e.position);let a=x();O(a,u,o),e.lookAtTarget=v(a),C();const l=F(o[0],0,o[2]);Z(l,l);let m=ae(l,F(0,0,1));const _=x();E(_,l,n,m),_[2]<.999&&(m=-m,E(_,l,n,m));const s=x();E(s,o,n,m),ie(s,s,n,Y(r.x)),E(s,s,n,-m),!(Math.abs(s[1])>.8)&&(O(a,u,s),e.lookAtTarget=v(a),C())}let t=de;t=le;const X=32,K=16*4,W=12*4,_e=()=>new Float32Array([t.skyGradient_1.r,t.skyGradient_1.g,t.skyGradient_1.b,1,t.skyGradient_2.r,t.skyGradient_2.g,t.skyGradient_1.b,1]),pe=()=>new Float32Array([t.camera.position.x,t.camera.position.y,t.camera.position.z,0,t.camera.lookAtTarget.x,t.camera.lookAtTarget.y,t.camera.lookAtTarget.z,0,t.camera.up.x,t.camera.up.y,t.camera.up.z,0,t.camera.forward.x,t.camera.forward.y,t.camera.forward.z,0,t.camera.right.x,t.camera.right.y,t.camera.right.z,t.camera.fov]),he=r=>new Float32Array([t.spheres[r].position.x,t.spheres[r].position.y,t.spheres[r].position.z,t.spheres[r].radius,r]),ge=()=>{let r=new Float32Array(t.spheres.length*X/4);for(let e=0;e<t.spheres.length;e++)r.set(he(e),e*X/4);return r},ye=r=>{let e=t.materials[r];return new Float32Array([e.albedo.r,e.albedo.g,e.albedo.b,e.diffuse,e.emission.r,e.emission.g,e.emission.b,e.specular,e.specularExp,e.shininess,e.refraction,e.refractiveIndex,e.reflection,e.fuzz,0,0])},ve=()=>{let r=new Float32Array(t.materials.length*K/4);for(let e=0;e<t.materials.length;e++)r.set(ye(e),e*K/4);return r},xe=r=>{let e=t.lights[r];return new Float32Array([e.position.x,e.position.y,e.position.z,e.radius,e.color.r,e.color.g,e.color.b,e.intensity,e.fallout.c1,e.fallout.c2,0,0])},be=()=>{let r=new Float32Array(t.lights.length*W/4);for(let e=0;e<t.lights.length;e++)r.set(xe(e),e*W/4);return r};async function we(r){if(!navigator.gpu)throw new Error("Not Support WebGPU");const e=await navigator.gpu.requestAdapter();if(!e)throw new Error("No Adapter Found");const n=await e.requestDevice(),o=r.getContext("webgpu"),u=navigator.gpu.getPreferredCanvasFormat(),a=window.devicePixelRatio||1;r.width=r.clientWidth*a,r.height=r.clientHeight*a;const l={width:r.width,height:r.height};return o.configure({device:n,format:u,alphaMode:"opaque"}),{device:n,context:o,format:u,size:l}}async function ke(r,e,n){const o=await r.createRenderPipelineAsync({label:"Basic Pipline",layout:"auto",vertex:{module:r.createShaderModule({code:se}),entryPoint:"main",buffers:[{arrayStride:20,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x2"}]}]},fragment:{module:r.createShaderModule({code:ce}),entryPoint:"main",targets:[{format:e}]},primitive:{topology:"triangle-list",cullMode:"back",frontFace:"ccw"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}}),u=r.createTexture({size:n,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),a=u.createView(),l=r.createTexture({size:n,format:e,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),m=l.createView(),_=r.createBuffer({label:"GPUBuffer store vertex",size:j.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});r.queue.writeBuffer(_,0,j);const s=r.createBuffer({label:"Render info as hight/witdth and time",size:4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),c=r.createBuffer({label:"Render info as unsigned int",size:8*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),b=r.createBuffer({label:"Sky gradient",size:2*4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),S=r.createBuffer({label:"Spheres",size:3200,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),p=r.createBuffer({label:"Materials",size:6400,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),T=r.createBuffer({label:"Lights",size:4800,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),h=r.createBuffer({label:"Camera",size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),w=r.createBindGroup({label:"Uniform Group",layout:o.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:s}},{binding:1,resource:{buffer:c}},{binding:2,resource:{buffer:b}},{binding:3,resource:{buffer:S}},{binding:4,resource:{buffer:p}},{binding:5,resource:{buffer:T}},{binding:6,resource:{buffer:h}}]}),y=r.createSampler({magFilter:"linear",minFilter:"linear"}),k=r.createBindGroup({label:"Frame Group",layout:o.getBindGroupLayout(1),entries:[{binding:0,resource:y},{binding:1,resource:m}]});return{pipeline:o,vertexBuffer:_,infoBuffer:s,uInfoBuffer:c,skyGradientBuffer:b,spheresBuffer:S,materialsBuffer:p,lightsBuffer:T,cameraBuffer:h,uniformGroup:w,depthTexture:u,depthView:a,lastFrameTexture:l,lastFrameView:m,lastFrameGroup:k,sampler:y}}async function ze(r,e,n){const o=r.createCommandEncoder(),u={colorAttachments:[{view:e.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:n.depthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},a=o.beginRenderPass(u);a.setPipeline(n.pipeline),a.setVertexBuffer(0,n.vertexBuffer),a.setBindGroup(0,n.uniformGroup),a.setBindGroup(1,n.lastFrameGroup),a.draw(ue),a.end(),r.queue.submit([o.finish()]),r.queue.copyExternalImageToTexture({source:e.canvas},{texture:n.lastFrameTexture},[n.lastFrameTexture.width,n.lastFrameTexture.height])}async function Ee(){var G,R,L,A,I,q,D,M,V,N;const r=document.querySelector("canvas");if(!r)throw new Error("No Canvas");const{device:e,context:n,format:o,size:u}=await we(r),a=await ke(e,o,u);let l=u.width/u.height;const m=Date.now();let _=0;const s={frameAccumulator:!0,frameCount:0,raysPerPixel:1,frameRateSlowDown:2,slowCount:0},c={pressedKeys:new Set,cameraSpeed:3,fastCameraSpeed:9,direction:{x:0,y:0},mouse:{movementX:0,movementY:0,rotate:!1,previousX:0,previousY:0,sensibility:.15}};C();async function b(){const i=(Date.now()-_)/1e3;T(i),_=Date.now(),s.slowCount%s.frameRateSlowDown===0&&S(),s.slowCount++,requestAnimationFrame(b)}b();async function S(){const i=Date.now()-m,f=(Date.now()-m)/1e3,z=new Float32Array([f,l,u.width,u.height]),P=new Uint32Array([t.spheres.length,t.lights.length,Math.trunc(i),s.frameCount,s.raysPerPixel]);e.queue.writeBuffer(a.infoBuffer,0,z),e.queue.writeBuffer(a.uInfoBuffer,0,P),e.queue.writeBuffer(a.skyGradientBuffer,0,_e()),e.queue.writeBuffer(a.spheresBuffer,0,ge()),e.queue.writeBuffer(a.materialsBuffer,0,ve()),e.queue.writeBuffer(a.lightsBuffer,0,be()),e.queue.writeBuffer(a.cameraBuffer,0,pe()),(n.canvas.width!=a.lastFrameTexture.width||n.canvas.height!=a.lastFrameTexture.height)&&console.error(`Dimensions don't match ${n.canvas.width}, ${a.lastFrameTexture.width}`),ze(e,n,a),s.frameAccumulator?(s.frameCount+=1,s.frameCount>=600&&(s.frameCount=0)):s.frameCount=0}function p(i){return c.pressedKeys.has(i)}function T(i){c.direction.x=0,c.direction.y=0;let f=c.cameraSpeed;p("w")&&(c.direction.y+=1,s.frameCount=0),p("s")&&(c.direction.y-=1,s.frameCount=0),p("a")&&(c.direction.x-=1,s.frameCount=0),p("d")&&(c.direction.x+=1,s.frameCount=0),p("shift")&&(f=c.fastCameraSpeed),s.frameCount===0&&(c.direction=oe(c.direction),c.direction.x*=i*f,c.direction.y*=i*f,J(c.direction))}function h(i){return{r:+("0x"+i.slice(1,3))/255,g:+("0x"+i.slice(3,5))/255,b:+("0x"+i.slice(5,7))/255}}let w={id:1,color:()=>{const i=document.querySelector('.emission input[type="color"]').value;return h(i)},intensity:()=>+document.querySelector('.emission input[type="range"]').value,update:function(){let i=this.intensity(),f=this.color();t.materials[this.id].emission=U(i,f)}};w.update(),(G=document.querySelector('.emission input[type="color"]'))==null||G.addEventListener("input",()=>{w.update()}),(R=document.querySelector('.emission input[type="range"]'))==null||R.addEventListener("input",()=>{w.update()});let y={skyColor:document.getElementById("skybox-sky"),horizonColor:document.getElementById("skybox-horizon"),intensity:document.querySelector('.skybox input[type="range"]'),update:function(){let i=parseFloat(this.intensity.value),f=U(i,h(this.skyColor.value)),z=U(i,h(this.horizonColor.value));t.skyGradient_1=f,t.skyGradient_2=z}};y.update();let k={id:0,colorElement:document.querySelector('.light input[type="color"]'),intensityElement:document.querySelector('.light input[type="range"]'),update:function(){const i=parseFloat(this.intensityElement.value),f=h(this.colorElement.value);t.lights[this.id].color=f,t.lights[this.id].intensity=i}};k.update();let Q={id:0,typeElement:document.getElementById("material-type"),albedoElement:document.getElementById("albedo"),specularElement:document.getElementById("specular"),specularExpElement:document.getElementById("specular-exp"),shininessElement:document.getElementById("shininess"),metalFuzzElement:document.getElementById("metal-fuzz"),refractionIndexElement:document.getElementById("refraction-index"),upddate:function(){const i=this.typeElement.value,f=h(this.albedoElement.value),z=parseFloat(this.specularElement.value),P=parseFloat(this.specularExpElement.value),ee=parseFloat(this.shininessElement.value),re=parseFloat(this.metalFuzzElement.value),te=parseFloat(this.refractionIndexElement.value),d=t.materials[this.id];switch(i){case"Diffuse":{d.diffuse=1,d.refraction=0,d.reflection=0;break}case"Glass":{d.diffuse=0,d.refraction=1,d.reflection=0;break}case"Metal":{d.diffuse=0,d.refraction=0,d.reflection=1;break}}d.albedo=f,d.specular=z,d.specularExp=P,d.shininess=1/ee,d.fuzz=re,d.refractiveIndex=te}};document.querySelectorAll(".material-property").forEach(i=>{i.addEventListener("input",()=>{Q.upddate()})}),(L=document.getElementById("skybox-sky"))==null||L.addEventListener("input",()=>{y.update()}),(A=document.getElementById("skybox-horizon"))==null||A.addEventListener("input",()=>{y.update()}),(I=document.querySelector('.skybox input[type="range"]'))==null||I.addEventListener("input",()=>{y.update()}),(q=document.querySelector('.light input[type="color"]'))==null||q.addEventListener("input",()=>{k.update()}),(D=document.querySelector('.light input[type="range"]'))==null||D.addEventListener("input",()=>{k.update()}),(M=document.getElementById("accumulator"))==null||M.addEventListener("input",i=>{s.frameAccumulator=i.target.checked,s.frameCount=0}),(V=document.getElementById("fps-rate"))==null||V.addEventListener("input",i=>{s.frameRateSlowDown=parseFloat(i.target.value)}),(N=document.getElementById("rays-per-pixel"))==null||N.addEventListener("input",i=>{s.raysPerPixel=parseInt(i.target.value)}),window.addEventListener("keydown",i=>{c.pressedKeys.add(i.key.toLowerCase()),i.key.toLocaleLowerCase()=="r"&&(fe(),s.frameCount=0)}),window.addEventListener("keyup",i=>{c.pressedKeys.delete(i.key.toLowerCase())}),window.addEventListener("mousemove",i=>{if(c.mouse.movementX=i.offsetX-c.mouse.previousX,c.mouse.movementY=i.offsetY-c.mouse.previousY,c.mouse.previousX=i.offsetX,c.mouse.previousY=i.offsetY,c.mouse.rotate=i.buttons===1,c.mouse.rotate){if(Math.abs(c.mouse.movementX)>100||Math.abs(c.mouse.movementY)>100)return;me({x:-c.mouse.sensibility*c.mouse.movementY,y:-c.mouse.sensibility*c.mouse.movementX}),s.frameCount=0}}),window.addEventListener("resize",()=>{u.width=r.width=r.clientWidth*devicePixelRatio,u.height=r.height=r.clientHeight*devicePixelRatio,l=u.width/u.height,s.frameCount=0,a.depthTexture.destroy(),a.depthTexture=e.createTexture({size:u,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),a.depthView=a.depthTexture.createView(),a.lastFrameTexture.destroy(),a.lastFrameTexture=e.createTexture({size:u,format:o,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),a.lastFrameView=a.lastFrameTexture.createView(),a.lastFrameGroup=e.createBindGroup({label:"Frame Group",layout:a.pipeline.getBindGroupLayout(1),entries:[{binding:0,resource:a.sampler},{binding:1,resource:a.lastFrameView}]})})}Ee();function Se(){var e;const r=document.querySelector(".ui-main.hidden");r?r.classList.remove("hidden"):(e=document.querySelector(".ui-main"))==null||e.classList.add("hidden")}function $(r){const e=r.value,n=r.nextElementSibling;parseFloat(r.step)>=1?n.textContent=parseFloat(e).toFixed(0):n.textContent=parseFloat(e).toFixed(1)}function Te(){window.addEventListener("keydown",n=>{n.key.toLowerCase()=="h"&&Se()}),document.querySelectorAll('input[type="range"]').forEach(n=>{n.addEventListener("input",o=>{$(o.target)}),$(n)}),document.querySelectorAll("input").forEach(n=>{n.addEventListener("mousemove",o=>{o.stopPropagation()})}),document.querySelectorAll("select").forEach(n=>{n.addEventListener("mousemove",o=>{o.stopPropagation()})})}Te();
