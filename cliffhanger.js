var Cache = require('magazine')
var Monotonic = require('monotonic')

function Cliffhanger (cache) {
    cache = cache || new Cache
    this._magazine = cache.createMagazine()
    this._cookie = Monotonic.parse('0')
}

Cliffhanger.prototype.invoke = function (callback) {
    var cookie = Monotonic.toString(this._cookie = Monotonic.increment(this._cookie))
    this._magazine.hold(cookie, { callback: callback }).release()
    return cookie
}

Cliffhanger.prototype.resolve = function (cookie, vargs) {
    var cartridge = this._magazine.hold(cookie, {})
    cartridge.value.callback.apply(null, vargs)
    cartridge.release()
}

module.exports = Cliffhanger
