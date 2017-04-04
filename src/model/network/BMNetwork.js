//var bitcore = require("bitcore-lib")

BMNetwork = BMStorableNode.extend().newSlots({
    type: "BMNetwork",
    servers: null,
    messages: null,
    localIdentities: null,
    remoteIdentities: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setPid("_network")
        this.setTitle("Network")
        this.setNodeMinWidth(150)
        
        //this.initStoredSlotWithProto("localIdentities", BMLocalIdentities)
        //this.initStoredSlotWithProto("remoteIdentities", BMRemoteIdentities)

        //this.initStoredSlotWithProto("servers", BMRServers)
        //this.initStoredSlotWithProto("messages", BMMessages)

		this.setServers(NodeStore.shared().rootInstanceWithPidForProto("_servers", BMRServers))
		this.addItem(this.servers())
		this.setMessages(NodeStore.shared().rootInstanceWithPidForProto("_messages", BMMessages))
		this.addItem(this.messages())
		
        this.messages().asyncLoad()
    },
    
    connectedRemotePeers: function () {
        var remotePeers = []
        this.servers().connectedServers().forEach(function (server) {
            remotePeers.appendItems(server.connectedRemotePeers())
        })        
        return remotePeers
    },
    
    remotePeerCount: function() {
        return this.servers().items().sum(function (p) {
            return p.remotePeerCount()
        })
    },
    
    serverCount: function () {
        return this.servers().itemsLength()
    },
    
    subtitle: function() {
        var parts = []
        parts.push(this.serverCount() + " severs")
        parts.push(this.remotePeerCount() + " peers")
        parts.push(this.messages().messages().length + " mgs")
        return parts.join(", ")
    },
    
    broadcastMsg: function(msg) {
        // TODO: add to local inventory
        this.messages().addMessage(msg)
        //this.servers().broadcastMsg(msg)
        return this
    },
    
    addr: function(msg) {
        this.log("got addr")
        this.servers().addr(msg)
    },
    
    onRemotePeerConnect: function(remotePeer) {      
        console.log("Network onRemotePeerConnect")
          
        // servers will send addr msg
        this.servers().onRemotePeerConnect(remotePeer)
        
        // messages will send inv msg
        this.messages().onRemotePeerConnect(remotePeer)
        
        console.log("Network onRemotePeerConnect this.remotePeerCount()  = " + this.remotePeerCount() )
        //this.didUpdate()
        this.syncToView()
    },
    
    privateKeyForChannelName: function(channelName) {
        var hexName = channelName.toString(16)
        var privateKey = new bitcore.PrivateKey(hexName);
 
        return privateKey
    },
    
    idWithPubKeyString: function(pubKeyString) {        
        var pubkey = this.localIdentities().idWithPubKeyString(pubKeyString)
        if (pubkey) {
            return pubkey
        }
        return this.remoteIdentities().idWithPubKeyString(pubKeyString)
    },
    
})
