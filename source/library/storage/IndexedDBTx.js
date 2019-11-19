"use strict"

/* 

    IndexedDBTx

    Abstraction of a single IndexedDB transaction.

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
        })

        //this.setIsDebugging(true)
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
	
	    const tx = this.db().transaction(this.storeName(), "readwrite")
        this.setTx(tx)

        const requestStack = this.isDebugging() ? new Error().stack : null
        tx.onerror = (event) => {
		    if (requestStack) { 
                console.log("error stack ", requestStack)
            }
		  	throw new Error("tx error " + event.target.error)
        }
		        
        const objectStore = tx.objectStore(this.storeName());
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
	
    pushRequest (aRequest) {
	    this.assertNotCommitted()

        const requestStack = this.isDebugging() ? new Error().stack : null
        aRequest.onerror = (event) => {
		    const fullDescription = aRequest.description + " on objectStore [" + this.storeName() + "] " + event.target.error
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
        if (Type.isNullOrUndefined(object)) {
            throw new Error(this.type() + ".entryForKeyAndValue('" + key + "', ...) can't add null value")
        }
		
        const v = JSON.stringify(object)
        if (v === null) {
            throw new Error("can't add null value")
        }
		
        return { key: key, value: v }
    }
	
    // --- operations ----
    
    /*
    hasKey (key) {
	    const domStringList = this.objectStore().indexNames
	    const hasKey = domStringList.contains(key) 
	    console.log("domStringList.length : ", domStringList.length)
	    console.log("domStringList['" + key + "'] exists ", hasKey)
	    return hasKey
    }
    */

    /*
    atPut (key, object) {
	    this.assertNotCommitted()

        if (this.hasKey(key)) {
            this.atUpdate(key, object)
        } else {
            this.atAdd(key, object)
        }
        return this
    }
    */
	
    atAdd (key, object) { 
        this.assertNotCommitted()
        
        this.debugLog(() => " add " + key )

        const entry = this.entryForKeyAndValue(key, object)
        const request = this.objectStore().add(entry);
        request._action = "add"
        request._key = key 
        this.pushRequest(request)
        return this
    }

    atUpdate (key, object) {
	    this.assertNotCommitted()

        this.debugLog(() => " atUpdate " + key)

        const entry = this.entryForKeyAndValue(key, object)
        const request = this.objectStore().put(entry);
        request._action = "put"
        request._key = key
        this.pushRequest(request)
        return this
    }
    
    removeAt (key) {
	    this.assertNotCommitted()

        this.debugLog(() => " removeAt " + key)

        const request = this.objectStore().delete(key);
        request._action = "remove"
        request._key = key
        this.pushRequest(request)
        return this
    }
    
}

window.IndexedDBTx.registerThisClass()



