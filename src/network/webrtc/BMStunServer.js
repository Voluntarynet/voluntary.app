
/*
  A WebRTC STUN Server 
  these help us get around NAT (Network Address Traversal) routers
  we just use these objects to maintain the list passed to new Peer()
  
  See: https://en.wikipedia.org/wiki/STUNå
*/

BMStunServer = BMFieldSetNode.extend().newSlots({
    type: "BMStunServer",
   	//host: 'stun.bitmarkets.org',
    host: "",
    port: null, 
	//credential: null,
	//username: null,
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
        this.setNodeMinWidth(300)

		this.addStoredField(BMField.clone().setKey("host").setValueMethod("host")).setValueIsEditable(true)
		this.addStoredField(BMField.clone().setKey("port").setValueMethod("port")).setValueIsEditable(true)
		this.addStoredField(BMField.clone().setKey("notes").setValueMethod("notes")).setValueIsEditable(true)
    },

    title: function () {
        return this.host()
    },  

	setTitle: function(aString) {
		this.setHost(aString)
		return this
	},
    
    subtitle: function () {
        return this.port()
    },

	setSubtitle: function(aString) {
		this.setPost(aString)
		return this
	},
	
	// ice entry - for Peer options
	
	setIceEntry: function(dict) {
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
	
	asIceEntry: function() {
		var url = "stun:" + this.host()
		if (this.port() != null) {
			url += ":" + this.port()
		}
		return { url: url }
	},

})
