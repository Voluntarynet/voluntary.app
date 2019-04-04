"use strict"

/*
	PeerId
	
	composes and parses peerid from peer pubkey and bloomfilter
	into a string that fits peerjs requirements

*/


window.BMPeerId = BMNode.extend().newSlots({
    type: "BMPeerId",
    publicKeyString: null,
    bloomFilter: null,
    error: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        //this._remotePeers = []
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
	
    /*
	encodedBloomString: function() {
		assert(this.bloomFilter() !== null)
		let s = this.bloomFilter().exportData();
		s = s.replaceAll("+", "_0")
		s = s.replaceAll("/", "_1")
		s = s.replaceAll("=", "_2")
		return "0" + s // pad front to ensure that first character is alphanumeric (peerjs wants this)
	},
	
	setEncodedBloomString: function(s) {
		let filter = BMNetwork.shared().newDefaultBloomFilter()
		s = s.substr(1); // remove front padding character
		s = s.replaceAll("_0", "+")
		s = s.replaceAll("_1", "/")
		s = s.replaceAll("_2", "=")
		filter.importData(s)
		this.setBloomFilter(filter)
		return this
	},
	*/
	
    encodedBloomString: function() {
        assert(this.bloomFilter() !== null)
        return this.bloomFilter().serialized()
    },
	
    setEncodedBloomString: function(s) {
        let filter = BMNetwork.shared().newDefaultBloomFilter().unserialized(s)
        this.setBloomFilter(filter)
        return this
    },
	
    // --- to/from string ----
	
    toString: function() {
        //return this.chooseRandomPeerId()
		
        return this.encodedPublicKeyString() + "-" + this.encodedBloomString()
    },
	
    setFromString: function(aString) {
        let parts = aString.split("-")
        let pubkey = parts[0]
        let bloom = parts[1] // open relay blooms are all 1s
		
        try {
		    if (pubkey && bloom) {
			    this.setEncodedPublicKeyString(pubkey)
			    this.setEncodedBloomString(bloom)
		    } else {
		        console.warn("WARNING: peer name '" + aString + "' doesn't contain pubkey and bloom")
		    }
        } catch(e) {
            this.setError(e)
            console.log("PeerId.setFromString('" + aString + "') error: ", e)
            return null
        }
		
        assert(this.publicKeyString() !== null)
        assert(this.bloomFilter() !== null)
        assert(this.encodedBloomString() !== null)
		
        //console.log("parsed peerid publicKeyString [" + this.publicKeyString() + "] bloom [ " + this.encodedBloomString() + "]")
		
        return this
    },
	
    chooseRandomPeerId: function() {
        let s = ""
        let max = 10
        for (let i = 0; i < max; i++) {
            s = s + (Math.floor(Math.random()*1000000) % 10)
        }
        return s
    },
	
    /*
	matchesPeerId: function(otherPeerId) {
	    this.bloomFilter().
	},
	*/
})



