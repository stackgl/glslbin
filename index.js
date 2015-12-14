var examples = require('./examples')
var debounce = require('frame-debounce')
var fit      = require('canvas-fit')
var xhr      = require('xhr')
var url      = require('url')

var sourceId = String(window.location.pathname).slice(1).split('/')
if (sourceId[0] === 's') {
  xhr({
    uri: '/shaders/' + sourceId[1] + '.json',
    method: 'GET',
    json: true
  }, function(err, res, body) {
    if (err) throw err
    init(body.shader)
  })
} else {
  init(examples.blob.trim())
}

function init(source) {
  var editor = require('./editor')(document.body, source)

  var canvas = document.querySelector('canvas')
  var display = require('./display')(canvas)
  var fitter  = fit(canvas)
  var okIKnowWhatImDoing
  window.addEventListener('resize', debounce(fitter), false)

  editor.on('update', function(src) {
    display.update(src)
  })

  document.querySelector('.buttons .play').addEventListener('click', e => {
    editor.reload()
    e.preventDefault()
    e.stopPropagation()
  }, false)

  document.querySelector('.buttons .grow').addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()

    okIKnowWhatImDoing = okIKnowWhatImDoing || confirm('This will bundle all of your dependencies inline, making it harder to edit the code but easy to use it elsewhere. You can still use undo afterwards if you\'re not happy with the results, but otherwise there\'s no nice way to get back to your original code. Keep going?')
    if (!okIKnowWhatImDoing) return

    editor.update(editor.editor.getValue(), (err, result) => {
      if (err) throw err
      editor.value(result.replace('#define GLSLIFY 1', '').trim())
    })
  })

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

  document.querySelector('.buttons .save').addEventListener('click', e => {
    var value = editor.editor.getValue()

    xhr({
      uri: '/-/share',
      method: 'POST',
      json: {
        shader: value
      },
    }, function(err, res, body) {
      if (err) throw err
      window.location = url.parse(body.url).pathname
    })
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
}
