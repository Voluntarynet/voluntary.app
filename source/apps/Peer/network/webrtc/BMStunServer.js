"use strict"

/*

    BMStunServer

    A record for a WebRTC STUN (Session Traversal Utilities for NAT) Server 
    these help us get around NAT (Network Address Traversal) routers
    we just use these objects to maintain the list passed to new Peer()

    See: https://en.wikipedia.org/wiki/STUN
    
*/

BMFieldSetNode.newSubclassNamed("BMStunServer").newSlots({
    host: "",
    port: "", 
    //credential: null,
    //username: null,
    stunNote: "",
}).setSlots({
    localServer: function() {
        return this.clone().setHost("127.0.0.1").setPort(3478)
    },
	
    init: function () {
        BMFieldSetNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        this.addStoredSlots(["host", "port"])
        //this.addStoredSlots(["credential", "username"])
        this.setShouldStoreSubnodes(false)
        this.setCanDelete(true)
        this.setNodeMinWidth(500)

        this.addStoredField(BMField.clone().setKey("host").setValueMethod("host")).setValueIsEditable(true)
        this.addStoredField(BMField.clone().setKey("port").setValueMethod("port")).setValueIsEditable(true)
        this.addStoredField(BMField.clone().setKey("note").setValueMethod("stunNote")).setValueIsEditable(true)
    },

    title: function () {
        return this.host() + " " + this.port()
    },

    subtitle: function () {
        return this.stunNote()
    },
	
    // ice entry - for Peer options
	
    setIceDict: function(dict) {
	    const url = dict.url
        const parts = url.split(":")
        const type = parts[0]
        assert(type === "stun")
        const host = parts[1]
        const port = parts[2]
        this.setHost(host)
        this.setPort(port)
        return this
    },
	
	
    iceDict: function() {
        let url = "stun:" + this.host()
        if (this.port() !== null && this.port() !== "") {
            url += ":" + this.port()
        }
        return { url: url }
    },
})
