const frameDebounce = require('frame-debounce')
const Client        = require('glslify-client')
const size          = require('element-size')
const CodeMirror    = require('codemirror')
const inherits      = require('inherits')
const debounce      = require('debounce')
const Emitter       = require('events/')
const xhr           = require('xhr')

module.exports = Editor

require('./editor-glsl')(CodeMirror)

inherits(Editor, Emitter)
function Editor(container, src) {
  if (!(this instanceof Editor)) return new Editor(container, src)
  Emitter.call(this)

  var self = this

  this.el = container.appendChild(document.createElement('div'))
  this.el.classList.add('editor')

  this.editor = new CodeMirror(this.el, {
    container: this.el,
    theme: 'dracula',
    mode: 'glsl',
    lineNumbers: true,
    matchBrackets: true,
    indentWithTabs: false,
    styleActiveLine: true,
    showCursorWhenSelecting: true,
    viewportMargin: Infinity,
    indentUnit: 2,
    tabSize: 2,
    value: ''
  })

  this.editor.on('change', debounce(function() {
    self.update(self.editor.getValue())
  }, 500))

  this._update = Client(function(source, done) {
    xhr({
      uri: '/-/shader',
      method: 'POST',
      body: source
    }, function(err, res, tree) {
      if (err) return done(err)

      try {
        tree = JSON.parse(tree)
      } catch(err) {
        return done(err)
      }

      done(null, tree)
    })
  })

  setTimeout(function() {
    self.editor.focus()
    self.resize()
  })

  window.addEventListener('resize', frameDebounce(function() {
    self.resize()
  }), false)

  if (src) {
    this.update(src, function(){})
    this.editor.setValue(src)
  }
}

Editor.prototype.resize = function(w, h) {
  if (w && h) return this.editor.setSize(w, h)
  var sz = size(this.el)

  this.editor.setSize(w || sz[0], h || sz[1])
}

Editor.prototype.update = function(src, done) {
  var self = this

  this._update(src, function(err, result) {
    if (err) return done && done(err)
    self.emit('update', result)
    done && done(null, result)
  })
}