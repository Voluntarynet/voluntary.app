"use strict"

/*

    BMGroupConversation

*/

BMApplet.newSubclassNamed("BMGroupConversation").newSlots({
    remoteIdentity: null,
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        
    },

    title: function() {
        this.remoteIdentity().title()
    },

    messages: function() {
        return this.subnodes()
    },
})

