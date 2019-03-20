"use strict"

/* 

    IndexedDBTx

*/

window.IndexedDBTx = class IndexedDBTx extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            dbFolder: null,
            objectStore: null,
            tx: null,
            requests: [],
            isCommitted: false,
            debug: true,
        })
    }

    db () {
        return this.dbFolder().db()
    }
    
    storeName () {
        return this.dbFolder().storeName()
    }
	
    // --- being and commit ---

    assertNotCommitted () {
	    assert(this.isCommitted() === false)
    }

    begin () {
	    this.assertNotCommitted()
	
	    let tx = this.db().transaction(this.storeName(), "readwrite")
        this.setTx(tx)

        let requestStack = this.debug() ? new Error().stack : null
        tx.onerror = (event) => {
		    if (requestStack) { 
                console.log("error stack ", requestStack)
            }
		  	throw new Error("tx error " + event.target.error)
        }
		        
        let objectStore = tx.objectStore(this.storeName());
        this.setObjectStore(objectStore)
        
        return this
    }
	
    abort () {
	    this.assertNotCommitted()
	    this.tx().abort()
	    return this
    }
	
    commit () {
	    this.setIsCommitted(true)
	    return this
    }
	
    // --- helpers ---
	
    hasKey (key) {
	    let domStringList = this.objectStore().indexNames
	    let hasKey = domStringList.contains(key) 
	    console.log("domStringList.length : ", domStringList.length)
	    console.log("domStringList['" + key + "'] exists ", hasKey)
	    return hasKey
    }
	
    pushRequest (aRequest) {
	    this.assertNotCommitted()

        let requestStack = this.debug() ? new Error().stack : null
        aRequest.onerror = (event) => {
		    let fullDescription = aRequest.description + " on objectStore [" + this.storeName() + "] " + event.target.error
		    if (requestStack) { 
                console.log("error stack ", requestStack)
            }
		    console.warn(fullDescription)
		  	throw new Error(fullDescription)
        }
	    this.requests().push(aRequest)
	    return this
    }
	
    entryForKeyAndValue (key, object) {
        if (typeof(object) === "null" || typeof(object) === "undefined") {
            throw new Error(this.type() + ".entryForKeyAndValue('" + key + "', ...) can't add null value")
        }
		
        let v = JSON.stringify(object)
        if (v == null) {
            throw new Error("can't add null value")
        }
		
        return { key: key, value: v }
    }
	
    // --- operations ----
	
    atPut (key, object) {
	    this.assertNotCommitted()

        if (this.hasKey(key)) {
            this.atUpdate(key, object)
        } else {
            this.atAdd(key, object)
        }
        return this
    }
	
    atAdd (key, object) { 
	    this.assertNotCommitted()

        let entry = this.entryForKeyAndValue(key, object)
        let request = this.objectStore().add(entry);
        request._action = "add"
        request._key = key 
        this.pushRequest(request)
        return this
    }

    atUpdate (key, object) {
	    this.assertNotCommitted()

        let entry = this.entryForKeyAndValue(key, object)
        let request = this.objectStore().put(entry);
        request._action = "put"
        request._key = key
        this.pushRequest(request)
        return this
    }
    
    removeAt (key) {
	    this.assertNotCommitted()

        let request = this.objectStore().delete(key);
        request._action = "remove"
        request._key = key
        this.pushRequest(request)
        return this
    }
    
}

window.IndexedDBTx.registerThisClass()



