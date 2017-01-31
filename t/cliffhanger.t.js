require('proof/redux')(7, prove)

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
        assert(error.interrupt, 'bigeasy.cliffhanger#expired', 'timed out')
    })
    cliffhanger.expire(1)
    var cookies = []
    cookies[0] = cliffhanger.invoke(function (error, result) {
        assert(error.interrupt, 'bigeasy.cliffhanger#canceled', 'canceled')
    })
    cookies[1] = cliffhanger.invoke(function (error, result) {
        assert(result, 1, 'perserved')
    })
    cookies[2] = cliffhanger.invoke(function (error, result) {})
    cliffhanger.cancel(function (cookie) {
        return cookies[0] == cookie
    })
    assert(!cliffhanger.resolve(cookies[0], [ null, 1 ]), 'missed')
    assert(cliffhanger.resolve(cookies[1], [ null, 1 ]), 'hit')
    cliffhanger.cancel()
    assert(!cliffhanger.resolve(cookies[2], [ null, 1 ]), 'unconditional cancel')
}
