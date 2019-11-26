"use strict"

/*

    BMStunServers
    
*/


BMStorableNode.newSubclassNamed("BMStunServers").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("STUN Servers")
        this.setNoteIsSubnodeCount(true)
        this.setNodeMinWidth(270)
        this.addAction("add")
        this.setCanDelete(true)
        this.setSubnodeProto(BMStunServer)
        this.setNodeCanReorderSubnodes(true)
    },

    finalize: function() {
        BMStorableNode.finalize.apply(this)
        this.bootstrap()
    },

    bootstrap: function() {
        if (!this.hasSubnodes()) {
            this.addSubnodesIfAbsent(this.bootStrapServers())
        }		
    },
    
    addServer: function (aServer) {
        return this.addSubnode(aServer)
    },
    
    servers: function () {
        return this.subnodes()
    }, 

    defaultOptions: function() {
		
        return {"iceServers": [
		    { url:"stun:stun01.sipphone.com" },
		    { url:"stun:stun.ekiga.net" },
		    { url:"stun:stun.fwdnet.net" },
		    { url:"stun:stun.ideasip.com" },
		    { url:"stun:stun.iptel.org" },
		    { url:"stun:stun.rixtelecom.se" },
		    { url:"stun:stun.schlund.de" },
		    { url:"stun:stun.l.google.com:19302" },
		    { url:"stun:stun1.l.google.com:19302" },
		    { url:"stun:stun2.l.google.com:19302" },
		    { url:"stun:stun3.l.google.com:19302" },
		    { url:"stun:stun4.l.google.com:19302" },
		    { url:"stun:stunserver.org" },
		    { url:"stun:stun.softjoys.com" },
		    { url:"stun:stun.voiparound.com" },
		    { url:"stun:stun.voipbuster.com" },
		    { url:"stun:stun.voipstunt.com" },
		    { url:"stun:stun.voxgratia.org" },
		    { url:"stun:stun.xten.com" },
        ]}	
    },

    bootStrapServers: function (dict) {
        const dicts = this.defaultOptions().iceServers
        return dicts.map((dict) => {
        	return BMStunServer.clone().setIceDict(dict) 
        })
    },

    iceEntries: function() {
	    if (this.servers()) {
		    return this.servers().map((server) => { return server.iceDict() })
	    }
	    
        console.warn(this.type() + " WARNING: using defaultOptions")
        return this.defaultOptions()
    },
	
    peerOptionsDict: function() {
        const dict = this.iceEntries() 
        //console.log("peerOptionsDict: " + JSON.stringify(dict))
        return dict
    },
    
}).initThisProto()
