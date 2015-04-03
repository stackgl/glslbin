const level = require('level')
const path  = require('path')

module.exports = LocalStorage

function LocalStorage() {
  if (!(this instanceof LocalStorage))
    return new LocalStorage

  this.client = level(path.join(__dirname, '.db'), {
    valueEncoding: 'json'
  })
}

LocalStorage.prototype.get = function(key, done) {
  this.client.get(key, done)
}

LocalStorage.prototype.set = function(key, data, done) {
  this.client.put(key, data, done)
}

LocalStorage.prototype.del = function(key, done) {
  this.client.del(key, done)
}
