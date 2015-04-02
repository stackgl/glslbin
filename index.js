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
var fitter  = fit(canvas)

window.addEventListener('resize', debounce(fitter), false)

editor.on('update', function(src) {
  display.update(src)
})

document.querySelector('.buttons .play').addEventListener('click', e => {
  editor.reload()
  e.preventDefault()
  e.stopPropagation()
}, false)

document.querySelector('.buttons .full').addEventListener('click', e => {
  toggleFullscreen()
  e.preventDefault()
  e.stopPropagation()
})

document.querySelector('.buttons .auto').addEventListener('click', e => {
  editor.instant = !editor.instant
  e.preventDefault()
  e.stopPropagation()
})

editor.on('fullscreen', toggleFullscreen)
function toggleFullscreen() {
  document.body.classList.toggle('fullscreen')
  fitter(canvas)
  editor.resize()
}

var egSelector = document.querySelector('[name="examples"]')
var szSelector = document.querySelector('[name="scale"]')
var examples = require('./examples')

egSelector.addEventListener('change', e => {
  var name = egSelector.value
  if(!name) return

  editor.value(examples[egSelector.value].trim())
})

szSelector.addEventListener('change', e => {
  var value = Number(szSelector.value)
  if (!value) return
  fitter.scale = value
  fitter()
})
