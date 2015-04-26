const resolver = require('glslify-resolve-remote')()
const bundle   = require('glslify-bundle')
const deps     = require('glslify-deps')
const bl       = require('bl')

module.exports = shaderString

function shaderString(req, res, next) {
  var depper = deps({ resolve: resolver })

  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('content-type', 'text/plain')

  req.pipe(bl(function(err, input) {
    if (err) return next(err)

    depper.inline(input+'', '/', function(err, tree) {
      if (err) return next(err)

      try {
        var src = bundle(tree)
      } catch(e) {
        return next(e)
      }

      res.end(src)
    })
  }))
}
