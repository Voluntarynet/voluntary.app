"use strict"

/*
	PeerId
	
	composes and parses peerid from peer pubkey and bloomfilter
	into a string that fits peerjs requirements

*/

window.BMPeerId = class BMPeerId extends BMNode {
    
    initPrototype () {
        this.newSlot("publicKeyString", null)
        this.newSlot("bloomFilter", null)
        this.newSlot("error", null)
    }

    init () {
        super.init()
        //this._remotePeers = []
        this.setTitle("Connection")
    }
    
    title () {
        return this.publicKeyString()
    }
	
    subtitle () {
        return this.encodedBloomString()
    }
	
    // --- public key ---
	
    encodedPublicKeyString () {
        return this.publicKeyString()
    }
	
    setEncodedPublicKeyString (aString) {
        this.setPublicKeyString(aString)
        return this
    }
	
	
    // --- bloom key ---
	
    /*
	encodedBloomString () {
		assert(this.bloomFilter() !== null)
		let s = this.bloomFilter().exportData();
		s = s.replaceAll("+", "_0")
		s = s.replaceAll("/", "_1")
		s = s.replaceAll("=", "_2")
		return "0" + s // pad front to ensure that first character is alphanumeric (peerjs wants this)
	},
	
	setEncodedBloomString (s) {
		const filter = BMNetwork.shared().newDefaultBloomFilter()
		let s = s.substr(1); // remove front padding character
		s = s.replaceAll("_0", "+")
		s = s.replaceAll("_1", "/")
		s = s.replaceAll("_2", "=")
		filter.importData(s)
		this.setBloomFilter(filter)
		return this
	},
	*/
	
    encodedBloomString () {
        assert(this.bloomFilter() !== null)
        return this.bloomFilter().serialized()
    }
	
    setEncodedBloomString (s) {
        const filter = BMNetwork.shared().newDefaultBloomFilter().unserialized(s)
        this.setBloomFilter(filter)
        return this
    }
	
    // --- to/from string ----
	
    toString () {
        //return this.chooseRandomPeerId()
		
        return this.encodedPublicKeyString() + "-" + this.encodedBloomString()
    }
	
    setFromString (aString) {
        const parts = aString.split("-")
        const pubkey = parts[0]
        const bloom = parts[1] // open relay blooms are all 1s
		
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
    }
	
    chooseRandomPeerId () {
        let s = ""
        const max = 10
        for (let i = 0; i < max; i++) {
            s = s + (Math.floor(Math.random()*1000000) % 10)
        }
        return s
    }
	
    /*
	matchesPeerId (otherPeerId) {
	    this.bloomFilter().
	},
    */
    
}.initThisClass()



