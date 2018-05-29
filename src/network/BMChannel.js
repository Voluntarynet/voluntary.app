
"use strict"

window.BMChannel = BMStorableNode.extend().newSlots({
    type: "BMChannel",
    name: "",
    debug: false,
}).setSlots({
    init: function () {
        this.addStoredSlot("name")
    },
    
    title: function() {
        return this.name()
    },
    
    privateKey: function() {
        var hexName = this.name().toString(16)
        var privateKey = new bitcore.PrivateKey(hexName);
        return privateKey
    },
    
    publicKeyString: function() {
	    return this.privateKey().toPublicKey().toString()
    },
	
})
