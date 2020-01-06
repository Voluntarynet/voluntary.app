"use strict"

/* 

    IndexedDBTx

    Abstraction of a single IndexedDB transaction.

*/

window.IndexedDBTx = class IndexedDBTx extends ProtoClass {
    initPrototype () {
        this.newSlot("dbFolder", null)
        this.newSlot("objectStore", null)
        this.newSlot("tx", null)
        this.newSlot("requests", [])
        this.newSlot("isCommitted", false)
        this.newSlot("txRequestStack", null)
        this.newSlot("succcessCallback", null)
        this.newSlot("errorCallback", null)
    }

    init() {
        super.init()
        this.setIsDebugging(true)
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

    newTx () {
        assert(Type.isNullOrUndefined(this.tx()))
        const tx = this.db().transaction(this.storeName(), "readwrite")        
        tx.onerror = (event) => { this.onTxError(event) }
        tx.onsuccess = (event) => { this.onTxSuccess(event) }
        this.setTx(tx)
        return tx
    }

    begin () {
	    this.assertNotCommitted()
        this.setTxRequestStack(this.isDebugging() ? new Error().stack : null)
	    const tx = this.newTx()
        const objectStore = tx.objectStore(this.storeName());
        this.setObjectStore(objectStore)
        return this
    }

    showTxRequestStack () {
        const rs = this.txRequestStack()
        if (rs) { 
            console.log("error stack ", rs)
        }
    }

    onTxError (event) {
        this.showTxRequestStack()
        throw new Error("tx error " + event.target.error)
    }

    onTxSuccess (event) {
        console.log("indexdb tx onsuccess")
        const f = this.succcessCallback()
        if (f) {
            f()
        }
    }
	
    abort () {
	    this.assertNotCommitted()
	    this.tx().abort()
	    return this
    }
	
    commit () {
        this.setIsCommitted(true)
        this.tx().commit()
	    return this
    }
	
    // --- helpers ---
	
    pushRequest (aRequest) {
	    this.assertNotCommitted()

        const requestStack = this.isDebugging() ? new Error().stack : null
        aRequest.onerror = (event) => {
		    const fullDescription = "writing key '" + aRequest._key + "' on objectStore '" + this.storeName() + "' error: '" + event.target.error + "'"
		    console.warn(fullDescription)
		    if (requestStack) { 
                console.log("error stack ", requestStack)
            }
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
        // not efficient - only use for debugging
	    const domStringList = this.objectStore().indexNames
	    const hasKey = domStringList.contains(key) 
	    //console.log("domStringList.length : ", domStringList.length)
	    //console.log("domStringList['" + key + "'] exists ", hasKey)
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
        //assert(!this.hasKey(key))

        assert(Type.isString(key))
        assert(Type.isString(object))
        this.assertNotCommitted()
        
        this.debugLog(() => " add " + key + "'" + object + "'")

        const entry = this.entryForKeyAndValue(key, object)
        const request = this.objectStore().add(entry);
        request._action = "add"
        request._key = key 
        /*
        request.onsuccess = function(event) {
            // report the success of the request (this does not mean the item
            // has been stored successfully in the DB - for that you need transaction.onsuccess)

        }
        */
        this.pushRequest(request)
        return this
    }

    atUpdate (key, object) {
        //assert(!this.hasKey(key))

        assert(Type.isString(key))
        assert(Type.isString(object))
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
    
}.initThisClass()




