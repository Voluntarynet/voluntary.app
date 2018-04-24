"use strict"

window.BMRemotePeers = BMNode.extend().newSlots({
    type: "BMRemotePeers",
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        
        this.setTitle("peers")
        this.setNoteIsSubnodeCount(true)

		this.createSubnodeIndex()
    },
	
	closeAll: function() {
        //this.setStatus("closing...")
		this.subnodes().forEach((peer) => { peer.close() })
		this.removeAllSubnodes()
		return this
	},

	showPeers: function() {
		console.log(this.typeId() + ".showPeers()")
		this.subnodes().forEach((peer) => {
			console.log("    ", peer.hash())
		})
	},

	setPeerIds: function(ids) {
		//console.log(this.typeId() + ".setPeerIds(\n" + ids.join("\n") + "\n)")
				
		// remove peers not in ids
		this.subnodes().forEach((peer) => {
			if(!ids.contains(peer.hash())) {
				if (!peer.isConnected()) {
					this.removeSubnode(peer)
				}
			}
		})
		
		// add a peer for each new id
		ids.forEach((id) => {
			if (!this.hasSubnodeWithHash(id)) {
				this.addRemotePeerForId(id)
			}
		})
		
        this.connectToMatchingPeerIds()
	},
    
    serverConnection: function() {
        return this.parentNode()
    },
    
	addRemotePeerForId: function(id) {
		var peer = this.subnodeWithHash(id)
		if (!peer) {
		 	peer = BMRemotePeer.clone().setPeerIdString(id).setServerConnection(this.serverConnection())
			this.addSubnode(peer)
		}
		return peer
	},
    
    connectToMatchingPeerIds: function () {
        this.subnodes().forEach((remotePeer) => { 
			// TODO: add max connections limit? 
			// have peer limit overly friendly blooms?
			remotePeer.connectIfMayShareContacts() 
		})
        return this
    },

    connectedRemotePeers: function () {
        return this.subnodes().filter((remotePeer) => {
            return remotePeer.isConnected()
        })        
    },
})
