"use strict"

window.IndexedDBFolder = ideal.Proto.extend().newSlots({
    type: "IndexedDBFolder",
    path: "/", // path should end with pathSeparator
    pathSeparator: "/",
    db: null,
	didRequestPersistence: false,
    debug: false,
}).setSlots({
    init: function () {
    },

	requestPersistenceIfNeeded: function() {
		if (!IndexedDBFolder.didRequestPersistence()) {
			this.requestPersistence()
		}
		return this
	},
	
	requestPersistence: function() {
		
		if (navigator.storage && navigator.storage.persist)
		  navigator.storage.persist().then((granted) => {
		    if (granted)
		      alert("Storage will not be cleared except by explicit user action");
		    else
		      alert("Storage may be cleared by the UA under storage pressure.");
		  });
		
		IndexedDBFolder.setDidRequestPersistence(true)
		
		return this
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
		if (this.debug()) {
			console.log(this.type() + " asyncOpen")
		}
		
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
/*
    asyncAt: function(key, callback) {
        //console.log("asyncAt ", key)
        var objectStore = this.db().transaction(this.storeName(), "readonly").objectStore(this.storeName());
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
*/

    
    asyncAsJson: function(callback) {   
        //console.log("asyncAsJson start")

        var cursorRequest = this.db().transaction(this.storeName(), "readonly").objectStore(this.storeName()).openCursor()
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
    
    asyncClear: function(callback, errorCallback) {
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
    
    newTx: function() {
        return IndexedDBTx.clone().setDbFolder(this)
    },
})

//IndexedDBFolder.test()


