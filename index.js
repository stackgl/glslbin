var debounce = require('frame-debounce')
var fit      = require('canvas-fit')

var editor = require('./editor')(document.body, [
  'precision mediump float;',
  '',
  'uniform float iGlobalTime;',
  'uniform vec3 iResolution;',
  '',
  '#pragma glslify: noise = require("glsl-noise/simplex/3d")',
  '',
  'void main() {',
  '  gl_FragColor.rgb = vec3(noise(vec3(gl_FragCoord.xy * 0.01, iGlobalTime * 0.001)));',
  '  gl_FragColor.a = 1.0;',
  '}'
].join('\n'))

var canvas = document.querySelector('canvas')
var display = require('./display')(canvas)

window.addEventListener('resize',
  debounce(fit(canvas)),
  false)

editor.on('update', function(src) {
  display.update(src)
})
