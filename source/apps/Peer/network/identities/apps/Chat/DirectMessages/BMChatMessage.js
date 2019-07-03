
"use strict"

/*

    BMChatMessage

*/

window.BMChatMessage = BMAppMessage.extend().newSlots({
    type: "BMChatMessage",
    content: "",
}).setSlots({
    
    init: function () {
        BMAppMessage.init.apply(this)
        this.addStoredSlots(["content"])
        this.setCanDelete(true)
    },	
	
    nodeRowLink: function() {
        return null
    },
	
    title: function() {
	    return this.content()
    },
	
    wasSentByMe: function() {
        return this.senderId() === this.localIdentity()
    },
	
    contentDict: function() {
        const contentDict = {}
        contentDict.content = this.content()
        return contentDict
    },
	
    setContentDict: function(contentDict) {
        this.setContent(contentDict.content)
        //this.scheduleSyncToView()
        return this
    },
	
    description: function() {
        return this.typeId() + "-" + this.hash() + "'" + this.content() + "'"
    },

    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
    localIdentityIsSender: function() {
        return this.senderId().equals(this.localIdentity())
    },
})

