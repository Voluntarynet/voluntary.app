"use strict"

window.IndexedDBTx = ideal.Proto.extend().newSlots({
    type: "IndexedDBTx",
    dbFolder: null,
    objectStore: null,
    tx: null,
    requests: null,
    isCommitted: false,
    debug: false,
}).setSlots({
    init: function () {
        this.setRequests([])
    },

    db: function() {
        return this.dbFolder().db()
    },
    
    storeName: function() {
        return this.dbFolder().storeName()
    },
	
    // --- being and commit ---

    assertNotCommitted: function() {
	    assert(this.isCommitted() == false)
    },

    begin: function() {
	    this.assertNotCommitted()
	
	    var tx = this.db().transaction(this.storeName(), "readwrite")
        this.setTx(tx)

        var requestStack = this.debug() ? new Error().stack : null
        tx.onerror = (event) => {
		    if (requestStack) { 
                console.log("error stack ", requestStack)
            }
		  	throw new Error("tx error " + event.target.error)
        }
		        
        var objectStore = tx.objectStore(this.storeName());
        this.setObjectStore(objectStore)
        
        return this
    },
	
    abort: function() {
	    this.assertNotCommitted()
	    this.tx().abort()
	    return this
    },
	
    commit: function() {
	    this.setIsCommitted(true)
	    return this
    },
	
    // --- helpers ---
	
    hasKey: function(key) {
	    var domStringList = this.objectStore().indexNames
	    var hasKey = domStringList.contains(key) 
	    console.log("domStringList.length : ", domStringList.length)
	    console.log("domStringList['" + key + "'] exists ", hasKey)
	    return hasKey
    },
	
    pushRequest: function(aRequest) {
	    this.assertNotCommitted()

        var requestStack = this.debug() ? new Error().stack : null
        aRequest.onerror = (event) => {
		    var fullDescription = aRequest.description + " on objectStore [" + this.storeName() + "] " + event.target.error
		    if (requestStack) { 
                console.log("error stack ", requestStack)
            }
		    console.warn(fullDescription)
		  	throw new Error(fullDescription)
        }
	    this.requests().push(aRequest)
	    return this
    },
	
    entryForKeyAndValue: function(key, object) {
        if (typeof(object) == "null" || typeof(object) == "undefined") {
            throw new Error(this.type() + ".entryForKeyAndValue('" + key + "', ...) can't add null value")
        }
		
        var v = JSON.stringify(object)
        if (v == null) {
            throw new Error("can't add null value")
        }
		
        return { key: key, value: v }
    },
	
    // --- operations ----
	
    atPut: function(key, object) {
	    this.assertNotCommitted()

        if (this.hasKey(key)) {
            this.atUpdate(key, object)
        } else {
            this.atAdd(key, object)
        }
        return this
    },
	
    atAdd: function(key, object) { 
	    this.assertNotCommitted()

        var entry = this.entryForKeyAndValue(key, object)
        var request = this.objectStore().add(entry);
        request._action = "add"
        request._key = key 
        this.pushRequest(request)
        return this
    },

    atUpdate: function(key, object) {
	    this.assertNotCommitted()

        var entry = this.entryForKeyAndValue(key, object)
        var request = this.objectStore().put(entry);
        request._action = "put"
        request._key = key
        this.pushRequest(request)
        return this
    },
    
    removeAt: function(key) {
	    this.assertNotCommitted()

        var request = this.objectStore().delete(key);
        request._action = "remove"
        request._key = key
        this.pushRequest(request)
        return this
    },
    
})



