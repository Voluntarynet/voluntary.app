/*
	PeerId
	
	composes and parses peerid from peer pubkey and bloomfilter
	into a string that fits peerjs requirements

*/

BMPeerId = BMNode.extend().newSlots({
    type: "BMPeerId",
    publicKeyString: null,
	bloomFilter: null,
	error: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this._remotePeers = []
        this.setTitle("Connection")
    },
    
	title: function() {
		return this.publicKeyString()
	},
	
	subtitle: function() {
		return this.encodedBloomString()
	},
	
	
	// --- public key ---
	
	encodedPublicKeyString: function() {
		return this.publicKeyString()
	},
	
	setEncodedPublicKeyString: function(aString) {
		this.setPublicKeyString(aString)
		return this
	},
	
	
	// --- bloom key ---
	
	encodedBloomString: function() {
		assert(this.bloomFilter() != null)
		var s = this.bloomFilter().exportData();
		s = s.replaceAll("+", "_0")
		s = s.replaceAll("/", "_1")
		s = s.replaceAll("=", "_2")
		return "0" + s // pad front to ensure that first character is alphanumeric (peerjs wants this)
	},
	
	setEncodedBloomString: function() {
		var filter = BMNetwork.shared().newDefaultBloomFilter()
		s = s.substr(1); // remove front padding character
		s = s.replaceAll("_0", "+")
		s = s.replaceAll("_1", "/")
		s = s.replaceAll("_2", "=")
		filter.importData(s)
		this.setBloomFilter(filter)
		return this
	},
	
	// --- to/from string ----
	
	toString: function() {
		//return this.chooseRandomPeerId()
		
		return this.encodedPublicKeyString() + "-" + this.encodedBloomString()
	},
	
	setFromString: function(aString) {
		var parts = aString.split("-")
		
		try {
			this.setEncodedPublicKeyString(parts[0])
			this.setEncodedBloomString(parts[1])
		} catch(e) {
			this.setError(e)
			console.log("PeerId.setFromString('" + aString + "') error: ", e)
			return null
		}
		
		return this
	},
	
	chooseRandomPeerId: function() {
		// NOTE: there seems to be 24 character limit on peerjs id names
		var s = ""
		for (var i = 0; i < 24; i++) {
			s = s + (Math.floor(Math.random()*1000000) % 10)
		}
		//console.log(s + " length = " + s.length)
		return s
	},
})



