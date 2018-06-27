"use strict"
/*

    SyncDB

	A read&write cache on top of IndexedDB to allow us to do all synchronous reads and writes
	On open, it reads the entire db into a read cache dictionary.

	- Reads first checks the writeCache beforing checking the readCache.
	
	- begin() - writes can only be done after calling begin() or an exception is raised
	- writes/removes are to the writeCache : format: "key" -> { _value: "", _isDelete: aBool }
	- commit() flushes writeCache to indexedDBFolder, updates readCache
	
	- any exception between begin and commit should halt the app and require a restart to ensure consistency
	
    TODO: auto sweep after a write if getting full?
    
*/

window.SyncDB = class SyncDB extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            idb: null,
            readCache: null, // TODO: rename to readCache
            writeCache: null,
            isOpen: false,
            isSynced: false,
            debug: true,
        })

        this.setReadCache({})
        this.setIdb(IndexedDBFolder.clone().setPath("SyncDB"))
    }

    // open

    asyncOpen (callback) {
        //console.log("SyncDB asyncOpen()")
        this.idb().asyncOpenIfNeeded( () => { this.didOpen(callback) })
        return this
    }
	
    didOpen (callback) {
        // load the cache
        //console.log("SyncDB didOpen() - loading cache")
		
        this.idb().asyncAsJson( (dict) => {
            //	console.log("SyncDB didOpen() - loaded cache")
            this._readCache = dict
            this.setIsOpen(true)
            this.setIsSynced(true)
            if (callback) {
                callback()
            }
            //	this.verifySync()
        })
    }
	
    assertOpen () {
        assert(this.isOpen())
        return this
    }
	
    // read
	
    /*
	hasKey (key) {
		this.assertOpen()
		return key in this._readCache;
	},
	
	at (key) {
		this.assertOpen()
		return this._readCache[key]
	},
	*/

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
        // WARNING: bad performance if called frequently
        var s = JSON.stringify(this._readCache)
        return JSON.parse(this._readCache)
    }
	
    verifySync () {
        var readCache = this._readCache
        this._isSynced = false
        this.idb().asyncAsJson( (json) => {
            var hasError = false
			
            for (k in json) {
                if (!(k in readCache)) {
                    //console.log("syncdb not in sync with idb - sdb missing key " + k)
                    hasError = true
                } else if (json[k] != readCache[k]) {
                    //console.log("syncdb not in sync with idb - diff values for key " + k )
                    hasError = true
                }
				
                if (typeof(json[k]) == "undefined" || typeof(readCache[k]) == "undefined") {
                    hasError = true
                }
            }
			
			
            for (k in readCache) {
                if (!(k in json)) {
                    //console.log("syncdb not in sync with idb - idb missing key " + k)
                    hasError = true
                } else if (json[k] != readCache[k]) {
                    //console.log("syncdb not in sync with idb - diff values for key " + k )
                    hasError = true
                }
				
                if (typeof(json[k]) == "undefined" || typeof(readCache[k]) == "undefined") {
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
			if(JSON.stableStringify(json) == JSON.stableStringify(this._readCache)) {
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
        var byteCount = 0
        var dict = this._readCache
        for (let k in dict) {
		   if (dict.hasOwnProperty(k)) {
                var v = dict[k]
                byteCount += k.length + v.length
            }
        }
        return byteCount
    }
	
    // transactions
	
    hasBegun () {
	    return (this.writeCache() != null)
    }
	
    assertInTx () {
	    assert(this.hasBegun())
	    return this
    }
	
    begin () {
	    assert(!this.hasBegun())
	
        if (this.debug()) {
            console.log("---- " + this.type() + " begin tx ----")
        }
		
	    this.setWriteCache({})
	    return this
    }
	
    hasWrites () {
        return Object.keys(this._writeCache).length > 0
    }
	
    commit () {
	    // push to indexedDB tx and to SyncDb's read cache
	    // TODO: only push to read cache on IndexedDB when tx complete callback received,
	    // and block new writes until push to read cache
	    
	    this.assertInTx()
	    
	    var tx = this.idb().newTx()
	    
	    tx.begin()
	    
	    var count = 0
        var d = this._writeCache
		
        for (let k in d) {
		   if (d.hasOwnProperty(k)) {
                var entry = d[k]
                
                if (entry._isDelete) {
                    tx.removeAt(k)
                    delete this._readCache[k]
                    if (this.debug()) {
                    	console.log(this.type() + " delete ", k)
                    }
                } else {
                    var v = entry._value
                    //tx.atPut(k, v)
                    
                    if (k in this._readCache) {
                        tx.atUpdate(k, v)
                        if (this.debug()) {
                        	console.log(this.type() + " update ", k)
                        }
                    } else {
                        tx.atAdd(k, v)
                        if (this.debug()) {
                        	console.log(this.type() + " add ", k)
                        }
                    }
                    
                    this._readCache[k] = entry._value
                }
                count ++
            }
        }
		
		 // indexeddb commits on next event loop but this "commit" is 
		 // a sanity check - it raises exception if we attempt to write more to the same tx 
		 
        tx.commit() 
		
        if (this.debug()) {
            console.log("---- " + this.type() + " committed tx with " + count + " writes ----")
        }
		
        // TODO: use commit callback to clear writeCache instead of assuming it
        // will complete and setting it to null here
        this._writeCache = null
    }
	
    // NEW
	
    hasKey(key) {
        this.assertOpen()
        return key in this._readCache;
    }
	
    at(key) {
        this.assertOpen()
		
        if (this._writeCache) {
    		var e = this._writeCache[key]
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
	
    atPut (key, value) {
        this.assertOpen()
	    this.assertInTx()
	    
	    if (!(key in this._writeCache) && this._readCache[key] == value) {
	        return
	    }
	    
        this._writeCache[key] = { _value: value }
    }
	
    removeAt (key) {
        this.assertOpen()
	    this.assertInTx()
	    
	    if (!(key in this._writeCache) && !(key in this._readCache)) {
	        return
	    }
	    
        this._writeCache[key] = { _isDelete: true }
    }
	
    // TODO: update keys, values and size method to use writeCache? Or just assert they are out of tx?
	
}
    

window.SyncDB.registerThisClass()
