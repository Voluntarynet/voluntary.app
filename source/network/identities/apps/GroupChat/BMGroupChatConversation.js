"use strict"

/*

    BMGroupConversation

*/

window.BMGroupConversation = BMApplet.extend().newSlots({
    type: "BMGroupConversation",
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

