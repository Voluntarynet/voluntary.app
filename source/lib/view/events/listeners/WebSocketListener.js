"use strict"

/*
    WebSocketListener

    Listens to a set of web socket events.

*/

window.WebSocketListener = EventSetListener.extend().newSlots({
    type: "WebSocketListener",
}).setSlots({
    /*
    init: function () {
        EventSetListener.init.apply(this)
        return this
    },
    */

    setupEventsDict: function() {
        this.addEventNameAndMethodName("open", "onOpen");
        this.addEventNameAndMethodName("close", "onClose");
        this.addEventNameAndMethodName("error", "onError");
        this.addEventNameAndMethodName("message", "onMessage");
        return this
    },

})
