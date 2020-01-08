"use strict"

/*

    BMConnection

*/

window.BMConnection = class BMConnection extends BMNode {
    
    initPrototype () {
        this.newSlot("connection", null)
        this.newSlot("lastConnectionType", null)
        this.newSlot("lastIsOnline", 0)
    }

    init () {
        if (BMConnection._shared) {
            throw new Error("multiple instances of " + this.type() + " singleton")
        }
        super.init()
				
        this.setTitle("Connection")
        this.setNodeMinWidth(200)

        //this.setServers(this.defaultStore().rootInstanceWithPidForProto("_servers", BMRServers))
        //this.addSubnode(this.servers())
        
        const con = navigator.connection || navigator.mozConnection || navigator.webkitConnection

        if (!con) {
            console.warn("Looks like this browser (IE or Safari>) doesn't network connection info (e.g. navigator.connection) -but this is only needed to show wifi etc connection state.")
        }

        if (con) {
            this.setConnection(con)
            this.updateLastState()  
            this.registerForConnectionChange()
        }
    }
    
    connectionType () {
        if (this.isAvailable()) {
            const s = this.connection().effectiveType
            if (s) {
                return s.toUpperCase()
            }
        }
        return "?"
    }
    
    downlink () {
        if (this.isAvailable()) {
            return this.connection().downlink
        }
        return null
    }
    
    rtt () {
        if (this.isAvailable()) {
            return this.connection().rtt
        }
        return null
    }
    
    updateLastConnectionType () {
        this.setLastConnectionType(this.connectionType())
        return this
    }

    updateLastState () {
        this.setLastConnectionType(this.connectionType())
        this.setLastIsOnline(this.isOnline())
        return this
    }

    registerForConnectionChange () {
        this.connection().addEventListener("change", () => { this.onNetworkInformationChange() });
        return this
    }
	
    didComeOnline () {
	    return this.lastIsOnline() === false && this.isOnline() === true
    }
	
    didGoOffline () {
	    return this.lastIsOnline() === true && this.isOnline() === false
    }
	
    onNetworkInformationChange () {
        //this.debugLog("Connection type changed from " + this.lastConnectionType() + " to " +  this.connectionType(), this.connection());	  

        NotificationCenter.shared().newNote().setSender(this).setName("onNetworkInformationChange").post()
        
        this.updateLastState()            
        this.didUpdateNode()
        
        if (this.didComeOnline()) {
            this.onNetworkOnline()
        }
        
        if (this.didGoOffline()) {
            this.onNetworkOffline()
        }
    }
	
    onNetworkOnline () {
        NotificationCenter.shared().newNote().setSender(this).setName("onNetworkOnline").post()
    }
    
    onNetworkOffline () {
        NotificationCenter.shared().newNote().setSender(this).setName("onNetworkOffline").post()
    }
	
    isOnline () {
        if (this.isAvailable()) {
            return this.rtt() !== 0
        }
        return false
    }
    
    connectionDescription () {
        if (!this.isAvailable()) {
            return "status unknown"
        }

        if (!this.isOnline()) {
            return "offline"
        }
        
        return this.connectionType() + " " + this.downlink() + "Mbps " + this.rtt() + "ms"
    }
    
    subtitle () {
        return this.connectionType()
        //return this.connectionDescription()
    }

    isAvailable () {
        if (this.connection()) {
            return true
        }
        return false
    }
	
}.initThisClass()

//window.BMConnection.shared() // setup shared instance, needed?

