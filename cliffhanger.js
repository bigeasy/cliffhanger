// MRU cache for callbacks.
var Cache = require('magazine')

// Ever increasing serial value with no maximum value.
var Monotonic = require('monotonic').asString

// Exceptions with context that can be caught by type.
var Interrupt = require('interrupt').createInterrupter('cliffhanger')

// Create a Cliffhanger. The optional `cache` argument is a common cache from
// which to create a magazine.

//
function Cliffhanger (cache) {
    cache = cache || new Cache
    this._magazine = cache.createMagazine()
    this._cookie = '0'
}

// Create a cookie that will invoke the given callback.

//
Cliffhanger.prototype.invoke = function (callback) {
    var cookie = this._cookie = Monotonic.increment(this._cookie, 0)
    this._magazine.put(cookie, { cookie: cookie, callback: callback })
    return cookie
}

// Invoke the callback from the given cookie with the given arguments. The
// arguments are an array of arguments given to apply.

//
Cliffhanger.prototype.resolve = function (cookie, vargs) {
    var invocation = this._magazine.get(cookie), outcome = false
    if (invocation != null) {
        invocation.callback.apply(null, vargs)
        this._magazine.remove(cookie)
        outcome = true
    }
    return outcome
}

// Expire any callbacks that have been in the cache since before the given
// expiration time. The error is the optional error to pass to the callback,
// otherwise an error is a coded Interrupt error created by the Cliffhanger.

//
Cliffhanger.prototype.expire = function (expired, vargs) {
    var purge = this._magazine.purge()
    while (purge.cartridge && purge.cartridge.when < expired) {
        if (!Array.isArray(vargs)) {
            vargs = [ vargs || new Interrupt('expired') ]
        }
        purge.cartridge.value.callback.apply(null, vargs)
        purge.cartridge.remove()
        purge.next()
    }
    purge.release()
}

Cliffhanger.prototype.cancel = function (vargs) {
    if (!Array.isArray(vargs)) {
        vargs = [ vargs || new Interrupt('canceled') ]
    }
    var purge = this._magazine.purge()
    while (purge.cartridge) {
        purge.cartridge.value.callback.apply(null,vargs)
        purge.cartridge.remove()
        purge.next()
    }
}

// Export as constructor.
module.exports = Cliffhanger
