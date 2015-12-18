require('proof')(1, prove)

function prove (assert) {
    var Cache = require('magazine')
    var Cliffhanger = require('../..')
    new Cliffhanger
    var cliffhanger = new Cliffhanger(new Cache)
    var cookie = cliffhanger.invoke(function (error, result) {
        assert(result, 1, 'called back')
    })
    cliffhanger.resolve(cookie, [ null, 1 ])
}
