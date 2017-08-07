/*
	A cache on top of IndexedDB to allow us to do all synchronous reads and writes
	On open, it reads the entire db into a dictionary

	- reads are on the writeCache and then default to the cache 
	
	- begin() - writes can only be done after calling begin() or exception is raised
	- writes/removes are to the writeCache : format: "key" -> { _value: "", _isDelete: aBool }
	- commit() flushes writeCache to indexedDBFolder 
	
	- any exception between begin and commit should halt the app and require a restart to ensure consistency
	
	TODO: auto sweep after a write if getting full?
*/

SyncDB = ideal.Proto.extend().newSlots({
    type: "SyncDB",
    idb: null,
    cache: null,
    writeCache: null,
	isOpen: false,
	isSynced: false,
	debug: false,
}).setSlots({
    init: function () {
		this.setCache({})
		this.setIdb(IndexedDBFolder.clone().setPath("SyncDB"))
		//this.asyncOpen()
    },

	// open

	asyncOpen: function(callback) {
		//console.log("SyncDB asyncOpen()")
		this.idb().asyncOpenIfNeeded( () => { this.didOpen(callback) })
		return this
	},
	
	didOpen: function(callback) {
		// load the cache
		//console.log("SyncDB didOpen() - loading cache")
		
		this.idb().asyncAsJson( (dict) => {
		//	console.log("SyncDB didOpen() - loaded cache")
			this._cache = dict
			this.setIsOpen(true)
			this.setIsSynced(true)
			if (callback) {
				callback()
			}
		//	this.verifySync()
		})
	},
	
	assertOpen: function() {
		assert(this.isOpen())
		return this
	},
	
	// read
	
	/*
	hasKey: function(key) {
		this.assertOpen()
		return key in this._cache;
	},
	
	at: function(key) {
		this.assertOpen()
		return this._cache[key]
	},
	*/

	keys: function() {
		this.assertOpen()
		
		var obj = this._cache
		var keys = []
		for (var k in obj)
		{
			if (obj.hasOwnProperty(k))
			{
				keys.push(k)
			}
		}
				
		return keys;
	},
	
	values: function() {
		this.assertOpen()
		
		var obj = this._cache
		var values = []
		for (var k in obj)
		{
			if (obj.hasOwnProperty(k))
			{
				values.push(obj[k])
			}
		}

		return values;
	},
	
	size: function() {
		this.assertOpen()
		var count = 0;
		var dict = this._cache
		for (var i in dict) {
		   if (dict.hasOwnProperty(i)) {
				count++;
			}
		}
		return count
	},	
		
	clear: function() {
		throw new Error("SyncDB clear")
		this._cache = {}
		this.idb().asyncClear()
	},
	
	asJson: function() {
		// WARNING: bad performance if called frequently
		var s = JSON.stringify(this._cache)
		return JSON.parse(this._cache)
	},
	
	verifySync: function() {
		var cache = this._cache
		this._isSynced = false
		this.idb().asyncAsJson( (json) => {
			var hasError = false
			
			for (k in json) {
				if (!(k in cache)) {
					//console.log("syncdb not in sync with idb - sdb missing key " + k)
					hasError = true
				} else if (json[k] != cache[k]) {
					//console.log("syncdb not in sync with idb - diff values for key " + k )
					hasError = true
				}
				
				if (typeof(json[k]) == "undefined" || typeof(cache[k]) == "undefined") {
					hasError = true
				}
			}
			
			
			for (k in cache) {
				if (!(k in json)) {
					//console.log("syncdb not in sync with idb - idb missing key " + k)
					hasError = true
				} else if (json[k] != cache[k]) {
					//console.log("syncdb not in sync with idb - diff values for key " + k )
					hasError = true
				}
				
				if (typeof(json[k]) == "undefined" || typeof(cache[k]) == "undefined") {
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
			if(JSON.stableStringify(json) == JSON.stableStringify(this._cache)) {
				console.log("syncdb in sync with idb")
			} else {
				console.log("---- out of sync ---")
				console.log("idb: " + JSON.stableStringify(json))
				console.log("sdb: " + JSON.stableStringify(this._cache))
				throw new Error("syncdb not in sync with idb")
			}
			*/
		})
	},
	
	// stats
	
	totalBytes: function() {
		var byteCount = 0
		var dict = this._cache
		for (var k in dict) {
		   if (dict.hasOwnProperty(k)) {
				var v = dict[k]
				byteCount += k.length + v.length
			}
		}
		return byteCount
	},
	
	// transactions
	
	hasBegun: function() {
	    return (this.writeCache() != null)
	},
	
	assertInTx: function() {
	    assert(this.hasBegun())
	    return this
    },
	
	begin: function() {
	    assert(!this.hasBegun())
	    this.setWriteCache({})
	    return this
	},
	
	commit: function() {
	    // push to indexedDB tx and to SyncDb's read cache
	    // TODO: only push to read cache on IndexedDB when tx complete callback received,
	    // and block new writes until push to read cache
	    
	    this.assertInTx()
	    
	    var tx = this.idb().newTx()
	    
	    tx.begin()
	    
	    var count = 0
		var d = this._writeCache
		
		for (var k in d) {
		   if (d.hasOwnProperty(k)) {
				var entry = d[k]
                
                if (entry._isDelete) {
                    tx.removeAt(k)
                    delete this._cache[k]
					if (this.debug()) {
                    	console.log(this.type() + " delete ", k)
					}
                } else {
                    var v = entry._value
                    //tx.atPut(k, v)
                    
                    if (k in this._cache) {
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
                    
                    this._cache[k] = entry._value
                    
                }
                count ++
			}
		}
		
		 // indexeddb commits on next event loop but this "commit" is 
		 // a sanity check - it raises exception if we attempt to write more to the same tx 
		 
		tx.commit() 
		
		if (this.debug()) {
			console.log("---- " + this.type() + " commited " + count + " writes")
		}
		
		// TODO: use commit callback to clear writeCache
		this._writeCache = null
	},
	
	// NEW
	
	hasKey: function(key) {
		this.assertOpen()
		return key in this._cache;
	},
	
	at: function(key) {
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
		
		return this._cache[key]
	},
	
	atPut: function(key, value) {
		this.assertOpen()
	    this.assertInTx()
	    
	    if (!(key in this._writeCache) && this._cache[key] == value) {
	        return
	    }
	    
		this._writeCache[key] = { _value: value }
	},
	
	removeAt: function(key) {
		this.assertOpen()
	    this.assertInTx()
	    
	    if (!(key in this._writeCache) && !(key in this._cache)) {
	        return
	    }
	    
		this._writeCache[key] = { _isDelete: true }
	},
	
	// TODO: update keys, values and size method to use writeCache? Or just assert they are out of tx?
	
})
	