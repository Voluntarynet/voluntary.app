"use strict"

/*

    BMChannel

*/


BMStorableNode.newSubclassNamed("BMChannel").newSlots({
    name: "",
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
