
/*
  A WebRTC STUN Server 
  these help us get around NAT (Network Address Traversal) routers
  we just use these objects to maintain the list passed to new Peer()
  
  See: https://en.wikipedia.org/wiki/STUNå
*/

BMStunServer = BMStorableNode.extend().newSlots({
    type: "BMStunServer",
   	//host: 'stun.bitmarkets.org',
    host: '127.0.0.1',
    port: 3478,
	//credential: null,
	//username: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
		this.setShouldStoreItems(true)
        this.addStoredSlots(["host", "port"])
        //this.addStoredSlots(["credential", "username"])
        this.setShouldStoreItems(false)
        this.addAction("delete")
        this.setNodeMinWidth(160)
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
