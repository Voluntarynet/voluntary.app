
IndexedDBFolder = ideal.Proto.extend().newSlots({
    type: "IndexedDBFolder",
    path: "/", // path should end with pathSeparator
    pathSeparator: "/",
    //debug: true,
    db: null,
    //objectStore: null,
}).setSlots({
    init: function () {
    },
    
    storeName: function() {
        return this.path()
    },
    
    root: function() {
        if (!IndexedDBFolder._root) {
            IndexedDBFolder._root = IndexedDBFolder.clone()
           // IndexedDBFolder._root.rootShow()
        }
        return IndexedDBFolder._root
    },
    
    isOpen: function() {
        return (this.db() != null) 
    },
    
    asyncOpenIfNeeded: function(callback) {
        if (this.db() == null) {
            this.asyncOpen(callback)
        }
    },
    
    asyncOpen: function(callback) {
		//console.log(this.type() + " asyncOpen")
		
        var request = window.indexedDB.open(this.path(), 2);
        
        
        request.onerror = (event) => {
            console.log(this.type() + " open db error ", event);
        };
         
        request.onupgradeneeded = (event) => { 
			console.log(this.type() + " onupgradeneeded")

			var db = event.target.result;

			db.onerror = function(event) {
				console.log("db error ", event)
			};

			this.setDb(db)

			var objectStore = db.createObjectStore(this.storeName(), { keyPath: "key" }, false);          
			//this.setObjectStore(objectStore);
			objectStore.createIndex("key", "key", { unique: true });
        };

        request.onsuccess =  (event) => {
              //console.log(this.type() + " db open onsuccess ", event)
              this.setDb(event.target.result)
              if (callback) {
                  callback()
              }
        };
        return this
    },
    
    // paths
    
    folderAt: function(pathComponent) { 
        assert(!pathComponent.contains(this.pathSeparator())) 
        var db = IndexedDBFolder.clone().setPath(this.path() + pathComponent + this.pathSeparator())
        return db
    },
    
    pathForKey: function(key) {
        //assert(!key.contains(this.pathSeparator()))
        return this.path() + key
    },
            
    // writing
    

	asyncAtPut: function(key, value, callback) {
		this.asyncAt(key,  (oldValue) => {
		    var stack = new Error().stack
		    
		    try {
    			if (typeof(oldValue) == "undefined") {
    				this.atAdd(key, value)
    			} else {
    				this.atUpdate(key, value)
    			}
		    } catch(e) {
		        console.log(this.type() + " asyncAtPut('" + key + "') stack ", stack)
		    }
			
			if (callback) {
				callback()
			}
		})
	},
	
    atAdd: function(key, object) { 
        //console.log(this.type() + " atAdd ", key, object)

		if (typeof(object) == "null" || typeof(object) == "undefined") {
			throw new Error(this.type() + ".atAdd('" + key + "') can't add null value")
		}
		
		//assert(typeof(object) == "string")
        var v = JSON.stringify(object)
		if (v == null) {
			throw new Error("can't add null value 2")
		}
        var entry = { key: key, value: v }
        var tx = this.db().transaction(this.storeName(), "readwrite")

        var requestStack = new Error().stack

		tx.onerror = (event) => {
		    var errorDescription = this.type() + ".atAdd('" + key + "') tx error " +  event.target.error
		    console.log(errorDescription)
		    //console.log("requestStack: ", requestStack)
		  	//throw new Error(errorDescription)
		}
		
        var objectStore = tx.objectStore(this.storeName());
        var request = objectStore.add(entry);
        
		request.onerror = (event) => {
		    var errorDescription = this.type() + ".atAdd('" + key + "') objectStore [" + this.storeName() + "] request.onerror " + event.target.error
		    console.log(errorDescription)
		    //console.log("requestStack: ", requestStack)
		  	//throw new Error(errorDescription)
		}
		
        return this
    },

    atUpdate: function(key, object) {
		if (typeof(object) == "null" || typeof(object) == "undefined") {
			throw new Error(this.type() + ".atUpdate('" + key + "') can't update to null/undefined")
		}
		
		//assert(typeof(object) == "string")
        var v = JSON.stringify(object)
        //console.log(this.type() + " atPut ", key, v)
        var entry = { key: key, value: v }
        var tx = this.db().transaction(this.storeName(), "readwrite")

		tx.onerror = (event) => {
		    //console.log("tx error " + event.target.error)
		  	throw new Error(this.type() + ".atUpdate('" + key + "') tx error " +  event.target.error)
		}
		
        var objectStore = tx.objectStore(this.storeName());
        var request = objectStore.put(entry);

        var requestStack = new Error().stack
		request.onerror = (event) => {
		    console.log("error event ", event)
		    console.log("error stack ", requestStack)
		  	throw new Error(this.type() + " atUpdate(" + key + ") objectStore.put error: '" + event + "'")
		}
        return this
    },
    
    
    // reading

	asyncHasKey: function(key, callback) {
		this.asyncAt(key, function (value) {
			callback(value != null)
		})
	},

    asyncAt: function(key, callback) {
        //console.log("asyncAt ", key)
        var objectStore = this.db().transaction(this.storeName()).objectStore(this.storeName());
        var request = objectStore.get(key);

        var stack = new Error().stack
        
        request.onerror = (event) => {
            console.log("asyncAt('" + key + "') onerror", event.target.error)
            callback(undefined)
        };
        
        request.onsuccess = (event) => {
            //console.log("asyncAt onsuccess ", event)
            // request.result is undefined if value not in DB
            try {
                if (typeof(request.result) != "undefined") {
                    //console.log("asyncAt('" + key + "') onsuccess request.result = ", request.result)
                    var entry = request.result
                    var value = JSON.parse(entry.value)
                    callback(value)
                } else {
                    //console.log("asyncAt('" + key + "') onsuccess request.result = ", request.result)
                    callback(undefined)
                }
            } catch (e) {
                console.log(this.type() + " asyncAt('" +  key + "') caught stack ", stack)
            }
        };
        
        return this
    },

    asyncKeys: function(callback) {
        this.asyncAsJson((dict) => {
            
            var keys = []
            for (var k in dict) {
                if (dict.hasOwnProperty(k)) {
                    keys.push(k)
                }
            }
            
            callback(keys)
                        
        })
        return this
    },
    
    asyncValues: function(callback) {
        //console.log("asyncValues start")
        this.asyncAsJson( (dict) => {
            var values = []
            for (var k in dict) {
                if (dict.hasOwnProperty(k)) {
                    values.push(dict[k])
                }
            }
            //console.log("asyncValues done callback")
            callback(values)
        })
        //console.log("asyncValues returning")
    },
    
    asyncAsJson: function(callback) {   
        //console.log("asyncAsJson start")

        var cursorRequest = this.db().transaction(this.storeName()).objectStore(this.storeName()).openCursor()
        var dict = {}
    
        cursorRequest.onsuccess = (event) => {
            var cursor = event.target.result;

            if (cursor) {
                dict[cursor.value.key] = JSON.parse(cursor.value.value)
                cursor.continue();
            } else {
                //console.log(this.type() + " asyncAsJson returning dict ", JSON.stringify(dict))
                callback(dict)
            }
        };
        
        cursorRequest.onerror = (event) => {
            console.log(this.type() + " asyncAsJson cursorRequest.onerror ", event)
            throw newError("error requesting cursor")
        }
    },
    
    show: function() {
        this.asyncAsJson((json) => {
	        console.log(this.type() + " " + this.path() + " = " + JSON.stringify(json, null, 2))

		})
    },
    
    // removing

    asyncRemoveAt: function(key, callback) {
        var request = this.db().transaction(this.storeName(), "readwrite").objectStore(this.storeName()).delete(key);
            
        request.onsuccess = function(event) {
			//console.log("idb removed key '" + key + "'")
			if (callback) {
				callback()
			}
        };

		request.onerror = function (event) {
            throw new Error("error removing key '" + key + "'")
		}

        return this
    },
    
    asyncClear: function(callback, errorCallback) {
		/*
        this.asyncKeys( (keys) => {
			keys.forEach(function (key) {
            	this.asyncRemoveAt(key)
			})
			if (callback) {
				callback()
			}
        })
		*/
		
		var transaction = this.db().transaction([this.storeName()], "readwrite");

		transaction.onerror = function(event) {
			if (errorCallback) {
				errorCallback(event)
			}
		};

		var objectStore = transaction.objectStore(this.storeName());
		var request = objectStore.clear();

		request.onsuccess = function(event) {
			if (callback) {
				callback(event)
			}
		};
	},
	
    asyncDelete: function() {
		var request = window.indexedDB.deleteDatabase(this.storeName())
		
		request.onerror = (event) => {
  			console.log(this.type() +  "Error deleting '" + this.storeName() + "'");
		}
 
		request.onsuccess = (event) => {
			console.log(this.type() + " deleted successfully '" + this.storeName()  + "'");
    	}
		
		this.setDb(null)
		
        return this
    },
    
	// test
    
    test: function() {
        var folder = IndexedDBFolder.clone()
        folder.asyncOpen(function() {
            folder.atPut("test", "x")
            
            folder.asyncAsJson(function (dict) {
                console.log("db dict = ", dict)
            })
            
            folder.asyncAt("test", function (value) {  
                console.log("read ", value)
            })
        })
        
    },
})

//IndexedDBFolder.test()


