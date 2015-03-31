var debounce = require('frame-debounce')
var fit      = require('canvas-fit')

var editor = require('./editor')(document.body, `precision mediump float;

uniform float iGlobalTime;
uniform vec3  iResolution;

#pragma glslify: noise = require("glsl-noise/simplex/3d")

void main() {
  float n = noise(vec3(gl_FragCoord.xy * 0.005, iGlobalTime));
  gl_FragColor.rgb = vec3(n);
  gl_FragColor.a   = 1.0;
}
`)

var canvas = document.querySelector('canvas')
var display = require('./display')(canvas)

window.addEventListener('resize',
  debounce(fit(canvas)),
  false)

editor.on('update', function(src) {
  display.update(src)
})

document.querySelector('.buttons .play').addEventListener('click', e => {
  editor.reload()
  e.preventDefault()
  e.stopPropagation()
}, false)
