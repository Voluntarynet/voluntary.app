"use strict"

/*
    WebSocketListener

    Listens to a set of web socket events.

*/

window.WebSocketListener = class WebSocketListener extends EventSetListener {
    
    initPrototype () {

    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("open", "onOpen");
        this.addEventNameAndMethodName("close", "onClose");
        this.addEventNameAndMethodName("error", "onError");
        this.addEventNameAndMethodName("message", "onMessage");
        return this
    }

}.initThisClass()
