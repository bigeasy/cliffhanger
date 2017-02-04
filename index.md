Synopsis

```javascript
var Cliffhanger = require('cliffhanger')


var cookie = cliffhanger.invoke(function (error, value) {
    if (error) throw error
    console.log(value)
})

cliffhanger.resolve(cookie, [ null, 1 ])
```

Cliffhanger is used when we want our dear user to wait for a response that
crosses a serialization boundary, like a socket. We're not able to pass a
callback across the socket, but we can pass a cookie with the request. We can
then use a cookie provided with a response to invoke the callback given to us by
our dear user.

I've gone and said that Cliffhanger is a utility for continuations, which it is
somewhat in the sense that it allows you to take a serialized response and reify
it into an asynchronous function return; an invocation of an error-first
callback.
