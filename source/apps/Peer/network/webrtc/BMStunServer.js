"use strict"

/*

    BMStunServer

    A record for a WebRTC STUN (Session Traversal Utilities for NAT) Server 
    these help us get around NAT (Network Address Traversal) routers
    we just use these objects to maintain the list passed to new Peer()

    See: https://en.wikipedia.org/wiki/STUN
    
*/

window.BMStunServer = class BMStunServer extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlots({
            host: "",
            port: "", 
            //credential: null,
            //username: null,
            stunNote: "",
        })
        this.protoAddStoredSlots(["host", "port"])
        //this.protoAddStoredSlots(["credential", "username"])
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        this.setShouldStoreSubnodes(false)
        this.setCanDelete(true)
        this.setNodeMinWidth(500)
    }

    init  () {
        super.init()
        this.addStoredField(BMField.clone().setKey("host").setValueMethod("host")).setValueIsEditable(true)
        this.addStoredField(BMField.clone().setKey("port").setValueMethod("port")).setValueIsEditable(true)
        this.addStoredField(BMField.clone().setKey("note").setValueMethod("stunNote")).setValueIsEditable(true)
    }

    localServer () {
        return this.clone().setHost("127.0.0.1").setPort(3478)
    }

    title  () {
        return this.host() + " " + this.port()
    }

    subtitle  () {
        return this.stunNote()
    }
	
    // ice entry - for Peer options
	
    setIceDict (dict) {
	    const url = dict.url
        const parts = url.split(":")
        const type = parts[0]
        assert(type === "stun")
        const host = parts[1]
        const port = parts[2]
        this.setHost(host)
        this.setPort(port)
        return this
    }
	
	
    iceDict () {
        let url = "stun:" + this.host()
        if (this.port() !== null && this.port() !== "") {
            url += ":" + this.port()
        }
        return { url: url }
    }
    
}.initThisClass()
