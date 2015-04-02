const mousetrap     =(require('mousetrap'), window.Mousetrap)
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
require('./editor-search')(CodeMirror)
require('./editor-sublime')(CodeMirror)

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
    keyMap: 'sublime',
    indentUnit: 2,
    tabSize: 2,
    value: ''
  })

  this.editor.addKeyMap({
    'Cmd-Enter': () => this.reload(),
    'Ctrl-Enter': () => this.reload(),
    'Cmd-O': () => this.emit('fullscreen'),
    'Ctrl-O': () => this.emit('fullscreen'),
    'Cmd-;': () => this.instant = !this.instant,
    'Ctrl-;': () => this.instant = !this.instant,
    'Tab': () => this.editor.execCommand('insertSoftTab')
  })

  // Auto-updating disabled for now
  this.instant = true
  this.editor.on('change', debounce(function() {
    if (!self.instant) return
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
    this.editor.setValue(src)
    this.update(src, function(err) {
      if (err) console.error(err)
    })
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

Editor.prototype.reload = function() {
  this.update(this.editor.getValue())
}

Editor.prototype.value = function(value) {
  this.editor.setValue(value)
  this.reload()
}

Object.defineProperty(Editor.prototype, 'instant', {
  get: function() {
    return this._instant
  },
  set: function(value) {
    if (value === this._instant) return
    if (value) {
      document.body.classList.add('instant')
    } else {
      document.body.classList.remove('instant')
    }

    return this._instant = value
  }
})
