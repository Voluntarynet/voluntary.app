"use strict"

/*

    BMChannel

*/

window.BMChannel = BMStorableNode.extend().newSlots({
    type: "BMChannel",
    name: "",
    isDebugging: false,
}).setSlots({
    init: function () {
        this.addStoredSlot("name")
    },
    
    title: function() {
        return this.name()
    },
    
    privateKey: function() {
        const hexName = this.name().toString(16)
        const privateKey = new bitcore.PrivateKey(hexName);
        return privateKey
    },
    
    publicKeyString: function() {
	    return this.privateKey().toPublicKey().toString()
    },
	
})
