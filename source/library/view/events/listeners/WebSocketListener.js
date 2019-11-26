"use strict"

/*
    WebSocketListener

    Listens to a set of web socket events.

*/

EventSetListener.newSubclassNamed("WebSocketListener").newSlots({
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

}).initThisProto()
