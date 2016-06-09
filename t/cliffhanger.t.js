require('proof')(4, prove)

function prove (assert) {
    var Cache = require('magazine')
    var Cliffhanger = require('..')
    new Cliffhanger
    var now = 0
    var cliffhanger = new Cliffhanger(new Cache({ Date: { now: function () { return now } } }))
    var cookie = cliffhanger.invoke(function (error, result) {
        assert(result, 1, 'called back')
    })
    cliffhanger.resolve(cookie, [ null, 1 ])
    cliffhanger.invoke(function (error, result) {
        assert(error.message, 'expired', 'timed out')
    })
    cliffhanger.expire(1)
    var cookies = []
    cookies[0] = cliffhanger.invoke(function (error, result) {
        assert(error.message, 'cancelled', 'cancelled')
    })
    cookies[1] = cliffhanger.invoke(function (error, result) {
        assert(result, 1, 'perserved')
    })
    cliffhanger.cancel(function (cookie) {
        return cookies[0] == cookie
    })
    cliffhanger.resolve(cookies[1], [ null, 1 ])
}
