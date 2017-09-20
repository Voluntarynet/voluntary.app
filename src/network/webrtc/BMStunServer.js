
/*
  A WebRTC STUN Server 
  these help us get around NAT (Network Address Traversal) routers
  we just use these objects to maintain the list passed to new Peer()
  
  See: https://en.wikipedia.org/wiki/STUNå
*/

"use strict"

window.BMStunServer = BMFieldSetNode.extend().newSlots({
    type: "BMStunServer",
   	//host: 'stun.bitmarkets.org',
    host: "",
    port: "", 
	//credential: null,
	//username: null,
	note: "",
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
        this.addAction("delete")
        this.setNodeMinWidth(500)

		this.addStoredField(BMField.clone().setKey("host").setValueMethod("host")).setValueIsEditable(true)
		this.addStoredField(BMField.clone().setKey("port").setValueMethod("port")).setValueIsEditable(true)
		this.addStoredField(BMField.clone().setKey("note").setValueMethod("note")).setValueIsEditable(true)
    },

    title: function () {
        return this.host() 
    },

    subtitle: function () {
        return this.port()
    },
	
	// ice entry - for Peer options
	
	setIceDict: function(dict) {
	    var url = dict.url
		var parts = url.split(":")
		var type = parts[0]
		assert(type == "stun")
		var host = parts[1]
		var port = parts[2]
		this.setHost(host)
		this.setPort(port)
		return this
	},
	
	
	iceDict: function() {
		var url = "stun:" + this.host()
		if (this.port() != null && this.port() != "") {
			url += ":" + this.port()
		}
		return { url: url }
	},
})
