"use strict"

/*

    BMGroupChatChannel

*/

BMApplet.newSubclassNamed("BMGroupChatChannel").newSlots({
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

