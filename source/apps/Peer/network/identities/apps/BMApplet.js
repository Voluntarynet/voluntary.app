
"use strict"

/*

    BMApplet

*/

BMStorableNode.newSubclassNamed("BMApplet").newSlots({
}).setSlots({
    sharedStoredInstance: function() {
        return NodeStore.shared().rootInstanceWithPidForProto(this.type(), this)
    },
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
    },

    handleAppMsg: function(aMessage) {
        // override
    },
	
    allIdentitiesMap: function() { // only uses valid remote identities
        const ids = ideal.Map.clone()
        return ids
    },

})

