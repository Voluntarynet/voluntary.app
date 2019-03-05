"use strict"

/*

    BMGroupChatChannel

*/

window.BMGroupChatChannel = BMApplet.extend().newSlots({
    type: "BMGroupChatChannel",
    name: "Untitled",
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        

    },

    title: function() {
        return this.name()
    },
	
    setTitle: function(aString) {
        this.setName(aString)
        return this
    },	
})

