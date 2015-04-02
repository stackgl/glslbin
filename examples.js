module.exports = {
  noise: `

precision mediump float;

uniform float iGlobalTime;
uniform vec3  iResolution;

#pragma glslify: noise = require("glsl-noise/simplex/3d")

void main() {
  float n = noise(vec3(gl_FragCoord.xy * 0.005, iGlobalTime));
  gl_FragColor.rgb = vec3(n);
  gl_FragColor.a   = 1.0;
}

  `,

  sphere: `
precision mediump float;

uniform float iGlobalTime;
uniform vec3  iResolution;

vec2 doModel(vec3 p);

#pragma glslify: raytrace = require('glsl-raytrace', map = doModel, steps = 90)
#pragma glslify: normal = require('glsl-sdf-normal', map = doModel)
#pragma glslify: camera = require('glsl-turntable-camera')

vec2 doModel(vec3 p) {
  float id = 0.0;
  float d  = length(p) - 1.0;
  return vec2(d, id);
}

void main() {
  vec3 color = vec3(0.0);
  vec3 ro, rd;

  float rotation = iGlobalTime;
  float height   = 0.0;
  float dist     = 4.0;
  camera(rotation, height, dist, iResolution.xy, ro, rd);

  vec2 t = raytrace(ro, rd);
  if (t.x > -0.5) {
    vec3 pos = ro + rd * t.x;
    vec3 nor = normal(pos);

    color = nor * 0.5 + 0.5;
  }

  gl_FragColor.rgb = color;
  gl_FragColor.a   = 1.0;
}
  `,
  blob: `
precision mediump float;

uniform float iGlobalTime;
uniform vec3  iResolution;

vec2 doModel(vec3 p);

#pragma glslify: raytrace = require('glsl-raytrace', map = doModel, steps = 90)
#pragma glslify: normal = require('glsl-sdf-normal', map = doModel)
#pragma glslify: camera = require('glsl-turntable-camera')
#pragma glslify: noise = require('glsl-noise/simplex/4d')

vec2 doModel(vec3 p) {
  float r  = 1.0 + noise(vec4(p, iGlobalTime)) * 0.25;
  float d  = length(p) - r;
  float id = 0.0;

  return vec2(d, id);
}

void main() {
  vec3 color = vec3(0.0);
  vec3 ro, rd;

  float rotation = iGlobalTime;
  float height   = 0.0;
  float dist     = 4.0;
  camera(rotation, height, dist, iResolution.xy, ro, rd);

  vec2 t = raytrace(ro, rd);
  if (t.x > -0.5) {
    vec3 pos = ro + rd * t.x;
    vec3 nor = normal(pos);

    color = nor * 0.5 + 0.5;
  }

  gl_FragColor.rgb = color;
  gl_FragColor.a   = 1.0;
}
  `
}
