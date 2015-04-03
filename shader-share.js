const storage = require('./storage')
const crypto  = require('crypto')
const bl      = require('bl')

module.exports = function(req, res, next) {
  res.setHeader('content-type', 'application/json')
  req.pipe(bl(function(err, data) {
    if (err) return next(err)

    data = String(data)

    try {
      data = JSON.parse(data)
    } catch(e) {
      return next(e)
    }

    var key = crypto.createHash('md5')
      .update([Date.now(), Math.random()].join('.'))
      .digest('hex')
      .slice(0, 8)

    storage.set(key, {
      shader: data.shader
    }, function(err, data) {
      if (err) return next(err)

      res.end(JSON.stringify({
        url: 'http://glslb.in/s/' + key
      }))
    })
  }))
}
