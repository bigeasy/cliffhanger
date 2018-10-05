require('proof')(9, prove)

function prove (okay) {
    var Cache = require('magazine')
    var Cliffhanger = require('..')
    new Cliffhanger
    var now = 0
    var cliffhanger = new Cliffhanger(new Cache({ Date: { now: function () { return now } } }))
    var cookie = cliffhanger.invoke(function (error, result) {
        okay(result, 1, 'called back')
    })
    cliffhanger.resolve(cookie, [ null, 1 ])
    cliffhanger.invoke(function (error, result) {
        okay(error.qualified, 'bigeasy.cliffhanger#expired', 'timed out')
    })
    cliffhanger.expire(1)
    cliffhanger.resolve(cookie, [ null, 1 ])
    cliffhanger.invoke(function (error, result) {
        okay(error, null, 'timed out, no error')
        okay(result, 404, 'timed out, value')
    })
    cliffhanger.expire(1, [ null, 404 ])
    var cookies = []
    cookies[0] = cliffhanger.invoke(function (error, result) {
        okay(error.qualified, 'bigeasy.cliffhanger#canceled', 'canceled')
    })
    cookies[1] = cliffhanger.invoke(function (error, result) {
        okay(result, 1, 'perserved')
    })
    cookies[2] = cliffhanger.invoke(function (error, result) {})
    cliffhanger.cancel(function (cookie) {
        return cookies[0] == cookie
    })
    okay(!cliffhanger.resolve(cookies[0], [ null, 1 ]), 'missed')
    okay(cliffhanger.resolve(cookies[1], [ null, 1 ]), 'hit')
    cliffhanger.cancel()
    okay(!cliffhanger.resolve(cookies[2], [ null, 1 ]), 'unconditional cancel')
}
