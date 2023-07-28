import"./modulepreload-polyfill-3cfb730f.js";const k=`struct VertexOutput {\r
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
`,T=`@group(0) @binding(0) var<uniform> info : vec4<f32>;\r
@group(0) @binding(1) var<uniform> u_info : vec4<u32>;\r
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
            r = refraction;\r
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
    let sin_theta = sqrt(1.0 - cos_theta * cos_theta);\r
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
    let cos_theta_2 = sqrt(1.0 - sin_theta_2 * sin_theta_2);\r
    let out_perpendicular = sin_theta_2 * normalize(dir_in + abs(cos_theta) * norm);\r
    let out_parallel = -cos_theta_2 * norm;\r
    \r
    scatter.direction = normalize(out_parallel + sign * out_perpendicular);\r
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
    var seed = u_info[2] * 137u + helper_seed;\r
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
    let obj_count = u_info[0];\r
    let light_count = u_info[1];\r
\r
    let color = raytracing(camera, uv, width, height, obj_count, light_count, 1u);\r
    \r
    // Calculate accumulator color\r
    let frame_count = u_info[3];\r
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
}`,y=new Float32Array([1,1,0,1,1,-1,1,0,0,1,-1,-1,0,0,0,-1,-1,0,0,0,1,-1,0,1,0,1,1,0,1,1]),U=6;let B={skyGradient_1:{x:0,y:0,z:0},skyGradient_2:{x:0,y:0,z:0},camera:{position:{x:0,y:3,z:-5},lookAtTarget:{x:0,y:0,z:0},up:{x:0,y:1,z:0},forward:{x:0,y:0,z:1},right:{x:1,y:0,z:0},fov:120},lights:[{position:{x:0,y:10,z:0},radius:.1,color:{r:1,g:1,b:1},intensity:0,fallout:{c1:.1,c2:.01}}],spheres:[{position:{x:-1,y:1,z:0},radius:1,obj_id:0},{position:{x:1,y:1,z:0},radius:1,obj_id:1},{position:{x:0,y:-1e3,z:0},radius:1e3,obj_id:2}],materials:[{albedo:{r:.9,g:.9,b:.9},diffuse:1,emission:{r:0,g:0,b:0},specular:0,specular_exp:100,shininess:.1,refraction:1,refractive_index:2,reflection:1,fuzz:.5},{albedo:{r:0,g:0,b:0},diffuse:1,emission:{r:1,g:1,b:0},specular:0,specular_exp:1,shininess:1,refraction:0,refractive_index:0,reflection:0,fuzz:0},{albedo:{r:.9,g:.9,b:.9},diffuse:1,emission:{r:0,g:0,b:0},specular:0,specular_exp:1,shininess:1,refraction:0,refractive_index:0,reflection:0,fuzz:0}]},S={skyGradient_1:{x:.67,y:.84,z:.97},skyGradient_2:{x:.57,y:.63,z:.7},camera:{position:{x:0,y:1.1,z:-5},lookAtTarget:{x:0,y:0,z:0},up:{x:0,y:1,z:0},forward:{x:0,y:0,z:1},right:{x:1,y:0,z:0},fov:120},lights:[{position:{x:0,y:10,z:0},radius:.1,color:{r:1,g:1,b:1},intensity:0,fallout:{c1:.1,c2:.01}},{position:{x:0,y:-5,z:0},radius:.1,color:{r:1,g:1,b:1},intensity:0,fallout:{c1:0,c2:0}}],spheres:[{position:{x:-1.1,y:1.05,z:0},radius:1,obj_id:0},{position:{x:1,y:1.05,z:0},radius:1,obj_id:1},{position:{x:0,y:-1e3,z:0},radius:1e3,obj_id:2}],materials:[{albedo:{r:.9,g:.9,b:.9},diffuse:0,emission:{r:0,g:0,b:0},specular:0,specular_exp:100,shininess:.1,refraction:1,refractive_index:2.1,reflection:1,fuzz:.5},{albedo:{r:0,g:0,b:0},diffuse:1,emission:{r:1,g:1,b:0},specular:0,specular_exp:1,shininess:1,refraction:0,refractive_index:0,reflection:0,fuzz:0},{albedo:{r:.9,g:.9,b:.9},diffuse:1,emission:{r:0,g:0,b:0},specular:0,specular_exp:1,shininess:1,refraction:0,refractive_index:0,reflection:0,fuzz:0}]},t=S;t=B;const x=32,b=16*4,w=12*4,G=()=>new Float32Array([t.skyGradient_1.x,t.skyGradient_1.y,t.skyGradient_1.z,1,t.skyGradient_2.x,t.skyGradient_2.y,t.skyGradient_1.z,1]),P=()=>new Float32Array([t.camera.position.x,t.camera.position.y,t.camera.position.z,0,t.camera.lookAtTarget.x,t.camera.lookAtTarget.y,t.camera.lookAtTarget.z,0,t.camera.up.x,t.camera.up.y,t.camera.up.z,0,t.camera.forward.x,t.camera.forward.y,t.camera.forward.z,0,t.camera.right.x,t.camera.right.y,t.camera.right.z,t.camera.fov]),R=e=>new Float32Array([t.spheres[e].position.x,t.spheres[e].position.y,t.spheres[e].position.z,t.spheres[e].radius,e]),F=()=>{let e=new Float32Array(t.spheres.length*x/4);for(let r=0;r<t.spheres.length;r++)e.set(R(r),r*x/4);return e},D=e=>{let r=t.materials[e];return new Float32Array([r.albedo.r,r.albedo.g,r.albedo.b,r.diffuse,r.emission.r,r.emission.g,r.emission.b,r.specular,r.specular_exp,r.shininess,r.refraction,r.refractive_index,r.reflection,r.fuzz,0,0])},C=()=>{let e=new Float32Array(t.materials.length*b/4);for(let r=0;r<t.materials.length;r++)e.set(D(r),r*b/4);return e},E=e=>{let r=t.lights[e];return new Float32Array([r.position.x,r.position.y,r.position.z,r.radius,r.color.r,r.color.g,r.color.b,r.intensity,r.fallout.c1,r.fallout.c2,0,0])},A=()=>{let e=new Float32Array(t.lights.length*w/4);for(let r=0;r<t.lights.length;r++)e.set(E(r),r*w/4);return e};async function q(e){if(!navigator.gpu)throw new Error("Not Support WebGPU");const r=await navigator.gpu.requestAdapter();if(!r)throw new Error("No Adapter Found");const a=await r.requestDevice(),o=e.getContext("webgpu"),i=navigator.gpu.getPreferredCanvasFormat(),n=window.devicePixelRatio||1;e.width=e.clientWidth*n,e.height=e.clientHeight*n;const u={width:e.width,height:e.height};return o.configure({device:a,format:i,alphaMode:"opaque"}),{device:a,context:o,format:i,size:u}}async function N(e,r,a){const o=await e.createRenderPipelineAsync({label:"Basic Pipline",layout:"auto",vertex:{module:e.createShaderModule({code:k}),entryPoint:"main",buffers:[{arrayStride:20,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x2"}]}]},fragment:{module:e.createShaderModule({code:T}),entryPoint:"main",targets:[{format:r}]},primitive:{topology:"triangle-list",cullMode:"back",frontFace:"ccw"},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}}),i=e.createTexture({size:a,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),n=i.createView(),u=e.createTexture({size:a,format:r,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),l=u.createView(),c=e.createBuffer({label:"GPUBuffer store vertex",size:y.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(c,0,y);const d=e.createBuffer({label:"Render info as hight/witdth and time",size:4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),m=e.createBuffer({label:"Render info as unsigned int",size:4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),f=e.createBuffer({label:"Sky gradient",size:2*4*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),_=e.createBuffer({label:"Spheres",size:3200,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),h=e.createBuffer({label:"Materials",size:6400,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),s=e.createBuffer({label:"Lights",size:4800,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),p=e.createBuffer({label:"Camera",size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),v=e.createBindGroup({label:"Uniform Group",layout:o.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:d}},{binding:1,resource:{buffer:m}},{binding:2,resource:{buffer:f}},{binding:3,resource:{buffer:_}},{binding:4,resource:{buffer:h}},{binding:5,resource:{buffer:s}},{binding:6,resource:{buffer:p}}]}),g=e.createSampler({magFilter:"linear",minFilter:"linear"}),z=e.createBindGroup({label:"Frame Group",layout:o.getBindGroupLayout(1),entries:[{binding:0,resource:g},{binding:1,resource:l}]});return{pipeline:o,vertexBuffer:c,infoBuffer:d,uInfoBuffer:m,skyGradientBuffer:f,spheresBuffer:_,materialsBuffer:h,lightsBuffer:s,cameraBuffer:p,uniformGroup:v,depthTexture:i,depthView:n,lastFrameTexture:u,lastFrameView:l,lastFrameGroup:z,sampler:g}}async function L(e,r,a){const o=e.createCommandEncoder(),i={colorAttachments:[{view:r.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:a.depthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},n=o.beginRenderPass(i);n.setPipeline(a.pipeline),n.setVertexBuffer(0,a.vertexBuffer),n.setBindGroup(0,a.uniformGroup),n.setBindGroup(1,a.lastFrameGroup),n.draw(U),n.end(),e.queue.submit([o.finish()]),e.queue.copyExternalImageToTexture({source:r.canvas},{texture:a.lastFrameTexture},[a.lastFrameTexture.width,a.lastFrameTexture.height])}async function V(){var _,h;const e=document.querySelector("canvas");if(!e)throw new Error("No Canvas");const{device:r,context:a,format:o,size:i}=await q(e),n=await N(r,o,i);let u=i.width/i.height;const l=Date.now();let c=0;async function d(){const s=Date.now()-l,p=(Date.now()-l)/1e3,v=new Float32Array([p,u,i.width,i.height]),g=new Uint32Array([t.spheres.length,t.lights.length,Math.trunc(s),c]);r.queue.writeBuffer(n.infoBuffer,0,v),r.queue.writeBuffer(n.uInfoBuffer,0,g),r.queue.writeBuffer(n.skyGradientBuffer,0,G()),r.queue.writeBuffer(n.spheresBuffer,0,F()),r.queue.writeBuffer(n.materialsBuffer,0,C()),r.queue.writeBuffer(n.lightsBuffer,0,A()),r.queue.writeBuffer(n.cameraBuffer,0,P()),(a.canvas.width!=n.lastFrameTexture.width||a.canvas.height!=n.lastFrameTexture.height)&&console.error(`Dimensions don't match ${a.canvas.width}, ${n.lastFrameTexture.width}`),L(r,a,n),c+=1,c>600&&(c=0),requestAnimationFrame(d)}d();function m(s){return{r:+("0x"+s.slice(1,3))/255,g:+("0x"+s.slice(3,5))/255,b:+("0x"+s.slice(5,7))/255}}let f={id:1,color:()=>{const s=document.querySelector('.emission input[type="color"]').value;return m(s)},intensity:()=>+document.querySelector('.emission input[type="range"]').value,update:function(){t.materials[this.id].emission.r=this.intensity()*this.color().r,t.materials[this.id].emission.g=this.intensity()*this.color().g,t.materials[this.id].emission.b=this.intensity()*this.color().b}};(_=document.querySelector('input[type="color"]'))==null||_.addEventListener("input",()=>{f.update()}),(h=document.querySelector('input[type="range"]'))==null||h.addEventListener("input",()=>{f.update()}),window.addEventListener("resize",()=>{i.width=e.width=e.clientWidth*devicePixelRatio,i.height=e.height=e.clientHeight*devicePixelRatio,u=i.width/i.height,c=0,n.depthTexture.destroy(),n.depthTexture=r.createTexture({size:i,format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),n.depthView=n.depthTexture.createView(),n.lastFrameTexture.destroy(),n.lastFrameTexture=r.createTexture({size:i,format:o,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),n.lastFrameView=n.lastFrameTexture.createView(),n.lastFrameGroup=r.createBindGroup({label:"Frame Group",layout:n.pipeline.getBindGroupLayout(1),entries:[{binding:0,resource:n.sampler},{binding:1,resource:n.lastFrameView}]})})}V();
