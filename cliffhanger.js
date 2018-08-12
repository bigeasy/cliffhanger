// MRU cache for callbacks.
var Cache = require('magazine')

// Ever increasing serial value with no maximum value.
var Monotonic = require('monotonic').asString

// Exceptions with context that can be caught by type.
var Interrupt = require('interrupt').createInterrupter('bigeasy.cliffhanger')

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
Cliffhanger.prototype.expire = function (expired, error) {
    var purge = this._magazine.purge()
    while (purge.cartridge && purge.cartridge.when < expired) {
        purge.cartridge.value.callback.call(null, error || new Interrupt('expired'))
        purge.cartridge.remove()
        purge.next()
    }
    purge.release()
}

// TODO Cancel with conditions is Dubious. If ever I need to cancel just a
// subset, I'm pretty sure I'd group them by Cliffhanger, or else create a
// custom Cliffhanger-like cache.

// Cancel all callbacks that match the given condition.

// The condition is really dubious. If you're going to test based on a cookie,
// then you're going to have to keep information associated with the cookie, so
// why not just create a Magazine for yourself?

// It is outgoing, but I'm going to keep it in case I'm using it somewhere.

//
Cliffhanger.prototype.cancel = function (condition, error) {
    var vargs = Array.prototype.slice.call(arguments)
    if (typeof vargs[0] == 'function') {
        condition = vargs.shift()
    } else {
        condition = function () { return true }
    }
    error = vargs.shift()
    var purge = this._magazine.purge()
    while (purge.cartridge) {
        if (condition(purge.cartridge.value.cookie)) {
            purge.cartridge.value.callback.call(null, error || new Interrupt('canceled'))
            purge.cartridge.remove()
        } else {
            purge.cartridge.release()
        }
        purge.next()
    }
}

// Export as constructor.
module.exports = Cliffhanger
