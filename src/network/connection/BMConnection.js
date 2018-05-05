
"use strict"

window.BMConnection = BMNode.extend().newSlots({
    type: "BMConnection",
    //log: null,
    connection: null,
    lastConnectionType: null,
	debug: false,
}).setSlots({
    init: function () {
		if (BMConnection._shared) {
			throw new Error("multiple instances of " + this.type() + " singleton")
		}
		
		BMConnection._shared = this

        BMNode.init.apply(this)
		
        this.setTitle("Connection")
        this.setNodeMinWidth(200)

		//this.setServers(NodeStore.shared().rootInstanceWithPidForProto("_servers", BMRServers))
		//this.addSubnode(this.servers())
		
        this.registerForConnectionChange()
    },
    
	shared: function() {
		return BMConnection._shared
	},
    
    connectionType: function() {
        return this.connection().effectiveType
    },
    
    downlink: function() {
        return this.connection().downlink
    },
    
    rtt: function() {
        return this.connection().rtt
    },
    
    updateLastConnectionType: function() {
        this.setLastConnectionType(this.connectionType())
        return this
    },

	registerForConnectionChange: function() {
        this.setConnection(navigator.connection || navigator.mozConnection || navigator.webkitConnection)
        console.log("connection: ", this.connection())
        this.updateLastConnectionType()
            
        this.connection().addEventListener('change', () => { this.onConnectionChange() });
        return this
	},
	
	onConnectionChange: function() {
        console.log(this.type() + "Connection type changed from " + this.lastConnectionType() + " to " +  this.connectionType(), this.connection());	  
        this.updateLastConnectionType()  
        this.didUpdateNode()
	},
    
    isOffline: function() {
        return this.rtt() == 0
    },
    
    connectionDescription: function() {
        if (this.isOffline()) {
            return "offline"
        }
        return this.connectionType() + " " + this.downlink() + "Mbps " + this.rtt() + "ms"
    },
    
    subtitle: function() {
        return this.connectionDescription()
    },
	
})

window.BMConnection.clone() // setup shared instance

