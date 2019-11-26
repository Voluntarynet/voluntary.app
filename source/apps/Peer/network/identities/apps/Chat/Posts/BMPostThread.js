"use strict"

/*

    BMPostThread

*/


BMAppMessage.newSubclassNamed("BMPostThread").newSlots({
    postMessage: null,
}).setSlots({
    
    init: function () {
        BMAppMessage.init.apply(this)	
        this.customizeNodeRowStyles().setToBlackOnWhite()
    },
    
    title: function() {
        return "post"
    },
    
    findThreadItems: function() {
        const items = []
        items.push(this.postMessage())
        items.appendItems(this.postMessage().replies())
        return items
    },
    
    update: function () {
        this.setSubnodes(this.findThreadItems()) // merge?
        return this
    },

}).initThisProto()

