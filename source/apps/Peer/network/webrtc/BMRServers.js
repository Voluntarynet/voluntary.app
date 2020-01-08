"use strict"

/*

    BMRServers

*/

window.BMRServers = class BMRServers extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("maxConnections", 8)
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setTitle("Rendezvous Servers")
        this.setNoteIsSubnodeCount(true)
        this.setNodeMinWidth(300)
        this.setSubnodeProto(BMRServer)
        this.addAction("add")
    }

    finalize () {
        super.finalize()
        this.bootstrap()
    }

    bootstrap () { 
        if (this.servers().length === 0) {
		    this.bootStrapServers().forEach((server) => {
	            this.addServer(server)		
	        })	
        }
    }
    
    bootStrapServers () {
        return [
            //BMRServer.clone().setHost("rendezvous9000.voluntary.net").setPort(9000),
            BMRServer.clone().setHost("peer-net-server.herokuapp.com").setPort(443).setIsSecure(true),
            //BMRServer.clone().setHost("127.0.0.1").setPort(9000) ,
            //BMRServer.clone().setHost("127.0.0.1").setPort(433) ,
        ] 
    }
    
    addServer (aServer) {
        if (!this.hasServer(aServer)) {
            this.addSubnode(aServer)
        }
        return aServer
    }
    
    hasServer (aServer) {
        return this.hasAddrDict(aServer.addrDict())
    }
    
    servers () {
        return this.subnodes()
    }
    
    network () {
        return this.parentNode()
    }
    
    subtitle () {
        return this.connectedServers().length + " of " + this.servers().length + " servers connected"
    }

    /*
    subtitle () {
        return this.connectedRemotePeerCount() + " peers"
    }
    */
    
    connectedRemotePeerCount () {
        return this.connectedServers().sum(function (server) {
            return server.connectedRemotePeerCount()
        })
    }
    
    connectedServers () {
        return this.servers().filter(function (server) { return server.isConnected() })
    }
    
    unconnectedServers () {
        return this.servers().filter(function (server) { return !server.isConnected() })
    }
    
    connectionCount () {
        return this.connectedServers().length
    }
    
    connect () {
        let unconnectedServers = this.unconnectedServers().shuffle()
        let connectionsToAdd = this.maxConnections() - this.connectionCount()
        
        for (let i = 0; i < connectionsToAdd && i < unconnectedServers.length; i ++) {
            let server = unconnectedServers[i]
            server.connect()
        }

        return this              
    }
    
    /*
    connectedRemotePeers () {
        let peers = []
        this.connectedServers().forEach(function (server) {
            peers.appendItems(server.connectedRemotePeers())
        })        
        return peers
    }
    */
    
    // sending
    
    broadcastMsg (msg) {        
        this.connectedServers().forEach(function (server) {
            server.broadcastMsg(msg)
        })
        return this
    }
    
    currentAddrMsg () {
        let msg = BMAddrMessage.clone()
        this.servers().forEach(function (server) {
            msg.addAddrDict(server.addrDict())
        })
        return msg
    }
    
    onRemotePeerConnect (remotePeer) {
        // send addr
        let msg = this.currentAddrMsg()
        this.log("sendMsg " + msg.type())
        remotePeer.sendMsg(msg)
    }
    
    hasAddrDict (addrDict) {
        return this.servers().detect(function (server) {
            return server.isAddrDict(addrDict)
        })        
    }
    
    addr (msg) {
        this.log("got addr")
        // walk the hosts and add any we don't have
        // TODO: check to see if we can connect *before* adding server
        
        let entries = msg.data()
        entries.forEach( (addrDict) => {
            if (!this.hasAddrDict(addrDict)) {
                this.addServer(BMRServer.clone().setAddrDict(addrDict))
            }
        })
    }

    // --- choosing which servers to connect to ---
	
    sortServersByDistanceToBloomFilter (aBloomFilter) {
        // distance = countOfDifferentBits(hash(serverIp).bitArrayOfBloomLength, uncompactedBloomFilterBitArray)
        // as we connect to peers whose blooms match to one or more of our ids/contacts
        // this distance metric should help minimize number of servers we need to 
        // connect to, to find friends - particularly since friends connections tend to overlap
		
        let bloomUint8Array = aBloomFilter.asUncompactedUint8BitArray();
		
        let servers = this.subnodes()
        servers.forEach((server) => { server.updateBloomDistance(bloomUint8Array) })
        let sorted = servers.slice().sort((serverA, serverB) => {
            return serverA.bloomDistance() - serverB.bloomDistance() // smallest distance first	
        })
		
        this.copySubnodes(sorted)
		
        return this
    }
    
}.initThisClass()
