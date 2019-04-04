"use strict"

/*

    WebSocketExtensions categories
    
*/

WebSocket.prototype.removeEventListeners = function() {
    if (this._eventListeners) {
        this._eventListeners.forEach(eventListener => {
            this.removeEventListener(eventListener.name, eventListener.fn);
        });
    }
}

WebSocket.prototype.addEventListenerWithoutExtensions = WebSocket.prototype.addEventListener;

WebSocket.prototype.addEventListener = function(name, fn) {
    if (!this._eventListeners) {
        this._eventListeners = [];
    }
    this._eventListeners.push({
        name: name,
        fn: fn
    });
    this.addEventListenerWithoutExtensions(name, fn);
}
