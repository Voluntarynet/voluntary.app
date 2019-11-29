"use strict"

/*

    BMChannel

*/

window.BMChannel = class BMChannel extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            name: "",

        })
        this.protoAddStoredSlot("name")
    }

    init () {
        super.init()
    }
    
    title () {
        return this.name()
    }
    
    privateKey () {
        const hexName = this.name().toString(16)
        const privateKey = new bitcore.PrivateKey(hexName);
        return privateKey
    }
    
    publicKeyString () {
	    return this.privateKey().toPublicKey().toString()
    }
	
}.initThisClass()
