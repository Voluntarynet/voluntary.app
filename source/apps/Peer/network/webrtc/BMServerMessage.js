"use strict"

/*

    BMServerMessage

*/

window.BMServerMessage = class BMServerMessage extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
            count: 0,
            serverConnection: null,
            id: null,
            name: null,
            data: null
        })
    }

    init () {
        super.init()
        BMServerMessage.setCount(BMServerMessage.count() + 1);
        this.setId(BMServerMessage.count().toString());
    }

    send () {
        const messageString = JSON.stringify({
            id: this.id(),
            name: this.name(),
            data: this.data()
        });

        //console.log('BMServerMessage send: ' + messageString);

        this.serverConnection().pendingMessages()[this.id()] = this;
        this.serverConnection().serverConn().send(messageString);

        return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    resolve (value) {
        this._resolve(value);
    }

    reject (reason) {
        this._reject(reason);
    }
    
}.initThisClass()