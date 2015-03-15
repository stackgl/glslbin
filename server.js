const st         = require('serve-static')
const browserify = require('browserify')
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
router.post('/-/shader', require('./shader-tree'))

http.createServer(function(req, res) {
  router(req, res, function(err) {
    if (err) return bail(err, req, res)

    res.statusCode = 404
    res.setHeader('content-type', 'text/plain')
    res.end('404: ' + req.url)
  })
}).listen(PORT, function(err) {
  if (err) throw err
  console.log('http://localhost:'+PORT+'/')
})

function bail(err, req, res) {
  res.statusCode = 500
  res.setHeader('content-type', 'text/plain')
  res.end([err.message, err.stack].join('\n'))
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
  bundler.bundle().on('error', function(err) {
    console.error(err.message)
    console.error(err.stack)
    console.timeEnd('built bundle.js')
  }).pipe(fs.createWriteStream(
    path.join(__dirname, 'dist', 'bundle.js')
  )).once('close', function() {
    console.timeEnd('built bundle.js')
  })
}
