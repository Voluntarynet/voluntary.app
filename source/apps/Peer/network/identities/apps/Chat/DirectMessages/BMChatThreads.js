"use strict"

/*

    BMChatThreads

*/

BMContactLinks.newSubclassNamed("BMChatThreads").newSlots({
}).setSlots({
    init: function () {
        BMContactLinks.init.apply(this)
        this.setLinkProto(BMChatThread)
        //this.setNodeColumnBackgroundColor("white")
		
    },

    finalize: function() {
        BMContactLinks.finalize.apply(this)
        this.setTitle("direct messages")
    },
	
    shelfIconName: function() {
        return "chat/direct_messages"
	    //return "mail-white"
    },
    
}).initThisProto()