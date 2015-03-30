const Context  = require('gl-context')
const triangle = require('a-big-triangle')
const Shader   = require('gl-shader')
const now      = require('right-now')
const glslify  = require('glslify')

module.exports = Display

const start = now()
const vert  = `
  precision mediump float;

  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 1, 1);
  }
`

const frag = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(0, 0, 0, 0);
  }
`

function Display(canvas) {
  if (!(this instanceof Display)) return new Display(canvas)

  const gl     = this.gl     = Context(canvas, render)
  const shader = this.shader = Shader(gl, vert, frag)

  function render() {
    const width  = gl.drawingBufferWidth
    const height = gl.drawingBufferHeight

    gl.viewport(0, 0, width, height)

    shader.bind()
    shader.uniforms.iGlobalTime = (now() - start) / 1000
    shader.uniforms.iResolution = [width, height, 1]
    triangle(gl)
  }
}

Display.prototype.update = function(source) {
  this.shader.update(vert, source)
}
