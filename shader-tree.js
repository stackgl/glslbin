const resolver = require('glslify-resolve-remote')()
const deps     = require('glslify-deps')
const bl       = require('bl')

module.exports = shaderTree

function shaderTree(req, res, next) {
  var depper = deps({
    resolve: resolver
  })

  req.pipe(bl(function(err, input) {
    if (err) return next(err)

    depper.inline(input+'', '/', function(err, tree) {
      if (err) return next(err)

      res.end(JSON.stringify(tree))
    })
  }))
}
