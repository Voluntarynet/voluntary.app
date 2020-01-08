"use strict"

/*

    BMRemotePeers

*/

window.BMRemotePeers = class BMRemotePeers extends BMNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        
        this.setTitle("peers")
        this.setNoteIsSubnodeCount(true)

        this.createSubnodesIndex()
    }
	
    closeAll () {
        //this.setStatus("closing...")
        this.subnodes().forEach((peer) => { peer.close() })
        this.removeAllSubnodes()
        return this
    }

    showPeers () {
        this.debugLog(".showPeers()")
        this.subnodes().forEach((peer) => {
            console.log("    ", peer.hash())
        })
    }

    setPeerIds (ids) {
        //this.debugLog(".setPeerIds(\n" + ids.join("\n") + "\n)")
				
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
    }
    
    serverConnection () {
        return this.parentNode()
    }
    
    addRemotePeerForId (id) {
        const peer = this.subnodeWithHash(id)
        if (!peer) {
		 	peer = BMRemotePeer.clone().setPeerIdString(id).setServerConnection(this.serverConnection())
            this.addSubnode(peer)
        }
        return peer
    }
    
    connectToMatchingPeerIds () {
        this.subnodes().forEach((remotePeer) => { 
            // TODO: add max connections limit? 
            // have peer limit overly friendly blooms?
            remotePeer.connectIfMayShareContacts() 
        })
        return this
    }

    connectedRemotePeers () {
        return this.subnodes().filter(p => p.isConnected())
    }

    count () {
        return this.subnodesCount()
    }
    
}.initThisClass()
