"use strict"

/*

    BMConnection

*/

window.BMConnection = BMNode.extend().newSlots({
    type: "BMConnection",
    //log: null,
    connection: null,
    lastConnectionType: null,
    lastIsOnline: 0,
    debug: false,
}).setSlots({
    init: function () {
        if (BMConnection._shared) {
            throw new Error("multiple instances of " + this.type() + " singleton")
        }
		
        BMNode.init.apply(this)
		
        this.setTitle("Connection")
        this.setNodeMinWidth(200)

        //this.setServers(NodeStore.shared().rootInstanceWithPidForProto("_servers", BMRServers))
        //this.addSubnode(this.servers())
        
        let con = navigator.connection || navigator.mozConnection || navigator.webkitConnection

        if (!con) {
            console.warn("Looks like this browser (IE or Safari>) doesn't network connection info (e.g. navigator.connection) -but this is only needed to show wifi etc connection state.")
        }

        if (con) {
            this.setConnection(con)
            this.updateLastState()  
            this.registerForConnectionChange()
        }
    },

    shared: function() {   
        return this.sharedInstanceForClass(BMConnection)
    },
    
    connectionType: function() {
        if (this.isAvailable()) {
            let s = this.connection().effectiveType
            if (s) {
                return s.toUpperCase()
            }
        }
        return "?"
    },
    
    downlink: function() {
        if (this.isAvailable()) {
            return this.connection().downlink
        }
        return null
    },
    
    rtt: function() {
        if (this.isAvailable()) {
            return this.connection().rtt
        }
        return null
    },
    
    updateLastConnectionType: function() {
        this.setLastConnectionType(this.connectionType())
        return this
    },

    updateLastState: function() {
        this.setLastConnectionType(this.connectionType())
        this.setLastIsOnline(this.isOnline())
        return this
    },    

    registerForConnectionChange: function() {
        this.connection().addEventListener("change", () => { this.onNetworkInformationChange() });
        return this
    },
	
    didComeOnline: function() {
	    return this.lastIsOnline() === false && this.isOnline() === true
    },
	
    didGoOffline: function() {
	    return this.lastIsOnline() === true && this.isOnline() === false
    },
	
    onNetworkInformationChange: function() {
        //console.log(this.typeId() + "Connection type changed from " + this.lastConnectionType() + " to " +  this.connectionType(), this.connection());	  

        NotificationCenter.shared().newNote().setSender(this).setName("onNetworkInformationChange").post()
        
        this.updateLastState()            
        this.didUpdateNode()
        
        if (this.didComeOnline()) {
            this.onNetworkOnline()
        }
        
        if (this.didGoOffline()) {
            this.onNetworkOffline()
        }
    },
	
    onNetworkOnline: function() {
        NotificationCenter.shared().newNote().setSender(this).setName("onNetworkOnline").post()
    },
    
    onNetworkOffline: function() {
        NotificationCenter.shared().newNote().setSender(this).setName("onNetworkOffline").post()
    },
	
    isOnline: function() {
        if (this.isAvailable()) {
            return this.rtt() !== 0
        }
        return false
    },
    
    connectionDescription: function() {
        if (!this.isAvailable()) {
            return "status unknown"
        }

        if (!this.isOnline()) {
            return "offline"
        }
        
        return this.connectionType() + " " + this.downlink() + "Mbps " + this.rtt() + "ms"
    },
    
    subtitle: function() {
        return this.connectionDescription()
    },

    isAvailable: function() {
        if (this.connection()) {
            return true
        }
        return false
    }
	
})

//window.BMConnection.shared() // setup shared instance, needed?

