
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
    
    asyncOpenIfNeeded: function(callback) {
        if (this.db() == null) {
            this.asyncOpen(callback)
        }
    },
    
    asyncOpen: function(callback) {
		//console.log(this.type() + " asyncOpen")
		
        var request = window.indexedDB.open(this.path(), 2);
        
        var self = this
        
        request.onerror = function(event) {
            console.log(self.type() + " open db error ", event);
        };
         
        request.onupgradeneeded = function(event) { 
			console.log(self.type() + " onupgradeneeded")

			var db = event.target.result;

			db.onerror = function(event) {
				console.log("db error ", event)
			};

			self.setDb(db)

			var objectStore = db.createObjectStore(self.storeName(), { keyPath: "key" }, false);          
			//self.setObjectStore(objectStore);
			objectStore.createIndex("key", "key", { unique: true });
        };

        request.onsuccess = function (event) {
              //console.log(self.type() + " db open onsuccess ", event)
              self.setDb(event.target.result)
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
		var self = this
		this.asyncAt(key, function (oldValue) {
			if (oldValue == null) {
				self.atAdd(key, value)
			} else {
				self.atUpdate(key, value)
			}
			
			if (callback) {
				callback()
			}
		})
	},
	
    atAdd: function(key, object) { 
        //console.log(this.type() + " atAdd ", key, object)

		if (object == null) {
			throw new Error("can't add null value 1")
		}
		//assert(typeof(object) == "string")
        var v = JSON.stringify(object)
		if (v == null) {
			throw new Error("can't add null value 2")
		}
        var entry = { key: key, value: v }
        var tx = this.db().transaction(this.storeName(), "readwrite")

		tx.onerror = function(event) {
		  	throw new Error("atAdd " + key + " error ", event)
		};
		
        var objectStore = tx.objectStore(this.storeName());
        var request = objectStore.add(entry);

		request.onerror = function (event) {
		  	throw new Error("objectStoreRequest atUpdate " + key + " error ", event)
		}
		
        return this
    },

    atUpdate: function(key, object) {
		//assert(typeof(object) == "string")
        var v = JSON.stringify(object)
        //console.log(this.type() + " atPut ", key, v)
        var entry = { key: key, value: v }
        var tx = this.db().transaction(this.storeName(), "readwrite")

		tx.onerror = function(event) {
		  	throw new Error("atUpdate " + key + " error ", event)
		};
		
        var objectStore = tx.objectStore(this.storeName());
        var request = objectStore.put(entry);

		request.onerror = function (event) {
		  	throw new Error("objectStoreRequest atUpdate " + key + " error ", event)
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
        
        request.onerror = function(event) {
            console.log("asyncAt onerror", event)
			throw new Error("asyncAt onerror", event)
            callback(null)
        };
        
        request.onsuccess = function(event) {
            //console.log("asyncAt onsuccess ", event)
            if (request.result) {
                //console.log("asyncAt onsuccess request.result ", request.result)
                var entry = request.result
                var value = JSON.parse(entry.value)
                callback(value)
            } else {
                callback(null)
            }
        };
        
        return this
    },

    asyncKeys: function(callback) {
        this.asyncAsJson(function (dict) {
            
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
        this.asyncAsJson(function (dict) {
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
        var self = this

        var cursorRequest = self.db().transaction(self.storeName()).objectStore(self.storeName()).openCursor()
        var dict = {}
    
        cursorRequest.onsuccess = function(event) {
            var cursor = event.target.result;

            if (cursor) {
                dict[cursor.value.key] = JSON.parse(cursor.value.value)
                cursor.continue();
            } else {
                //console.log(self.type() + " asyncAsJson returning dict ", JSON.stringify(dict))
                callback(dict)
            }
        };
        
        cursorRequest.onerror = function(event) {
            console.log(self.type() + " asyncAsJson cursorRequest.onerror ", event)
            throw newError("error requesting cursor")
        }
    },
    
    show: function() {
		var self = this
        this.asyncAsJson(function (json) {
	        console.log(self.type() + " " + self.path() + " = " + JSON.stringify(json, null, 2))

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
        var self = this
        this.asyncKeys(function (keys) {
			keys.forEach(function (key) {
            	self.asyncRemoveAt(key)
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
		var self = this
		
		request.onerror = function(event) {
  			console.log(self.type() +  "Error deleting '" + self.storeName() + "'");
		}
 
		request.onsuccess = function(event) {
			console.log(self.type() + " deleted successfully '" + self.storeName()  + "'");
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


