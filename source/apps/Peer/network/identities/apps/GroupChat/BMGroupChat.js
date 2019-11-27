"use strict"

/*

    BMGroupChat

*/

window.BMGroupChat = class BMGroupChat extends BMApplet {
    
    initPrototype () {
        this.newSlots({
            channels: null,
            directMessages: null,
            profile: null,
        })
    }

    init () {
        super.init()
        this.setTitle("Slack")
        
        this.setChannels(BMNode.clone().setTitle("channels"))
        this.addSubnode(this.channels())

        this.setDirectMessages(BMNode.clone().setTitle("direct messages"))
        this.addSubnode(this.directMessages())
    }

}.initThisClass()

