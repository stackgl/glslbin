const storage = require('../storage')
const test    = require('tape')

test('storage', function(t) {
  var key = '__TEST__'

  storage.get(key, function(err, data) {
    t.ok(err, 'error should be reported')

    storage.set(key, { hello: 'world' }, function(err) {
      if (err) return t.fail(err.message || err)

      storage.get(key, function(err, data) {
        if (err) return t.fail(err.message || err)

        t.equal(data.hello, 'world', 'includes JSON property')

        storage.del(key, function(err) {
          if (err) return t.fail(err.message || err)

          storage.get(key, function(err) {
            t.ok(err, 'file was deleted')
            t.end()
          })
        })
      })
    })
  })
})
