"use strict"

/*

    SyncDB

    An atomic persistent dictionary implemented as 
    a read & write cache on top of IndexedDB so we can do synchronous reads and writes
    instead of dealing with IndexedDB's async API.

	On open, it reads the entire db into a read cache dictionary.

    - keys and values are assumed to be strings

	- at(key) first checks the writeCache beforing checking the readCache
	
	- begin() - writes can only be done after calling begin() or an exception is raised
    - atPut(key, value) & removeAt(key)
        writes/removes are to the writeCache 
        writeCache format is: "key" -> { _value: "", _isDelete: aBool }
	- commit() flushes writeCache to indexedDBFolder, and updates readCache
	
	- any exception between begin and commit should halt the app and require a restart to ensure consistency
	
    TODO: auto sweep after a write if getting full?
    TODO: update keys, values and size method to use writeCache? Or just assert they are out of tx?

    Atomic Storage protocol:

    	asyncOpen()
		isOpen()
		begin()
		commit()
		at(key) // return dict
		atPut(key, dict)
		removeAt(key)
        clear()
        
*/

window.SyncDB = class SyncDB extends ProtoClass {
    static initClass () {
        this.newSlots({
            name: "SyncDB", // default name
            idb: null,
            readCache: null,
            writeCache: null,
            isOpen: false,
        })
    }

    init() {
        super.init()
        this.setReadCache({})
        this.setIdb(IndexedDBFolder.clone())
        //this.setIsDebugging(true)
    }

    setName (aName) {
        this.idb().setPath(aName)
        return this
    }

    // open

    asyncOpen (callback) {
        //console.log("SyncDB asyncOpen()")
        this.idb().asyncOpenIfNeeded( () => { this.onOpen(callback) })
        return this
    }
	
    onOpen (callback) {
        // load the cache
        //console.log("SyncDB didOpen() - loading cache")
		
        this.idb().asyncAsJson( (dict) => {
            //	console.log("SyncDB didOpen() - loaded cache")
            this._readCache = dict
            this.setIsOpen(true)
            if (callback) {
                callback()
            }
            //this.verifySync()
        })
    }
	
    assertOpen () {
        assert(this.isOpen())
        return this
    }
	
    // read

    keys () {
        this.assertOpen()
        return Object.keys(this._readCache);
    }
	
    values () {
        this.assertOpen()
        return Object.values(this._readCache);
    }
	
    size () {
        this.assertOpen()
        return this.keys().length
    }	
		
    clear () {
        //throw new Error("SyncDB clear")
        this._readCache = {}
        this.idb().asyncClear()
    }
	
    asJson () {
        // WARNING: this can be slow for a big store!
        return JSON.stringify(this._readCache)
    }
	
    verifySync () {
        const readCache = this._readCache
        this._isSynced = false
        this.idb().asyncAsJson( (json) => {
            let hasError = false
			
            for (let k in json) {
                if ( !readCache.hasOwnProperty(k) ) {
                    //console.log("syncdb not in sync with idb - sdb missing key " + k)
                    hasError = true
                } else if ( json[k] !== readCache[k] ) {
                    //console.log("syncdb not in sync with idb - diff values for key " + k )
                    hasError = true
                }
				
                if ( !json.hasOwnProperty(k) || !readCache.hasOwnProperty(k) ) {
                    hasError = true
                }
            }
			
			
            for (let k in readCache) {
                if ( !json.hasOwnProperty(k) ) {
                    //console.log("syncdb not in sync with idb - idb missing key " + k)
                    hasError = true
                } else if ( json[k] !== readCache[k] ) {
                    //console.log("syncdb not in sync with idb - diff values for key " + k )
                    hasError = true
                }
				
                if ( !json.hasOwnProperty(k) || !readCache.hasOwnProperty(k) ) {
                    hasError = true
                }
            }
			
            if (hasError) {
                //console.log("adding sync timeout")
                setTimeout( () => {
                    this.verifySync()
                }, 1000)
                //console.log("idb/sdb SYNCING")
            } else {
                console.log("SyncDB SYNCED")
                this._isSynced = true
                //this.idb().show()
                //console.log("syncdb idb json: ", JSON.stringify(json, null, 2))
            }
			
            /*
			if(JSON.stableStringify(json) === JSON.stableStringify(this._readCache)) {
				console.log("syncdb in sync with idb")
			} else {
				console.log("---- out of sync ---")
				console.log("idb: " + JSON.stableStringify(json))
				console.log("sdb: " + JSON.stableStringify(this._readCache))
				throw new Error("syncdb not in sync with idb")
			}
			*/
        })
    }
	
    // stats
	
    totalBytes () {
        let byteCount = 0
        this._readCache.forEachKV((k, v) => {
            byteCount += k.length + v.length
        })
        return byteCount
    }
	
    // transactions
	
    hasBegun () {
	    return (this.writeCache() !== null)
    }
	
    assertInTx () {
	    assert(this.hasBegun())
    }

    assertNotInTx () {
	    assert(!this.hasBegun())
    }
	
    begin () { // public
	    this.assertNotInTx()
	
        if (this.isDebugging()) {
            console.log("---- " + this.type() + " begin tx ----")
        }
		
	    this.setWriteCache({})
	    return this
    }
	
    hasWrites () {
        return Object.keys(this._writeCache).length !== 0
    }
	
    commit () { // public
	    // push to indexedDB tx and to SyncDb's read cache
	    // TODO: only push to read cache on IndexedDB when tx complete callback received,
	    // and block new writes until push to read cache
	    
	    this.assertInTx()
	    const tx = this.idb().newTx()
	    tx.begin()
	    
	    let count = 0
        
        this._writeCache.forEachKV((k, entry) => {
            if (entry._isDelete) {
                tx.removeAt(k)
                delete this._readCache[k]
                if (this.isDebugging()) {
                    this.debugLog(" delete ", k)
                }
            } else {
                const v = entry._value
                //tx.atPut(k, v)
                
                if (this._readCache.hasOwnProperty(k)) {
                    tx.atUpdate(k, v)
                    if (this.isDebugging()) {
                        this.debugLog(" update ", k)
                    }
                } else {
                    tx.atAdd(k, v)
                    if (this.isDebugging()) {
                        this.debugLog(" add ", k)
                    }
                }
                
                this._readCache[k] = entry._value
            }
            count ++
        })
		
		 // indexeddb commits on next event loop but this "commit" is 
		 // a sanity check - it raises exception if we attempt to write more to the same tx 
		 
        tx.commit() 
		
        if (this.isDebugging()) {
            console.log("---- " + this.type() + " committed tx with " + count + " writes ----")
        }
		
        // TODO: use commit callback to clear writeCache instead of assuming it
        // will complete and setting it to null here
        this._writeCache = null
        return count
    }
	
    // NEW
	
    hasKey(key) { // public
        this.assertOpen()
        return this._readCache.hasOwnProperty(key);
    }
	
    at(key) { // public
        this.assertOpen()
		
        if (this._writeCache) {
    		const e = this._writeCache[key]
    		if (e) {
    		    if (e._isDelete) {
    		        return null
    		    } else {
    		        return e._value
    		    }
    		}
    	}
		
        return this._readCache[key]
    }
	
    atPut (key, value) { // public
        assert(Type.isString(key))
        assert(Type.isString(value))
        
        this.assertOpen()
	    this.assertInTx()
	    
	    if (!(this._writeCache.hasOwnProperty(key)) && this._readCache[key] === value) {
	        return
	    }
	    
        this._writeCache[key] = { _value: value }
    }
	
    removeAt (key) {
        this.assertOpen()
	    this.assertInTx()
	    
	    if ( !this._writeCache.hasOwnProperty(key) && !this._readCache.hasOwnProperty(key) ) {
	        return
	    }
	    
        this._writeCache[key] = { _isDelete: true }
    }

}.initThisClass()

