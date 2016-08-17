var Cache = require('magazine')
var Monotonic = require('monotonic')
var interrupt = require('interrupt').createInterrupter('bigeasy.cliffhanger')

function Cliffhanger (cache) {
    cache = cache || new Cache
    this._magazine = cache.createMagazine()
    this._cookie = Monotonic.parse('0')
}

Cliffhanger.prototype.invoke = function (callback) {
    var cookie = Monotonic.toString(this._cookie = Monotonic.increment(this._cookie))
    this._magazine.hold(cookie, { cookie: cookie, callback: callback }).release()
    return cookie
}

Cliffhanger.prototype.resolve = function (cookie, vargs) {
    var cartridge = this._magazine.hold(cookie, null), outcome = false
    if (cartridge.value != null) {
        cartridge.value.callback.apply(null, vargs)
        outcome = true
    }
    cartridge.remove()
    return outcome
}

Cliffhanger.prototype.expire = function (expired) {
    var purge = this._magazine.purge()
    while (purge.cartridge && purge.cartridge.when < expired) {
        purge.cartridge.value.callback.call(null, interrupt({
            name: 'expired',
            context: {
                cookie: purge.cartridge.value.cookie
            },
            properties: {
                callback: purge.cartridge.value.callback
            }
        }))
        purge.cartridge.remove()
        purge.next()
    }
    purge.release()
}

Cliffhanger.prototype.cancel = function (condition) {
    var purge = this._magazine.purge()
    while (purge.cartridge) {
        if (condition(purge.cartridge.value.cookie)) {
            purge.cartridge.value.callback.call(null, interrupt({
                name: 'canceled',
                context: {
                    cookie: purge.cartridge.value.cookie
                },
                properties: {
                    callback: purge.cartridge.value.callback
                }
            }))
            purge.cartridge.remove()
        } else {
            purge.cartridge.release()
        }
        purge.next()
    }
}

module.exports = Cliffhanger
