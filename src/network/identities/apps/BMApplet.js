
"use strict"

window.BMApplet = BMStorableNode.extend().newSlots({
    type: "BMApplet",
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
})

