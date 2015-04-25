const gzip       = require('compression')()
const st         = require('serve-static')
const browserify = require('browserify')
const storage    = require('./storage')
const uglify     = require('uglify-js')
const router     = require('course')()
const watchify   = require('watchify')
const mkdirp     = require('mkdirp')
const path       = require('path')
const http       = require('http')
const fs         = require('fs')

mkdirp.sync(path.join(__dirname, 'dist'))

const PORT = process.env.PORT || 12421

router.get(st(path.join(__dirname, 'assets')))
router.get(st(path.join(__dirname, 'dist')))
router.post('/-/source', require('./shader-string'))
router.post('/-/shader', require('./shader-tree'))
router.post('/-/share', require('./shader-share'))

router.get('/s/:shader', function(req, res, next) {
  req.url = '/'
  router(req, res, next)
})

router.get('/shaders/:shader', function(req, res, next) {
  if (path.extname(req.url) !== '.json') return next()

  this.shader = this.shader.replace(/\.json$/, '')

  storage.get(this.shader, function(err, data) {
    if (err) return next(err)

    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(data))
  })
})

http.createServer(function(req, res) {
  gzip(req, res, function(err) {
    if (err) return bail(err, req, res)

    router(req, res, function(err) {
      if (err) return bail(err, req, res)

      res.statusCode = 404
      res.setHeader('content-type', 'text/plain')
      res.end('404: ' + req.url)
    })
  })
}).listen(PORT, function(err) {
  if (err) throw err
  console.log('http://localhost:'+PORT+'/')
})

function bail(err, req, res) {
  res.statusCode = 500
  res.setHeader('content-type', 'text/plain')
  res.end([err.message, err.stack].join('\n'))

  console.log(err.message)
  console.log(err.stack)
}

var bundler = browserify({
  entries: [path.join(__dirname, 'index.js')],
  packageCache: {},
  cache: {},
  fullPaths: true
})

if (process.env.NODE_ENV !== 'production') {
  watchify(bundler)
}

bundler.on('update', update)
update()

function update() {
  console.time('built bundle.js')
  bundler.bundle(function(err, src) {
    console.timeEnd('built bundle.js')

    src = uglify.minify('' + src, {
      fromString: true,
      compress: true,
      mangle: true
    }).code

    if (err) {
      console.error(err.message)
      console.error(err.stack)
      return
    }

    var file = path.join(__dirname, 'dist', 'bundle.js')

    fs.writeFile(file, src, function(err) {
      if (!err) return
      console.error(err.message)
      console.error(err.stack)
    })
  })
}
