const knox = require('knox')
const bl   = require('bl')

module.exports = S3Storage

function S3Storage() {
  if (!(this instanceof S3Storage))
    return new S3Storage

  this.client = new knox({
    key: process.env.AWS_ACCESS_KEY,
    secret: process.env.AWS_SECRET_KEY,
    bucket: 'glslbin'
  })
}

S3Storage.prototype.get = function(key, done) {
  this.client.getFile(key, function(err, res) {
    if (err) return done(err)

    res.pipe(bl(function(err, data) {
      if (err) return done(err)
      if (res.statusCode !== 200) {
        err = new Error('Invalid status code: '  + res.statusCode + '\nOutput: ' + data)
      }

      return done(err, !err && JSON.parse(''+data))
    }))
  })
}

S3Storage.prototype.set = function(key, data, done) {
  var value = JSON.stringify(data)

  this.client.put(key, {
    'Content-Length': Buffer.byteLength(value),
    'Content-Type': 'application/json',
    'x-amz-acl': 'public-read'
  }).on('response', function(res) {
    if (res.statusCode === 200) return done()

    return done(new Error(
      res.body || 'Failed: ' + value
    ))
  }).end(value)
}

S3Storage.prototype.del = function(key, done) {
  this.client.del(key).on('response', function(res) {
    if (res.statusCode === 404) return done()
    if (res.statusCode === 200) return done()
    if (res.statusCode === 204) return done()

    done(new Error('Failed deleting: ' + key))
  }).end()
}
