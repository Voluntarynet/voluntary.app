
"use strict"

window.BMPostThread = BMAppMessage.extend().newSlots({
    type: "BMPostThread",
	
	postMessage: null,
}).setSlots({
    
    init: function () {
        BMAppMessage.init.apply(this)	
		this.nodeRowStyles().setToBlackOnWhite()
    },
    
    findThreadItems: function() {
        var items = []
        items.push(this.postMessage())
        items.appendItems(this.postMessage().replies())
        return items
    },
    
    update: function () {
        this.setSubnodes(this.findThreadItems()) // merge?
        return this
    },

})

